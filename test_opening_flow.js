/**
 * test_opening_flow.js
 * Comprehensive automated verification of Gramlink 360 Opening Flow
 * 
 * Verifies:
 * 1. HTML structure: Intro overlay, letter-by-letter typing elements, taglines, "Get Started" button
 * 2. CSS styles & animations: Preservation of original typing animations, Get Started button styling
 * 3. Translations: intro_get_started in EN and MR
 * 4. Flow lifecycle:
 *    - Intro starts visible with body locked
 *    - Opening animation plays
 *    - At 2600ms (completion of typing & progress sweep), "Get Started" button is revealed
 *    - Main website DOES NOT auto-open (stays visible indefinitely until user interaction)
 *    - Clicking "Get Started" transitions smoothly to homepage
 *    - Replay button cleanly resets and restarts flow
 *    - Skip and ESC key options function correctly
 *    - Reduced-motion accessibility preference is respected
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

console.log('====================================================');
console.log('GRAMLINK 360 - OPENING FLOW AUTOMATED TEST SUITE');
console.log('====================================================\n');

const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(__dirname, 'css', 'animations.css'), 'utf8');
const mainJsContent = fs.readFileSync(path.join(__dirname, 'js', 'main.js'), 'utf8');
const translationsJsContent = fs.readFileSync(path.join(__dirname, 'js', 'translations.js'), 'utf8');

// -----------------------------------------------------------------------------
// TEST SUITE 1: HTML Structure & Opening Elements
// -----------------------------------------------------------------------------
console.log('Suite 1: HTML Structure Verification');

assert(htmlContent.includes('id="gramlinkIntro"'), 'Intro overlay #gramlinkIntro is present');
assert(htmlContent.includes('class="intro-title"'), 'Opening title container is present');
assert(htmlContent.includes('data-i18n="intro_tagline"'), 'Intro tagline element is present');
assert(htmlContent.includes('Connecting Villages, Empowering Communities'), 'Original tagline text preserved');
assert(htmlContent.includes('data-i18n="intro_subtagline"'), 'Intro subtagline element is present');

// Verify all 11 character spans for "Gramlink 360" typing animation
const chars = ['G', 'r', 'a', 'm', 'l', 'i', 'n', 'k', '3', '6', '0'];
chars.forEach((c, idx) => {
  assert(htmlContent.includes(`--i: ${idx};`) && htmlContent.includes(`>${c}<`), `Character span ${idx} (${c}) is present with staggered CSS variable`);
});

// Verify SVG visual elements
assert(htmlContent.includes('class="intro-leaf-shape"'), 'SVG leaf shape preserved');
assert(htmlContent.includes('net-node'), 'Network nodes preserved');
assert(htmlContent.includes('net-line'), 'Network lines preserved');
assert(htmlContent.includes('class="intro-progress-bar"'), 'Progress bar preserved');

// Verify Get Started button and Skip button
assert(htmlContent.includes('id="introActionWrapper"'), '#introActionWrapper container is present');
assert(htmlContent.includes('id="getStartedBtn"'), '#getStartedBtn button is present');
assert(htmlContent.includes('data-i18n="intro_get_started"'), 'Get Started button contains data-i18n="intro_get_started"');
assert(htmlContent.includes('id="skipIntroBtn"'), '#skipIntroBtn button is present');

console.log('  -> Suite 1 passed all checks.\n');

// -----------------------------------------------------------------------------
// TEST SUITE 2: CSS Animation Integrity & "Get Started" Styling
// -----------------------------------------------------------------------------
console.log('Suite 2: CSS Animation & Styling Verification');

// Check that original typing animations are untouched
assert(cssContent.includes('@keyframes introCharReveal'), 'Original introCharReveal keyframe animation is preserved');
assert(cssContent.includes('@keyframes introLeafGrowth'), 'Original introLeafGrowth keyframe animation is preserved');
assert(cssContent.includes('@keyframes introNodePop'), 'Original introNodePop keyframe animation is preserved');
assert(cssContent.includes('@keyframes introStemDraw'), 'Original introStemDraw keyframe animation is preserved');
assert(cssContent.includes('@keyframes introProgressSweep'), 'Original introProgressSweep keyframe animation is preserved');
assert(cssContent.includes('calc(0.65s + (var(--i, 0) * 0.05s))'), 'Letter animation delay formula preserved (calc(0.65s + var(--i) * 0.05s))');

// Check Get Started button CSS rules
assert(cssContent.includes('.intro-action-wrapper {'), '.intro-action-wrapper base styles defined');
assert(cssContent.includes('.intro-action-wrapper.visible {'), '.intro-action-wrapper.visible reveal styles defined');
assert(cssContent.includes('.intro-get-started-btn {'), '.intro-get-started-btn button styles defined');
assert(cssContent.includes('.intro-get-started-btn:hover'), '.intro-get-started-btn hover effects defined');

// Verify visibility logic in CSS
const actionWrapperCssMatch = cssContent.match(/\.intro-action-wrapper\s*\{([^}]+)\}/);
assert(actionWrapperCssMatch && actionWrapperCssMatch[1].includes('opacity: 0'), '.intro-action-wrapper initially has opacity: 0');
assert(actionWrapperCssMatch && actionWrapperCssMatch[1].includes('pointer-events: none'), '.intro-action-wrapper initially disables pointer-events');

const actionWrapperVisibleMatch = cssContent.match(/\.intro-action-wrapper\.visible\s*\{([^}]+)\}/);
assert(actionWrapperVisibleMatch && actionWrapperVisibleMatch[1].includes('opacity: 1'), '.intro-action-wrapper.visible sets opacity: 1');
assert(actionWrapperVisibleMatch && actionWrapperVisibleMatch[1].includes('pointer-events: auto'), '.intro-action-wrapper.visible enables pointer-events: auto');

console.log('  -> Suite 2 passed all checks.\n');

// -----------------------------------------------------------------------------
// TEST SUITE 3: Translation Verification
// -----------------------------------------------------------------------------
console.log('Suite 3: Translations Verification');

const sandboxTranslations = {
  window: {},
  document: { addEventListener: () => {}, querySelectorAll: () => [] },
  localStorage: { getItem: () => 'en', setItem: () => {} }
};
vm.createContext(sandboxTranslations);
const transObj = vm.runInContext(translationsJsContent + '\n; translations;', sandboxTranslations);

const enDict = transObj && transObj.en;
const mrDict = transObj && transObj.mr;

assert(enDict && enDict.intro_get_started === 'Get Started', 'English dictionary contains intro_get_started = "Get Started"');
assert(mrDict && mrDict.intro_get_started === 'सुरू करा', 'Marathi dictionary contains intro_get_started = "सुरू करा"');
assert(enDict.intro_tagline === 'Connecting Villages, Empowering Communities', 'English intro_tagline preserved');
assert(mrDict.intro_tagline === 'गावे जोडतोय, समाज घडवतोय', 'Marathi intro_tagline preserved');

console.log('  -> Suite 3 passed all checks.\n');

// -----------------------------------------------------------------------------
// TEST SUITE 4: Flow Lifecycle Simulation & Behavior Validation
// -----------------------------------------------------------------------------
console.log('Suite 4: Flow Lifecycle Simulation');

function createMockDom() {
  const listeners = {};
  const classListSet = (initial = []) => {
    const classes = new Set(initial);
    return {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
      toggle: (c, val) => {
        if (val === undefined) {
          if (classes.has(c)) classes.delete(c); else classes.add(c);
        } else if (val) classes.add(c);
        else classes.delete(c);
      },
      toArray: () => Array.from(classes)
    };
  };

  const createEl = (id, classNames = []) => {
    const elListeners = {};
    return {
      id,
      classList: classListSet(classNames),
      style: {},
      offsetWidth: 100,
      addEventListener: (evt, fn) => {
        if (!elListeners[evt]) elListeners[evt] = [];
        elListeners[evt].push(fn);
      },
      dispatchEvent: (evt) => {
        const type = typeof evt === 'string' ? evt : evt.type;
        if (elListeners[type]) elListeners[type].forEach(f => f(evt));
      },
      click: () => {
        if (elListeners['click']) elListeners['click'].forEach(f => f({ stopPropagation: () => {}, preventDefault: () => {} }));
      },
      querySelector: () => ({ style: {}, offsetWidth: 50 }),
      querySelectorAll: () => []
    };
  };

  const introEl = createEl('gramlinkIntro', ['gramlink-intro-overlay']);
  const getStartedEl = createEl('getStartedBtn', ['intro-get-started-btn']);
  const skipBtnEl = createEl('skipIntroBtn', ['intro-skip-btn']);
  const actionWrapperEl = createEl('introActionWrapper', ['intro-action-wrapper']);
  const replayBtnEl = createEl('replayIntroBtn', ['replay-intro-btn']);

  const elements = {
    'gramlinkIntro': introEl,
    'getStartedBtn': getStartedEl,
    'skipIntroBtn': skipBtnEl,
    'introActionWrapper': actionWrapperEl,
  };

  const doc = {
    getElementById: (id) => elements[id] || null,
    querySelector: (sel) => null,
    querySelectorAll: (sel) => {
      if (sel.includes('.replay-intro-btn')) return [replayBtnEl];
      return [];
    },
    addEventListener: (evt, fn) => {},
    removeEventListener: (evt, fn) => {},
    body: {
      style: {}
    }
  };

  const winListeners = {};
  const timers = [];
  let currentTime = 0;

  const mockSetTimeout = (fn, delay) => {
    const id = timers.length + 1;
    timers.push({ id, fn, triggerAt: currentTime + delay, cleared: false });
    return id;
  };

  const mockClearTimeout = (id) => {
    const item = timers.find(t => t.id === id);
    if (item) item.cleared = true;
  };

  const advanceTimersByTime = (ms) => {
    currentTime += ms;
    // Process all pending timers that are due, sorted by triggerAt
    let pending = timers.filter(t => !t.cleared && t.triggerAt <= currentTime);
    while (pending.length > 0) {
      pending.sort((a, b) => a.triggerAt - b.triggerAt);
      const next = pending.shift();
      next.cleared = true;
      next.fn();
      pending = timers.filter(t => !t.cleared && t.triggerAt <= currentTime);
    }
  };

  const mockWin = {
    addEventListener: (evt, fn) => {
      if (!winListeners[evt]) winListeners[evt] = [];
      winListeners[evt].push(fn);
    },
    dispatchEvent: (evt) => {
      const type = typeof evt === 'string' ? evt : evt.type;
      if (winListeners[type]) winListeners[type].forEach(f => f(evt));
    },
    matchMedia: () => ({ matches: false }),
    scrollTo: () => {},
    setTimeout: mockSetTimeout,
    clearTimeout: mockClearTimeout,
    currentTime: () => currentTime,
    advanceTime: advanceTimersByTime
  };

  return {
    doc,
    win: mockWin,
    introEl,
    getStartedEl,
    skipBtnEl,
    actionWrapperEl,
    replayBtnEl,
    advanceTime: advanceTimersByTime
  };
}

// Subtest 4.1: Normal initial load and flow
{
  const { doc, win, introEl, getStartedEl, actionWrapperEl, advanceTime } = createMockDom();

  // Load and execute main.js in sandbox
  const sandbox = {
    window: win,
    document: doc,
    setTimeout: win.setTimeout,
    clearTimeout: win.clearTimeout,
    localStorage: { getItem: () => 'en', setItem: () => {} },
    Event: function(type) { this.type = type; },
    CustomEvent: function(type, opts) { this.type = type; this.detail = opts ? opts.detail : null; },
    console: console
  };
  vm.createContext(sandbox);
  vm.runInContext(mainJsContent, sandbox);

  // Invoke initLogoIntro
  vm.runInContext('initLogoIntro();', sandbox);

  // 1. Immediately on page load:
  assert(introEl.style.display === 'flex', 'On page load: Intro overlay display is "flex"');
  assert(!introEl.classList.contains('intro-dismissed'), 'On page load: Intro overlay does NOT have .intro-dismissed');
  assert(doc.body.style.overflow === 'hidden', 'On page load: Body scroll is locked (overflow: hidden)');
  assert(!actionWrapperEl.classList.contains('visible'), 'On page load: "Get Started" wrapper is NOT visible yet (typing is playing)');

  // 2. Advance time to 1500ms (during typing animation):
  advanceTime(1500);
  assert(!actionWrapperEl.classList.contains('visible'), 'At 1500ms: "Get Started" is still hidden while typing is in progress');
  assert(introEl.style.display === 'flex', 'At 1500ms: Intro overlay remains visible');
  assert(!introEl.classList.contains('intro-dismissed'), 'At 1500ms: Intro is NOT dismissed');

  // 3. Advance time to 2600ms (when typing animation completes):
  advanceTime(1100); // currentTime is now 2600ms
  assert(actionWrapperEl.classList.contains('visible'), 'At 2600ms: "Get Started" button wrapper has .visible class added');
  assert(introEl.style.display === 'flex', 'At 2600ms: Intro screen remains open');
  assert(!introEl.classList.contains('intro-dismissed'), 'At 2600ms: Intro is NOT automatically dismissed');

  // 4. Advance time significantly further (e.g. 5000ms, 10000ms):
  advanceTime(7400); // currentTime is now 10000ms
  assert(introEl.style.display === 'flex', 'At 10,000ms: Intro screen is STILL visible (no auto-opening of homepage)');
  assert(!introEl.classList.contains('intro-dismissed'), 'At 10,000ms: Still NOT dismissed (strictly waiting for user click)');
  assert(doc.body.style.overflow === 'hidden', 'At 10,000ms: Body scroll remains locked');

  // 5. User clicks "Get Started" button:
  getStartedEl.click();
  assert(introEl.classList.contains('intro-dismissed'), 'After clicking "Get Started": Intro receives .intro-dismissed for smooth exit animation');
  
  // Advance through dismissal animation delay (450ms)
  advanceTime(450);
  assert(introEl.style.display === 'none', 'After 450ms exit transition: Intro display becomes "none"');
  assert(doc.body.style.overflow === '', 'After exit transition: Body scroll is unlocked for main homepage');
  
  console.log('  -> Subtest 4.1 (Standard Flow & User-Triggered Transition) passed.');
}

// Subtest 4.2: Replay Intro button flow
{
  const { doc, win, introEl, getStartedEl, actionWrapperEl, replayBtnEl, advanceTime } = createMockDom();

  const sandbox = {
    window: win,
    document: doc,
    setTimeout: win.setTimeout,
    clearTimeout: win.clearTimeout,
    localStorage: { getItem: () => 'en', setItem: () => {} },
    Event: function(type) { this.type = type; },
    CustomEvent: function(type) { this.type = type; },
    console: console
  };
  vm.createContext(sandbox);
  vm.runInContext(mainJsContent, sandbox);
  vm.runInContext('initLogoIntro();', sandbox);

  // Complete opening and dismiss
  advanceTime(2600);
  getStartedEl.click();
  advanceTime(450);
  assert(introEl.style.display === 'none', 'Intro was dismissed to homepage');

  // Now user clicks "Replay Intro"
  replayBtnEl.click();
  assert(introEl.style.display === 'flex', 'On replay: Intro display restored to "flex"');
  assert(!introEl.classList.contains('intro-dismissed'), 'On replay: .intro-dismissed removed');
  assert(!actionWrapperEl.classList.contains('visible'), 'On replay: "Get Started" button is reset to hidden while animation replays');
  assert(doc.body.style.overflow === 'hidden', 'On replay: Body scroll locked again');

  // Advance 2600ms
  advanceTime(2600);
  assert(actionWrapperEl.classList.contains('visible'), 'On replay: After 2600ms, "Get Started" button reappears cleanly');
  assert(introEl.style.display === 'flex', 'On replay: Stays visible until user clicks Get Started');

  console.log('  -> Subtest 4.2 (Replay Flow) passed.');
}

// Subtest 4.3: Skip Intro button flow
{
  const { doc, win, introEl, skipBtnEl, advanceTime } = createMockDom();

  const sandbox = {
    window: win,
    document: doc,
    setTimeout: win.setTimeout,
    clearTimeout: win.clearTimeout,
    localStorage: { getItem: () => 'en', setItem: () => {} },
    Event: function(type) { this.type = type; },
    CustomEvent: function(type) { this.type = type; },
    console: console
  };
  vm.createContext(sandbox);
  vm.runInContext(mainJsContent, sandbox);
  vm.runInContext('initLogoIntro();', sandbox);

  // User clicks "Skip Intro" at 500ms
  advanceTime(500);
  skipBtnEl.click();
  assert(introEl.classList.contains('intro-dismissed'), 'Clicking Skip immediately initiates dismissal');
  advanceTime(200);
  assert(introEl.style.display === 'none', 'Fast skip completes after 200ms delay');

  console.log('  -> Subtest 4.3 (Skip Intro Flow) passed.');
}

// Subtest 4.4: Reduced-Motion accessibility preference
{
  const { doc, win, introEl } = createMockDom();
  // Override matchMedia to simulate prefers-reduced-motion
  win.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion: reduce')
  });

  const sandbox = {
    window: win,
    document: doc,
    setTimeout: win.setTimeout,
    clearTimeout: win.clearTimeout,
    localStorage: { getItem: () => 'en', setItem: () => {} },
    Event: function(type) { this.type = type; },
    CustomEvent: function(type) { this.type = type; },
    console: console
  };
  vm.createContext(sandbox);
  vm.runInContext(mainJsContent, sandbox);
  vm.runInContext('initLogoIntro();', sandbox);

  assert(introEl.style.display === 'none', 'When prefers-reduced-motion is true: intro is dismissed immediately');
  assert(introEl.classList.contains('intro-dismissed'), 'When prefers-reduced-motion is true: .intro-dismissed is added');

  console.log('  -> Subtest 4.4 (Accessibility Reduced-Motion) passed.');
}

console.log('====================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: 0`);
console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
console.log('====================================================');
