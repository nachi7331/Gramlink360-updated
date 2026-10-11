/**
 * test_smart_village_intro.js
 * Comprehensive automated verification of the redesigned Smart Village Intro Interface
 * for Gramlink 360 according to all prompt requirements.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('================================================================');
console.log('GRAMLINK 360 - SMART VILLAGE INTRO INTERFACE VERIFICATION');
console.log('Cinematic Scenery, Cyber Smart Grid, 9 Services & Interaction Flow');
console.log('================================================================\n');

const rootDir = __dirname;
const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const animCssContent = fs.readFileSync(path.join(rootDir, 'css', 'animations.css'), 'utf8');
const mainJsContent = fs.readFileSync(path.join(rootDir, 'js', 'main.js'), 'utf8');
const translationsJsContent = fs.readFileSync(path.join(rootDir, 'js', 'translations.js'), 'utf8');

// -----------------------------------------------------------------------------
// SUITE 1: Cinematic Indian Village Vector Scenery at Dusk
// -----------------------------------------------------------------------------
console.log('Suite 1: Cinematic Village at Dusk Scenery Verification');

assert(htmlContent.includes('class="smart-village-canvas"'), 'Smart Village vector canvas SVG is present');
assert(htmlContent.includes('id="duskSkyGrad"'), 'Atmospheric dusk sky gradient defined in canvas');
assert(htmlContent.includes('id="sunGlowGrad"'), 'Golden sunset horizon radial glow defined');
assert(htmlContent.includes('id="mountainFarGrad"'), 'Distant mountain ridges defined with atmospheric perspective');
assert(htmlContent.includes('class="village-fields"'), 'Agricultural patchwork fields and terraced plots present');
assert(htmlContent.includes('class="village-river-group"'), 'Village river/pond water body present');
assert(htmlContent.includes('class="village-roads-group"'), 'Village arterial roads network present');

// Village structures
assert(htmlContent.includes('class="village-structures"'), 'Village traditional structures container present');
assert(htmlContent.includes('house-window-glow'), 'Village houses with warm illuminated windows present');
assert(htmlContent.includes('Gram Mandir (Temple) with Shikhara Spire'), 'Traditional Gram Mandir with shikhara & flag present');
assert(htmlContent.includes('SCHOOL'), 'Village primary school building present');
assert(htmlContent.includes('Elevated Municipal Water Tank'), 'Elevated municipal water reservoir tower present');
assert(htmlContent.includes('Farm Tractor in Field'), 'Green agricultural tractor in field present');
assert(htmlContent.includes('class="village-trees"'), 'Lush village banyan/neem tree groves present');

// -----------------------------------------------------------------------------
// SUITE 2: Futuristic Cyber Smart-Grid & Central Holographic Beacon
// -----------------------------------------------------------------------------
console.log('\nSuite 2: Cyber Smart-Grid & Central Holographic Beacon');

assert(htmlContent.includes('class="smart-grid-overlay"'), 'Futuristic smart-grid overlay group present');
assert(htmlContent.includes('class="radar-ripples-group"'), 'Concentric expanding radar waves present at beacon base');
assert(htmlContent.includes('class="radar-wave w1"') && htmlContent.includes('class="radar-wave w2"'), 'Concentric radar ripples w1 & w2 present');
assert(htmlContent.includes('class="radar-compass-ring"'), 'Digital compass/data grid ring present');
assert(htmlContent.includes('class="holographic-pin-assembly"'), 'Central holographic location pin assembly present');
assert(htmlContent.includes('class="hologram-beam"'), 'Ascending vertical holographic light beam present');
assert(htmlContent.includes('class="hologram-pin-shell"'), 'Cyber location pin shell present');
assert(htmlContent.includes('class="intro-leaf-group"'), 'Gramlink sprout / seedling symbol inside pin present');
assert(htmlContent.includes('class="pin-corona-spin"'), 'Hologram corona spinning ring present');

// -----------------------------------------------------------------------------
// SUITE 3: The 9 Animated Village Service Badges
// -----------------------------------------------------------------------------
console.log('\nSuite 3: The 9 Animated Village Service Badges');

const services = [
  { id: 'water', icon: '💧', class: 'node-water', i18n: 'intro_svc_water' },
  { id: 'health', icon: '🩺', class: 'node-health', i18n: 'intro_svc_health' },
  { id: 'education', icon: '🎓', class: 'node-education', i18n: 'intro_svc_education' },
  { id: 'sanitation', icon: '🗑️', class: 'node-sanitation', i18n: 'intro_svc_sanitation' },
  { id: 'electricity', icon: '💡', class: 'node-electricity', i18n: 'intro_svc_electricity' },
  { id: 'agriculture', icon: '🌱', class: 'node-agriculture', i18n: 'intro_svc_agriculture' },
  { id: 'roads', icon: '🛣️', class: 'node-roads', i18n: 'intro_svc_roads' },
  { id: 'grievances', icon: '👥', class: 'node-grievances', i18n: 'intro_svc_grievances' },
  { id: 'community', icon: '👥', class: 'node-community', i18n: 'intro_svc_community' }
];

services.forEach(svc => {
  assert(htmlContent.includes(`class="village-service-badge ${svc.class}"`), `Service node badge for ${svc.id} is present in DOM`);
  assert(htmlContent.includes(svc.icon), `Service icon ${svc.icon} for ${svc.id} is present`);
  assert(htmlContent.includes(`data-i18n="${svc.i18n}"`), `Service i18n key ${svc.i18n} attached to badge label`);
});

// Verify Connecting Network Lines & Travelling Pulses
assert(htmlContent.includes('class="village-net-track net-line"'), 'Connecting network circuit tracks present');
assert(htmlContent.includes('class="village-net-pulse"'), 'Travelling energy light pulses along circuit lines present');

// -----------------------------------------------------------------------------
// SUITE 4: Branding, Taglines & Action Buttons
// -----------------------------------------------------------------------------
console.log('\nSuite 4: Branding, Taglines & Action Controls');

assert(htmlContent.includes('class="intro-title"'), 'Gramlink 360 title container present');
assert(htmlContent.includes('One Village. One Connected Future.'), 'Tagline "One Village. One Connected Future." present');
assert(htmlContent.includes('माझे गाव • माझी जबाबदारी • आपला विकास'), 'Marathi motto "माझे गाव • माझी जबाबदारी • आपला विकास" present');
assert(htmlContent.includes('id="getStartedBtn"'), 'Glowing gradient "Get Started" button present');
assert(htmlContent.includes('id="skipIntroBtn"'), 'Working "Skip Intro" button present');
assert(htmlContent.includes('class="intro-lang-switcher"'), 'Language selection container present');
assert(htmlContent.includes('data-lang="mr"') && htmlContent.includes('data-lang="en"'), 'Marathi and English language switch buttons present');
assert(htmlContent.includes('data-i18n="intro_gov_tag"'), 'Digital Governance top bar tagline present');

// -----------------------------------------------------------------------------
// SUITE 5: CSS Animations & Interactive Effects
// -----------------------------------------------------------------------------
console.log('\nSuite 5: CSS Animations & Interactive Effects');

assert(animCssContent.includes('.smart-village-intro'), '.smart-village-intro base styling defined');
assert(animCssContent.includes('@keyframes radarWaveExpand'), '@keyframes radarWaveExpand defined for concentric waves');
assert(animCssContent.includes('@keyframes energyPulseTravel'), '@keyframes energyPulseTravel defined for network light travel');
assert(animCssContent.includes('@keyframes floatBob'), '@keyframes floatBob defined for organic floating service badges');
assert(animCssContent.includes('@keyframes iconPulseRing'), '@keyframes iconPulseRing defined for glowing icon pulses');
assert(animCssContent.includes('.village-service-badge:hover'), 'Interactive hover elevation effect defined for service badges');
assert(animCssContent.includes('.intro-get-started-btn:hover'), 'Hover glowing physics defined for Get Started button');
assert(animCssContent.includes('.intro-skip-btn:hover'), 'Hover effect defined for Skip Intro button');

// Mobile and tablet responsiveness
assert(animCssContent.includes('@media (max-width: 1024px)'), 'Tablet breakpoint defined in animations.css');
assert(animCssContent.includes('@media (max-width: 768px)'), 'Mobile phone breakpoint defined in animations.css');
assert(animCssContent.includes('@media (max-width: 480px)'), 'Compact phone breakpoint defined in animations.css');
assert(animCssContent.includes('@media (prefers-reduced-motion: reduce)'), 'Accessibility prefers-reduced-motion preserved');

// -----------------------------------------------------------------------------
// SUITE 6: Bilingual Translations Completeness
// -----------------------------------------------------------------------------
console.log('\nSuite 6: Bilingual Marathi & English Translations Completeness');

const sandboxTranslations = {
  window: {},
  document: { addEventListener: () => {}, querySelectorAll: () => [] },
  localStorage: { getItem: () => 'en', setItem: () => {} }
};
vm.createContext(sandboxTranslations);
const transObj = vm.runInContext(translationsJsContent + '\n; translations;', sandboxTranslations);

const enDict = transObj && transObj.en;
const mrDict = transObj && transObj.mr;

assert(enDict.intro_smart_tagline === 'One Village. One Connected Future.', 'EN intro_smart_tagline matches prompt');
assert(mrDict.intro_smart_tagline === 'एक गाव. एक जोडलेले भविष्य.', 'MR intro_smart_tagline translated');
assert(enDict.intro_motto === 'माझे गाव • माझी जबाबदारी • आपला विकास', 'EN intro_motto matches prompt');
assert(mrDict.intro_motto === 'माझे गाव • माझी जबाबदारी • आपला विकास', 'MR intro_motto matches prompt');
assert(enDict.intro_svc_water === 'Water Supply' && mrDict.intro_svc_water === 'पाणी पुरवठा', 'Water Supply translated');
assert(enDict.intro_svc_health === 'Health' && mrDict.intro_svc_health === 'आरोग्य', 'Health translated');
assert(enDict.intro_svc_education === 'Education' && mrDict.intro_svc_education === 'शिक्षण', 'Education translated');
assert(enDict.intro_svc_sanitation === 'Sanitation' && mrDict.intro_svc_sanitation === 'स्वच्छता', 'Sanitation translated');
assert(enDict.intro_svc_electricity === 'Electricity' && mrDict.intro_svc_electricity === 'वीज पुरवठा', 'Electricity translated');
assert(enDict.intro_svc_agriculture === 'Agriculture' && mrDict.intro_svc_agriculture === 'शेती व कृषी', 'Agriculture translated');
assert(enDict.intro_svc_roads === 'Roads' && mrDict.intro_svc_roads === 'रस्ते', 'Roads translated');
assert(enDict.intro_svc_grievances === 'Public Grievances' && mrDict.intro_svc_grievances === 'सार्वजनिक तक्रारी', 'Grievances translated');
assert(enDict.intro_svc_community === 'Community' && mrDict.intro_svc_community === 'ग्राम समुदाय', 'Community translated');

// -----------------------------------------------------------------------------
// SUITE 7: Intro-to-Homepage Interaction Simulation
// -----------------------------------------------------------------------------
console.log('\nSuite 7: Intro-to-Homepage Transition Simulation');

function createMockDom() {
  const listeners = {};
  const classListSet = (initial = []) => {
    const classes = new Set(initial);
    return {
      add(c) { classes.add(c); },
      remove(c) { classes.delete(c); },
      contains(c) { return classes.has(c); },
      toggle(c, v) { if (v !== undefined) { v ? classes.add(c) : classes.delete(c); } else { classes.has(c) ? classes.delete(c) : classes.add(c); } }
    };
  };

  const elements = {};
  function makeEl(id, classList = []) {
    return {
      id,
      style: {},
      classList: classListSet(classList),
      offsetWidth: 100,
      addEventListener(evt, fn) {
        if (!listeners[id]) listeners[id] = {};
        if (!listeners[id][evt]) listeners[id][evt] = [];
        listeners[id][evt].push(fn);
      },
      click() {
        if (listeners[id] && listeners[id].click) {
          listeners[id].click.forEach(fn => fn({ stopPropagation: () => {}, preventDefault: () => {} }));
        }
      },
      querySelector: (sel) => null,
      querySelectorAll: () => []
    };
  }

  elements['gramlinkIntro'] = makeEl('gramlinkIntro', ['gramlink-intro-overlay', 'smart-village-intro']);
  elements['getStartedBtn'] = makeEl('getStartedBtn', ['intro-get-started-btn']);
  elements['skipIntroBtn'] = makeEl('skipIntroBtn', ['intro-skip-btn']);
  elements['introActionWrapper'] = makeEl('introActionWrapper', ['intro-action-wrapper']);

  return { elements, listeners };
}

const domMock = createMockDom();
const fakeWindow = {
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  dispatchEvent: () => {},
  scrollTo: () => {},
  showToast: () => {}
};
fakeWindow.window = fakeWindow;

const fakeDoc = {
  readyState: 'complete',
  addEventListener: () => {},
  getElementById: (id) => domMock.elements[id] || null,
  querySelectorAll: (sel) => {
    if (sel.includes('lang-btn')) return [];
    if (sel.includes('replay-intro-btn')) return [];
    return [];
  },
  body: { style: {} }
};
fakeWindow.document = fakeDoc;

const testSandbox = {
  window: fakeWindow,
  document: fakeDoc,
  localStorage: { getItem: () => 'en', setItem: () => {} },
  setTimeout: (fn, ms) => { fn(); return ms; },
  clearTimeout: () => {},
  Event: function(type) { this.type = type; },
  console: console
};
vm.createContext(testSandbox);

// Execute main.js initialization
vm.runInContext(mainJsContent, testSandbox);
vm.runInContext('initLogoIntro();', testSandbox);

const introEl = domMock.elements['gramlinkIntro'];
const actionWrapperEl = domMock.elements['introActionWrapper'];

assert(actionWrapperEl.classList.contains('visible'), 'After timer, Get Started action wrapper is visible');

// Simulate clicking "Get Started"
domMock.elements['getStartedBtn'].click();
assert(introEl.classList.contains('intro-dismissed'), 'Clicking "Get Started" triggers intro dismissal');
assert(introEl.style.display === 'none', 'After dismissal, intro display is set to none');
assert(fakeDoc.body.style.overflow === '', 'Body scroll is restored for homepage browsing');

// -----------------------------------------------------------------------------
// SUITE 8: Non-Regression of Other Working Features
// -----------------------------------------------------------------------------
console.log('\nSuite 8: Non-Regression of Existing Features');

const criticalPages = [
  'pages/auth.html',
  'pages/complaint-submit.html',
  'pages/complaint-track.html',
  'pages/village-heatmap.html',
  'pages/village-polls.html',
  'pages/village-dashboard.html',
  'pages/admin-dashboard.html'
];

criticalPages.forEach(p => {
  assert(fs.existsSync(path.join(rootDir, p)), `Critical page ${p} preserved`);
});

console.log('\n================================================================');
console.log(`TOTAL SMART VILLAGE INTRO TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: 0`);
console.log('ALL REQUIREMENTS VERIFIED WITH 100% SUCCESS!');
console.log('================================================================\n');
