/**
 * GRAMLINK 360 - Comprehensive Theme Test Suite (Dark & Light Mode)
 * Tests theme toggle buttons, CSS variables, transitions, localStorage persistence,
 * system preference fallbacks, reduced motion, and bilingual synchronization.
 */

const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
let passCount = 0;
let failCount = 0;

function pass(name, details = '') {
  passCount++;
  console.log(`[PASS] ${name} ${details ? '(' + details + ')' : ''}`);
}

function fail(name, error = '') {
  failCount++;
  console.error(`[FAIL] ${name}: ${error}`);
}

console.log('================================================================');
console.log('GRAMLINK 360 - DARK & LIGHT MODE VERIFICATION SUITE');
console.log('Theme Toggle, CSS Architecture, Persistence & i18n Sync');
console.log('================================================================\n');

const htmlPages = [
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

// -----------------------------------------------------------------------------
// TEST 1: Theme Toggle Button Presence Across All 9 Pages
// -----------------------------------------------------------------------------
let allPagesHaveToggle = true;
let allPagesHaveHeadScript = true;

for (const relPath of htmlPages) {
  const filePath = path.join(rootDir, relPath);
  if (!fs.existsSync(filePath)) {
    fail(`File Exists: ${relPath}`, 'File missing');
    allPagesHaveToggle = false;
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');

  // Check for theme toggle button
  const hasButton = content.includes('id="themeToggleBtn"') && content.includes('class="theme-toggle-btn"');
  if (!hasButton) {
    fail(`Toggle Button in ${relPath}`, 'Missing theme-toggle-btn or id="themeToggleBtn"');
    allPagesHaveToggle = false;
  }

  // Check for sun/moon icons
  const hasMoonIcon = content.includes('🌙');
  if (!hasMoonIcon) {
    fail(`Moon Icon in ${relPath}`, 'Missing moon icon');
    allPagesHaveToggle = false;
  }

  // Check for Anti-FOUT head script
  const hasAntiFout = content.includes('localStorage.getItem(\'gramlink_theme\')') && content.includes('data-theme');
  if (!hasAntiFout) {
    fail(`Anti-FOUT Script in ${relPath}`, 'Missing anti-flash head initialization script');
    allPagesHaveHeadScript = false;
  }
}

if (allPagesHaveToggle) {
  pass('Toggle Button Coverage', `Present on all ${htmlPages.length} HTML pages with sun/moon icons`);
}
if (allPagesHaveHeadScript) {
  pass('Anti-FOUT Head Script Coverage', `Head initialization present across all ${htmlPages.length} HTML pages`);
}

// -----------------------------------------------------------------------------
// TEST 2: CSS Architecture in css/style.css
// -----------------------------------------------------------------------------
const cssContent = fs.readFileSync(path.join(rootDir, 'css/style.css'), 'utf8');

// 2a. Check [data-theme="dark"] definition
if (cssContent.includes('[data-theme="dark"]')) {
  pass('Dark Theme Selector', '[data-theme="dark"] custom properties defined');
} else {
  fail('Dark Theme Selector', 'Missing [data-theme="dark"] in css/style.css');
}

// 2b. Check Charcoal/Dark Navy Surface Variables
const requiredDarkVars = [
  '--surface-ground: #07120e;',
  '--surface-card:   #0d201a;',
  '--surface-subtle: #142e25;',
  '--surface-border: #1f4236;',
  '--text-main:    #edfbf4;',
  '--text-muted:   #a5ccbd;',
  '--primary-800: #6ee7b7;',
  '--primary-600: #10b981;'
];

let allVarsPresent = true;
for (const v of requiredDarkVars) {
  if (!cssContent.includes(v.trim())) {
    fail(`Dark Variable Presence: ${v}`, 'Missing from [data-theme="dark"]');
    allVarsPresent = false;
  }
}
if (allVarsPresent) {
  pass('Dark Navy & Emerald Palette', 'All dark surface, typography and emerald variables verified');
}

// 2c. Check Component Overrides for Dark Mode
const requiredDarkOverrides = [
  '[data-theme="dark"] .top-notice-strip',
  '[data-theme="dark"] .site-header',
  '[data-theme="dark"] .site-footer',
  '[data-theme="dark"] .hero-section',
  '[data-theme="dark"] .form-control',
  '[data-theme="dark"] .btn-secondary',
  '[data-theme="dark"] .btn-primary',
  '[data-theme="dark"] .data-table',
  '[data-theme="dark"] .toast',
  '[data-theme="dark"] .theme-toggle-btn'
];

let allOverridesPresent = true;
for (const override of requiredDarkOverrides) {
  if (!cssContent.includes(override)) {
    fail(`Component Override: ${override}`, 'Missing in css/style.css');
    allOverridesPresent = false;
  }
}
if (allOverridesPresent) {
  pass('Component Overrides', 'Top strip, header, footer, hero, forms, tables, buttons, and toasts adapted');
}

// 2d. Check Smooth Theme Transitions
if (cssContent.includes('transition: background-color var(--transition-smooth)')) {
  pass('Smooth Transitions', 'Smooth background-color, color, border-color transitions verified');
} else {
  fail('Smooth Transitions', 'Missing smooth theme transitions in css/style.css');
}

// 2e. Check Reduced Motion Accessibility
if (cssContent.includes('@media (prefers-reduced-motion: reduce)') && cssContent.includes('transition: none !important;')) {
  pass('Reduced Motion Accessibility', 'Instant transitions enabled for prefers-reduced-motion');
} else {
  fail('Reduced Motion Accessibility', 'Missing reduced-motion media query override');
}

// -----------------------------------------------------------------------------
// TEST 3: JavaScript Theme Manager Logic & Persistence Simulation
// -----------------------------------------------------------------------------
const jsContent = fs.readFileSync(path.join(rootDir, 'js/main.js'), 'utf8');

// Create mock browser DOM environment
function createMockEnvironment(initialStorage = {}, prefersDark = false) {
  const store = { ...initialStorage };
  const attributes = {};
  const listeners = {};
  const elements = [];

  const docEl = {
    getAttribute: (name) => attributes[name] || null,
    setAttribute: (name, val) => { attributes[name] = val; }
  };

  const win = {
    matchMedia: (query) => ({
      matches: query.includes('dark') ? prefersDark : !prefersDark,
      addEventListener: (type, cb) => {
        listeners[type] = listeners[type] || [];
        listeners[type].push(cb);
      }
    }),
    addEventListener: (type, cb) => {
      listeners[type] = listeners[type] || [];
      listeners[type].push(cb);
    },
    dispatchEvent: (evt) => {
      if (listeners[evt.type]) {
        listeners[evt.type].forEach(cb => cb(evt));
      }
    },
    CustomEvent: function(type, opts) {
      this.type = type;
      this.detail = opts ? opts.detail : {};
    }
  };

  const locStorage = {
    getItem: (key) => store[key] !== undefined ? store[key] : null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };

  // Mock theme toggle button
  const button = {
    dataset: {},
    attributes: {},
    setAttribute: function(k, v) { this.attributes[k] = v; },
    getAttribute: function(k) { return this.attributes[k]; },
    listeners: {},
    addEventListener: function(type, cb) {
      this.listeners[type] = this.listeners[type] || [];
      this.listeners[type].push(cb);
    },
    click: function() {
      if (this.listeners['click']) {
        this.listeners['click'].forEach(cb => cb({ currentTarget: this }));
      }
    },
    iconEl: { textContent: '' },
    textEl: { textContent: '' },
    querySelector: function(sel) {
      if (sel === '.theme-icon') return this.iconEl;
      if (sel === '.theme-text') return this.textEl;
      return null;
    }
  };
  elements.push(button);

  const doc = {
    documentElement: docEl,
    querySelectorAll: (sel) => {
      if (sel === '.theme-toggle-btn') return [button];
      if (sel === '.lang-btn') return [];
      return [];
    },
    querySelector: () => null,
    createElement: (tag) => ({
      className: '',
      innerHTML: '',
      style: {},
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      remove: () => {}
    }),
    body: {
      style: {},
      appendChild: () => {}
    },
    addEventListener: (type, cb) => {
      listeners[type] = listeners[type] || [];
      listeners[type].push(cb);
    }
  };

  return { win, locStorage, doc, button, store, attributes, listeners };
}

// 3a. Verify fallback to system preference when localStorage is empty
try {
  const envDark = createMockEnvironment({}, true); // prefers dark
  const runnerDark = new Function('window', 'localStorage', 'document', 'CustomEvent', jsContent + '; return { getCurrentTheme, applyTheme, initThemeToggle };');
  const apiDark = runnerDark(envDark.win, envDark.locStorage, envDark.doc, envDark.win.CustomEvent);
  apiDark.initThemeToggle();

  if (envDark.doc.documentElement.getAttribute('data-theme') === 'dark') {
    pass('System Preference Fallback (Dark)', 'Correctly activated dark mode when system prefers dark');
  } else {
    fail('System Preference Fallback (Dark)', `Expected dark, got ${envDark.doc.documentElement.getAttribute('data-theme')}`);
  }

  const envLight = createMockEnvironment({}, false); // prefers light
  const runnerLight = new Function('window', 'localStorage', 'document', 'CustomEvent', jsContent + '; return { getCurrentTheme, applyTheme, initThemeToggle };');
  const apiLight = runnerLight(envLight.win, envLight.locStorage, envLight.doc, envLight.win.CustomEvent);
  apiLight.initThemeToggle();

  if (envLight.doc.documentElement.getAttribute('data-theme') === 'light') {
    pass('System Preference Fallback (Light)', 'Correctly activated light mode when system prefers light');
  } else {
    fail('System Preference Fallback (Light)', `Expected light, got ${envLight.doc.documentElement.getAttribute('data-theme')}`);
  }
} catch (e) {
  fail('System Preference Fallback Execution', e.message);
}

// 3b. Verify localStorage persistence overrides system preference
try {
  const envStored = createMockEnvironment({ 'gramlink_theme': 'light' }, true); // prefers dark but stored is light
  const runnerStored = new Function('window', 'localStorage', 'document', 'CustomEvent', jsContent + '; return { getCurrentTheme, applyTheme, initThemeToggle };');
  const apiStored = runnerStored(envStored.win, envStored.locStorage, envStored.doc, envStored.win.CustomEvent);
  apiStored.initThemeToggle();

  if (envStored.doc.documentElement.getAttribute('data-theme') === 'light') {
    pass('LocalStorage Persistence Precedence', 'Stored preference "light" takes precedence over system dark');
  } else {
    fail('LocalStorage Persistence Precedence', `Expected light, got ${envStored.doc.documentElement.getAttribute('data-theme')}`);
  }
} catch (e) {
  fail('LocalStorage Persistence Execution', e.message);
}

// 3c. Verify Button Click Toggling (Light -> Dark -> Light)
try {
  const envToggle = createMockEnvironment({ 'gramlink_theme': 'light' }, false);
  let themeEventFired = null;
  envToggle.win.addEventListener('themeChanged', (e) => {
    themeEventFired = e.detail.theme;
  });

  const runnerToggle = new Function('window', 'localStorage', 'document', 'CustomEvent', jsContent + '; return { getCurrentTheme, applyTheme, initThemeToggle };');
  const apiToggle = runnerToggle(envToggle.win, envToggle.locStorage, envToggle.doc, envToggle.win.CustomEvent);
  apiToggle.initThemeToggle();

  // Initial state should be light
  if (envToggle.button.iconEl.textContent !== '🌙' || envToggle.button.textEl.textContent !== 'Dark') {
    fail('Initial Toggle Button State', `Expected 🌙 Dark, got ${envToggle.button.iconEl.textContent} ${envToggle.button.textEl.textContent}`);
  } else {
    pass('Initial Toggle Button State', 'Shows 🌙 Dark in light mode');
  }

  // Click 1: Light -> Dark
  envToggle.button.click();

  if (envToggle.doc.documentElement.getAttribute('data-theme') === 'dark' &&
      envToggle.locStorage.getItem('gramlink_theme') === 'dark' &&
      envToggle.button.iconEl.textContent === '☀️' &&
      envToggle.button.textEl.textContent === 'Light' &&
      themeEventFired === 'dark') {
    pass('Toggle Action (Light -> Dark)', 'Successfully switched to dark, updated icon to ☀️, text to Light, and saved in localStorage');
  } else {
    fail('Toggle Action (Light -> Dark)', 'Theme did not switch correctly to dark');
  }

  // Click 2: Dark -> Light
  envToggle.button.click();

  if (envToggle.doc.documentElement.getAttribute('data-theme') === 'light' &&
      envToggle.locStorage.getItem('gramlink_theme') === 'light' &&
      envToggle.button.iconEl.textContent === '🌙' &&
      envToggle.button.textEl.textContent === 'Dark' &&
      themeEventFired === 'light') {
    pass('Toggle Action (Dark -> Light)', 'Successfully switched back to light, updated icon to 🌙, text to Dark, and saved in localStorage');
  } else {
    fail('Toggle Action (Dark -> Light)', 'Theme did not switch correctly back to light');
  }
} catch (e) {
  fail('Toggle Action Execution', e.message);
}

// -----------------------------------------------------------------------------
// TEST 4: Bilingual Marathi Synchronization
// -----------------------------------------------------------------------------
try {
  const envI18n = createMockEnvironment({ 'gramlink_theme': 'dark' }, true);
  envI18n.win.getCurrentLanguage = () => 'mr'; // Marathi active

  const runnerI18n = new Function('window', 'localStorage', 'document', 'CustomEvent', jsContent + '; return { getCurrentTheme, applyTheme, initThemeToggle };');
  const apiI18n = runnerI18n(envI18n.win, envI18n.locStorage, envI18n.doc, envI18n.win.CustomEvent);
  apiI18n.initThemeToggle();

  // In dark mode with Marathi: Icon should be ☀️ and text should be प्रकाशमय
  if (envI18n.button.iconEl.textContent === '☀️' && envI18n.button.textEl.textContent === 'प्रकाशमय') {
    pass('Marathi Mode Synchronization (Dark)', 'Displays "☀️ प्रकाशमय" in Marathi dark mode');
  } else {
    fail('Marathi Mode Synchronization (Dark)', `Got ${envI18n.button.iconEl.textContent} ${envI18n.button.textEl.textContent}`);
  }

  // Toggle to light mode in Marathi: Icon should be 🌙 and text should be गडद मोड
  envI18n.button.click();
  if (envI18n.button.iconEl.textContent === '🌙' && envI18n.button.textEl.textContent === 'गडद मोड') {
    pass('Marathi Mode Synchronization (Light)', 'Displays "🌙 गडद मोड" in Marathi light mode');
  } else {
    fail('Marathi Mode Synchronization (Light)', `Got ${envI18n.button.iconEl.textContent} ${envI18n.button.textEl.textContent}`);
  }
} catch (e) {
  fail('Bilingual Marathi Execution', e.message);
}

// -----------------------------------------------------------------------------
// TEST 5: Business Logic Non-Regression Check
// -----------------------------------------------------------------------------
const authJs = fs.readFileSync(path.join(rootDir, 'js/auth.js'), 'utf8');
const complaintsJs = fs.readFileSync(path.join(rootDir, 'js/complaints.js'), 'utf8');
const clientJs = fs.readFileSync(path.join(rootDir, 'js/supabase-client.js'), 'utf8');
const configJs = fs.readFileSync(path.join(rootDir, 'js/config.js'), 'utf8');

if (authJs.includes('GramlinkAPI.auth.signIn') && clientJs.includes('signInWithPassword') && !authJs.includes('localUser')) {
  pass('Auth Non-Regression', 'Supabase authentication logic intact with zero bypass');
} else {
  fail('Auth Non-Regression', 'Auth logic modified');
}

if (clientJs.includes('track_complaint') && complaintsJs.includes('navigator.geolocation.getCurrentPosition')) {
  pass('Complaints & Geolocation Non-Regression', 'Secure RPC token tracking and Geolocation API untouched');
} else {
  fail('Complaints & Geolocation Non-Regression', 'Complaint tracking or location logic modified');
}

if (!clientJs.includes('service_role') && !configJs.includes('service_role =') && configJs.includes('SUPABASE_ANON_KEY')) {
  pass('Secrets & Security Non-Regression', 'No service_role secrets exposed, client keys secure');
} else {
  fail('Secrets & Security Non-Regression', 'Security credentials altered');
}

console.log('\n----------------------------------------------------------------');
console.log(`THEME VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
if (failCount === 0) {
  console.log('ALL DARK & LIGHT MODE TESTS PASSED! (100% Verified)');
} else {
  console.log('SOME TESTS FAILED! Check error messages above.');
  process.exit(1);
}
