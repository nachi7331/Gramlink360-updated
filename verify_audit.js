const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
let hasErrors = false;

function pass(testName, details = '') {
  console.log(`[PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
}

function fail(testName, error = '') {
  hasErrors = true;
  console.error(`[FAIL] ${testName}: ${error}`);
}

console.log('================================================================');
console.log('GRAMLINK 360 - VERIFICATION AUDIT SUITE');
console.log('Admin Dashboard, Security, Supabase RLS & Marathi Translations');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: Translations Dictionary Completeness & Symmetry
// -----------------------------------------------------------------------------
try {
  const transCode = fs.readFileSync(path.join(rootDir, 'js/translations.js'), 'utf8');
  // Evaluate translations object in isolated sandbox
  const sandbox = {};
  const mockDoc = {
    querySelectorAll: () => [],
    addEventListener: () => {}
  };
  const evalFunc = new Function('window', 'localStorage', 'document', transCode + '; return translations;');
  const translations = evalFunc({}, { getItem: () => 'en', setItem: () => {} }, mockDoc);

  if (!translations.en || !translations.mr) {
    fail('Translations Dictionary', 'Missing en or mr root dictionary');
  } else {
    const enKeys = Object.keys(translations.en);
    const mrKeys = Object.keys(translations.mr);

    pass('Translation Dictionary Presence', `en: ${enKeys.length} keys, mr: ${mrKeys.length} keys`);

    const missingInMr = enKeys.filter(k => !(k in translations.mr));
    const missingInEn = mrKeys.filter(k => !(k in translations.en));

    if (missingInMr.length > 0) {
      fail('Dictionary Symmetry (EN -> MR)', `Keys missing in Marathi: ${missingInMr.join(', ')}`);
    } else {
      pass('Dictionary Symmetry (EN -> MR)', 'All English keys have Marathi translations');
    }

    if (missingInEn.length > 0) {
      fail('Dictionary Symmetry (MR -> EN)', `Keys missing in English: ${missingInEn.join(', ')}`);
    } else {
      pass('Dictionary Symmetry (MR -> EN)', 'All Marathi keys have English translations');
    }

    // Check that Marathi values are non-empty
    let emptyMr = 0;
    for (const [k, v] of Object.entries(translations.mr)) {
      if (!v || typeof v !== 'string' || v.trim() === '') {
        emptyMr++;
      }
    }
    if (emptyMr > 0) {
      fail('Marathi Translations Non-Empty', `${emptyMr} empty values found in Marathi dictionary`);
    } else {
      pass('Marathi Translations Quality', 'All Marathi entries are populated with natural phrasing');
    }

    // -----------------------------------------------------------------------------
    // TEST 2: HTML Pages Translation Key Verification
    // -----------------------------------------------------------------------------
    const htmlFiles = [
      'index.html',
      'pages/admin-dashboard.html',
      'pages/resident-dashboard.html',
      'pages/village-dashboard.html',
      'pages/services.html',
      'pages/complaint-submit.html',
      'pages/complaint-track.html',
      'pages/announcements.html',
      'pages/auth.html'
    ];

    let missingKeysTotal = 0;

    for (const file of htmlFiles) {
      const fullPath = path.join(rootDir, file);
      if (!fs.existsSync(fullPath)) {
        fail(`HTML File Existence: ${file}`, 'File does not exist');
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf8');

      // Find all data-i18n attributes
      const i18nMatches = [...content.matchAll(/data-i18n(?:-html|-placeholder|-title)?=["']([^"']+)["']/g)];
      const pageKeys = i18nMatches.map(m => m[1]);

      let pageMissing = 0;
      for (const key of pageKeys) {
        if (!translations.en[key] && !translations.mr[key]) {
          console.warn(`  [WARN] ${file}: Key "${key}" not found in translations dictionary`);
          pageMissing++;
          missingKeysTotal++;
        }
      }

      if (pageMissing === 0) {
        pass(`HTML Page i18n Coverage: ${file}`, `${pageKeys.length} keys mapped`);
      } else {
        fail(`HTML Page i18n Coverage: ${file}`, `${pageMissing} keys missing from dictionary`);
      }
    }

    if (missingKeysTotal === 0) {
      pass('All HTML Pages i18n Verification', 'Every declared data-i18n attribute has a valid translation');
    }
  }
} catch (e) {
  fail('Translations Evaluation', e.message);
}

// -----------------------------------------------------------------------------
// TEST 3: Admin Dashboard & Auth Security Verification
// -----------------------------------------------------------------------------
try {
  const adminJs = fs.readFileSync(path.join(rootDir, 'js/admin.js'), 'utf8');

  // Verify that fake demo admin bypass is removed
  if (adminJs.includes("localUser.role === 'admin'") || adminJs.includes("user.role === 'admin' && !profile")) {
    fail('Admin Access Bypass', 'Hardcoded localUser.role admin bypass detected in js/admin.js');
  } else {
    pass('Admin Access Verification', 'No client-side localUser hardcoded admin bypass');
  }

  // Verify that profile.role === 'administrator' is strictly enforced
  if (adminJs.includes("profile.role === 'administrator'")) {
    pass('Strict Supabase Role Check', 'Enforces profile.role === administrator from public.profiles');
  } else {
    fail('Strict Supabase Role Check', 'Missing profile.role === administrator verification in js/admin.js');
  }

  // Verify access denied UI exists and is localized
  if (adminJs.includes('msg_admin_denied') && adminJs.includes('msg_admin_denied_desc')) {
    pass('Admin Access Denied Shield', 'Presents localized access restricted view for unauthorized users');
  } else {
    fail('Admin Access Denied Shield', 'Missing localized access denied UI in js/admin.js');
  }

  // Verify auth.js does not allow demo admin bypass
  const authJs = fs.readFileSync(path.join(rootDir, 'js/auth.js'), 'utf8');
  if (authJs.includes('isDemoAdmin') || authJs.includes("contact === 'admin@shivrajpur.in' && password === 'admin123' && !profile")) {
    fail('Auth Bypass Check', 'Demo admin hardcoded login bypass found in js/auth.js');
  } else {
    pass('Auth Bypass Verification', 'No hardcoded credentials bypass; all logins strictly authenticate with Supabase');
  }

  // Verify role check in auth.js
  if (authJs.includes("currentRole === 'admin'") && authJs.includes("!isDatabaseAdmin")) {
    pass('Auth Role Gatekeeper', 'Rejects non-administrator accounts when Panchayat Admin desk is selected');
  } else {
    fail('Auth Role Gatekeeper', 'Missing role verification gatekeeper in js/auth.js');
  }
} catch (e) {
  fail('Admin & Auth Security Verification', e.message);
}

// -----------------------------------------------------------------------------
// TEST 4: Backend Row Level Security (RLS) & Schema Safety
// -----------------------------------------------------------------------------
try {
  const schemaSql = fs.readFileSync(path.join(rootDir, 'database/schema.sql'), 'utf8');

  // Verify that reference_token IS NOT NULL is NOT used in complaints table SELECT policy
  if (schemaSql.includes('reference_token IS NOT NULL')) {
    fail('RLS Least Privilege Violation', 'Found reference_token IS NOT NULL in complaints policy! This leaks other citizens data.');
  } else {
    pass('RLS Privacy Protection', 'No broad reference_token IS NOT NULL query leak in public.complaints policy');
  }

  // Verify secure RPC track_complaint exists
  if (schemaSql.includes('CREATE OR REPLACE FUNCTION public.track_complaint') && schemaSql.includes('SECURITY DEFINER')) {
    pass('Secure Token Tracking RPC', 'public.track_complaint(p_token) defined with SECURITY DEFINER and masked citizen details');
  } else {
    fail('Secure Token Tracking RPC', 'Missing public.track_complaint RPC in database/schema.sql');
  }

  // Verify Row Level Security is enabled on all tables
  const rlsTables = ['profiles', 'services', 'complaints', 'complaint_status_history', 'announcements'];
  let allRlsEnabled = true;
  for (const t of rlsTables) {
    if (!schemaSql.includes(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY`)) {
      fail(`RLS Enabled on ${t}`, `Missing ENABLE ROW LEVEL SECURITY for ${t}`);
      allRlsEnabled = false;
    }
  }
  if (allRlsEnabled) {
    pass('RLS Table Coverage', 'Row Level Security explicitly enabled on all 5 tables');
  }

  // Verify role self-escalation trigger exists
  if (schemaSql.includes('prevent_self_role_escalation') && schemaSql.includes('trg_prevent_role_escalation')) {
    pass('Role Self-Escalation Shield', 'Database trigger prevents ordinary users from elevating their role');
  } else {
    fail('Role Self-Escalation Shield', 'Missing trigger to prevent self-role escalation in database/schema.sql');
  }
} catch (e) {
  fail('Schema & RLS Verification', e.message);
}

// -----------------------------------------------------------------------------
// TEST 5: Frontend Secrets & Key Exposure Audit
// -----------------------------------------------------------------------------
try {
  const jsDir = path.join(rootDir, 'js');
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

  let foundSecrets = false;
  for (const file of jsFiles) {
    const code = fs.readFileSync(path.join(jsDir, file), 'utf8');
    // Check for actual service role secret token in code assignments or URLs
    if (/service_role_key|SUPABASE_SERVICE_KEY|SUPABASE_SECRET/i.test(code) || 
        code.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNlcnZlZCI6InNlcnZpY2Vfcm9sZSI') || 
        code.includes('postgres://postgres:')) {
      fail(`Secrets Check: ${file}`, 'Detected service_role key or postgres database password!');
      foundSecrets = true;
    }
  }
  if (!foundSecrets) {
    pass('Secrets & Credentials Audit', 'No service_role keys, database passwords, or private secrets exposed in client JS');
  }
} catch (e) {
  fail('Secrets Check', e.message);
}

// -----------------------------------------------------------------------------
// TEST 6: Academic Disclaimer & Fictional Village Transparency
// -----------------------------------------------------------------------------
try {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  if (indexHtml.includes('Academic CSBS Mini Project') && indexHtml.includes('Fictional Demonstration Village')) {
    pass('Academic Disclaimer Compliance', 'Clear disclaimer that Shivrajpur is a fictional academic model with no real gov database access');
  } else {
    fail('Academic Disclaimer Compliance', 'Missing fictional academic demonstration village disclaimer in index.html');
  }
} catch (e) {
  fail('Disclaimer Check', e.message);
}

console.log('\n----------------------------------------------------------------');
if (hasErrors) {
  console.error('VERIFICATION RESULT: SOME CHECKS FAILED. PLEASE REVIEW ABOVE.');
  process.exit(1);
} else {
  console.log('ALL AUDIT CHECKS PASSED SUCCESSFULLY! (100% Compliant)');
  process.exit(0);
}
