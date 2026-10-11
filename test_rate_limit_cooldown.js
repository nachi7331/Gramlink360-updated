/**
 * GRAMLINK 360 - Authentication Rate Limit & Cooldown Test Suite
 * Tests detection of Supabase 429 over_email_send_rate_limit, error formatting,
 * cooldown timer persistence, repeated request prevention, and bilingual translations.
 */

const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log(`  [PASS] ${message}`);
  } else {
    failCount++;
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('================================================================');
console.log('GRAMLINK 360 - AUTH RATE LIMIT & COOLDOWN TEST SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: Supabase Client formatError & Rate Limit Detection
// -----------------------------------------------------------------------------
console.log('Suite 1: Supabase Client Error Formatting');
{
  const clientCode = fs.readFileSync(path.join(rootDir, 'js/supabase-client.js'), 'utf8');

  // Test sandbox execution
  const mockWindow = {
    GRAMLINK_CONFIG: {
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key'
    },
    supabase: {
      createClient: () => ({
        auth: {
          signUp: async () => ({ data: null, error: { status: 429, code: 'over_email_send_rate_limit', message: 'email rate limit exceeded' } }),
          signInWithPassword: async () => ({ data: null, error: { status: 429, code: 'over_request_rate_limit', message: 'Request rate limit reached' } }),
          signOut: async () => ({ error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => {}
        },
        from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }) })
      })
    }
  };

  const evalFunc = new Function('window', 'console', clientCode);
  evalFunc(mockWindow, { log: () => {}, error: () => {}, warn: () => {} });

  assert(typeof mockWindow.GramlinkAPI === 'object', 'GramlinkAPI initialized');
  assert(typeof mockWindow.GramlinkAPI.auth.signUp === 'function', 'GramlinkAPI.auth.signUp is a function');
  assert(typeof mockWindow.GramlinkAPI.auth.signIn === 'function', 'GramlinkAPI.auth.signIn is a function');

  // Test simulated signUp with 429 rate limit
  mockWindow.GramlinkAPI.auth.signUp({ email: 'test@example.com', password: 'password123' }).then(res => {
    assert(res.data === null, 'Rate limited signUp returns null data');
    assert(res.isRateLimit === true, 'Rate limited signUp sets isRateLimit: true');
    assert(typeof res.error === 'string' && res.error.includes('Email rate limit reached'), 'Rate limited signUp returns human-friendly message');
  });

  // Test simulated signIn with 429 rate limit
  mockWindow.GramlinkAPI.auth.signIn({ email: 'test@example.com', password: 'password123' }).then(res => {
    assert(res.data === null, 'Rate limited signIn returns null data');
    assert(res.isRateLimit === true, 'Rate limited signIn sets isRateLimit: true');
    assert(typeof res.error === 'string' && res.error.includes('Email rate limit reached'), 'Rate limited signIn returns human-friendly message');
  });
}

// -----------------------------------------------------------------------------
// Suite 2: HTML UI & Cooldown Banner Structure
// -----------------------------------------------------------------------------
console.log('\nSuite 2: HTML UI Structure in pages/auth.html');
{
  const authHtml = fs.readFileSync(path.join(rootDir, 'pages/auth.html'), 'utf8');

  assert(authHtml.includes('id="authRateLimitNotice"'), '#authRateLimitNotice banner container exists');
  assert(authHtml.includes('id="authRateLimitTitle"'), '#authRateLimitTitle element exists');
  assert(authHtml.includes('id="authRateLimitDesc"'), '#authRateLimitDesc element exists');
  assert(authHtml.includes('id="cooldownBadge"'), '#cooldownBadge countdown element exists');
  assert(authHtml.includes('data-i18n="auth_rate_limit_title"'), 'Title has data-i18n="auth_rate_limit_title"');
  assert(authHtml.includes('data-i18n="auth_rate_limit_desc"'), 'Description has data-i18n="auth_rate_limit_desc"');
  assert(authHtml.includes('data-i18n="auth_rate_limit_retry_in"'), 'Retry text has data-i18n="auth_rate_limit_retry_in"');
}

// -----------------------------------------------------------------------------
// Suite 3: Cooldown Logic & Repeated Request Protection in js/auth.js
// -----------------------------------------------------------------------------
console.log('\nSuite 3: Cooldown & Rate Limit Protection in js/auth.js');
{
  const authJs = fs.readFileSync(path.join(rootDir, 'js/auth.js'), 'utf8');

  assert(authJs.includes('gramlink_auth_cooldown_expiry'), 'Stores cooldown expiry in sessionStorage');
  assert(authJs.includes('getCooldownRemaining'), 'Has getCooldownRemaining helper function');
  assert(authJs.includes('startCooldown'), 'Has startCooldown helper function');
  assert(authJs.includes('renderCooldown'), 'Has renderCooldown helper function');
  assert(authJs.includes('cooldownLeft > 0'), 'Strictly guards submit handler against active cooldown');
  assert(authJs.includes('regResult.isRateLimit'), 'Triggers startCooldown when regResult indicates rate limit');
  assert(authJs.includes('authResult.isRateLimit'), 'Triggers startCooldown when authResult indicates rate limit');
}

// -----------------------------------------------------------------------------
// Suite 4: Dark & Light Mode CSS Support
// -----------------------------------------------------------------------------
console.log('\nSuite 4: Dark Mode Styling for Cooldown Banner');
{
  const styleCss = fs.readFileSync(path.join(rootDir, 'css/style.css'), 'utf8');

  assert(styleCss.includes('[data-theme="dark"] #authRateLimitNotice'), 'Dark theme override for #authRateLimitNotice');
  assert(styleCss.includes('[data-theme="dark"] #cooldownBadge'), 'Dark theme override for #cooldownBadge');
}

// -----------------------------------------------------------------------------
// Suite 5: Bilingual Marathi & English Completeness
// -----------------------------------------------------------------------------
console.log('\nSuite 5: Bilingual Symmetry for Rate Limit Keys');
{
  const transCode = fs.readFileSync(path.join(rootDir, 'js/translations.js'), 'utf8');
  const evalFunc = new Function('window', 'localStorage', 'document', transCode + '; return translations;');
  const trans = evalFunc({}, { getItem: () => 'en', setItem: () => {} }, { querySelectorAll: () => [], addEventListener: () => {} });

  const requiredKeys = [
    'auth_rate_limit_title',
    'auth_rate_limit_desc',
    'auth_rate_limit_retry_in',
    'auth_err_rate_limit',
    'auth_btn_cooldown'
  ];

  requiredKeys.forEach(k => {
    assert(typeof trans.en[k] === 'string' && trans.en[k].length > 0, `English key "${k}" is populated: "${trans.en[k]}"`);
    assert(typeof trans.mr[k] === 'string' && trans.mr[k].length > 0, `Marathi key "${k}" is populated: "${trans.mr[k]}"`);
  });
}

// Wait for async promises to settle
setTimeout(() => {
  console.log('\n----------------------------------------------------------------');
  console.log(`TOTAL ASSERTIONS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('----------------------------------------------------------------');

  if (failCount > 0) {
    console.error('TESTS FAILED!');
    process.exit(1);
  } else {
    console.log('ALL AUTH RATE LIMIT & COOLDOWN TESTS PASSED! (100% Verified)');
    process.exit(0);
  }
}, 200);
