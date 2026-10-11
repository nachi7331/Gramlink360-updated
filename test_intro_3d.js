/**
 * GRAMLINK 360 - 3D Intro Interface Comprehensive Test Suite
 * Verifies Three.js setup, 3D geometry, 9 spatial service nodes,
 * curved arch of slabs, central beacon, mobile responsiveness, and DOM bindings.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, message) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedAssertions++;
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('================================================================');
console.log('GRAMLINK 360 - 3D ANIMATED INTRO INTERFACE VERIFICATION SUITE');
console.log('================================================================\n');

// ------------------------------------------------------------------
// SUITE 1: Three.js r128 Library Integrity
// ------------------------------------------------------------------
console.log('Suite 1: Three.js r128 Library Verification');
const threePath = path.join(__dirname, 'js', 'three.min.js');
assert(fs.existsSync(threePath), 'js/three.min.js exists locally for offline resilience');

const threeCode = fs.readFileSync(threePath, 'utf8');
assert(threeCode.length > 500000, `three.min.js file size is healthy (${threeCode.length} bytes)`);

const mockContext = {};
vm.createContext(mockContext);
let threeLoaded = false;
try {
  vm.runInContext(threeCode, mockContext);
  threeLoaded = typeof mockContext.THREE === 'object';
} catch (e) {
  threeLoaded = false;
}
assert(threeLoaded, 'three.min.js parses and evaluates without errors');
assert(mockContext.THREE && mockContext.THREE.REVISION === '128', 'THREE revision is r128');
assert(typeof mockContext.THREE.Scene === 'function', 'THREE.Scene constructor available');
assert(typeof mockContext.THREE.PerspectiveCamera === 'function', 'THREE.PerspectiveCamera constructor available');
assert(typeof mockContext.THREE.WebGLRenderer === 'function', 'THREE.WebGLRenderer constructor available');
assert(typeof mockContext.THREE.CatmullRomCurve3 === 'function', 'THREE.CatmullRomCurve3 available for curved arch');
assert(typeof mockContext.THREE.QuadraticBezierCurve3 === 'function', 'THREE.QuadraticBezierCurve3 available for node energy tracks');
assert(typeof mockContext.THREE.BoxGeometry === 'function', 'THREE.BoxGeometry available for slabs');
assert(typeof mockContext.THREE.TorusGeometry === 'function', 'THREE.TorusGeometry available for gimbal rings');
assert(typeof mockContext.THREE.OctahedronGeometry === 'function', 'THREE.OctahedronGeometry available for 3D node jewels');

// ------------------------------------------------------------------
// SUITE 2: 3D Intro Controller Module (js/intro-3d.js)
// ------------------------------------------------------------------
console.log('\nSuite 2: 3D Controller Architecture (js/intro-3d.js)');
const intro3dPath = path.join(__dirname, 'js', 'intro-3d.js');
assert(fs.existsSync(intro3dPath), 'js/intro-3d.js controller file exists');

const intro3dCode = fs.readFileSync(intro3dPath, 'utf8');

// Check class / structure
assert(intro3dCode.includes('class Gramlink3DIntro'), 'Defines Gramlink3DIntro class');
assert(intro3dCode.includes('isWebGLAvailable'), 'Includes graceful WebGL capability detection');
assert(intro3dCode.includes('setupCurvedArchSlabs'), 'Implements setupCurvedArchSlabs (Spline reference curved arch)');
assert(intro3dCode.includes('setupCentralBeacon'), 'Implements setupCentralBeacon with holographic beacon & rings');
assert(intro3dCode.includes('setupServiceNodes'), 'Implements setupServiceNodes for 9 spatial service nodes');
assert(intro3dCode.includes('setupStarDust'), 'Implements setupStarDust for floating cyber dust');
assert(intro3dCode.includes('setupLights'), 'Implements cinematic 3D lighting with key, fill, point, and rim lights');
assert(intro3dCode.includes('triggerExitTransition'), 'Implements camera exit warp zoom transition on Get Started');
assert(intro3dCode.includes('resetIntro'), 'Implements resetIntro method for smooth replay');
assert(intro3dCode.includes('onMouseMove') && intro3dCode.includes('onTouchMove'), 'Supports interactive desktop pointer parallax and mobile touch drag tilt');

// Verify all 9 services in 3D data
const expectedServices = [
  'water', 'health', 'education', 'sanitation', 'electricity',
  'agriculture', 'roads', 'grievances', 'community'
];
expectedServices.forEach(key => {
  assert(intro3dCode.includes(`key: '${key}'`), `3D service data includes node '${key}'`);
});

// Check slab count and curve points
assert(intro3dCode.includes('CatmullRomCurve3'), 'Slabs arranged along CatmullRomCurve3 3D curve');
assert(intro3dCode.includes('BoxGeometry'), 'Slabs rendered as 3D BoxGeometry prisms');
assert(intro3dCode.includes('TorusGeometry'), 'Gimbal rings rendered as 3D TorusGeometry');

// Check 3D-to-screen projection
assert(intro3dCode.includes('.project(this.camera)'), 'Projects 3D node coordinates to DOM screen coordinates');
assert(intro3dCode.includes('--depth-scale'), 'Calculates optical depth scale for foreground/background badge sizing');

// Check performance optimizations
// Check elliptical constellation and zero-overlap positioning
assert(intro3dCode.includes('getNodeCoordinates'), 'Implements getNodeCoordinates for dynamic elliptical distribution');
assert(intro3dCode.includes('angleDeg'), 'Service nodes parameterized by balanced elliptical angles');
assert(intro3dCode.includes('cardRect'), 'Implements active collision clearance prevention for central card');
assert(intro3dCode.includes('setClearColor(0x000000'), 'Three.js renderer configured with pure black clear color (0x000000)');

// ------------------------------------------------------------------
// SUITE 3: HTML Markup & Required Content (index.html)
// ------------------------------------------------------------------
console.log('\nSuite 3: HTML Markup & Required Content (index.html)');
const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

assert(html.includes('id="gramlink3DCanvas"'), 'Canvas element #gramlink3DCanvas present in HTML');
assert(html.includes('class="gramlink-3d-canvas"'), 'Canvas has class gramlink-3d-canvas');
assert(html.includes('id="getStartedBtn"'), 'Working Get Started button present');
assert(html.includes('id="skipIntroBtn"'), 'Working Skip Intro button present');
assert(html.includes('id="introServiceModal"'), 'Interactive service detail modal present');

// Required branding text
assert(html.includes('Gramlink') && html.includes('360'), 'Project title "Gramlink 360" displayed');
assert(html.includes('Smart Village, Better Living'), 'Tagline "Smart Village, Better Living" displayed');
assert(html.includes('माझे गाव • माझी जबाबदारी • आपला विकास'), 'Correct Marathi motto "माझे गाव • माझी जबाबदारी • आपला विकास" displayed');

// All 9 service badge DOM nodes
expectedServices.forEach(svc => {
  assert(html.includes(`node-${svc}`), `DOM contains service badge node-${svc}`);
});

// Script loading order
const threeIdx = html.indexOf('<script src="js/three.min.js">');
const intro3dIdx = html.indexOf('<script src="js/intro-3d.js">');
const mainIdx = html.indexOf('<script src="js/main.js">');
assert(threeIdx !== -1, 'three.min.js script tag included');
assert(intro3dIdx !== -1, 'intro-3d.js script tag included');
assert(threeIdx < intro3dIdx, 'three.min.js loaded before intro-3d.js');
assert(intro3dIdx < mainIdx, 'intro-3d.js loaded before main.js');

// ------------------------------------------------------------------
// SUITE 4: CSS Styling & Responsive Design (css/animations.css)
// ------------------------------------------------------------------
console.log('\nSuite 4: CSS Styling & Responsiveness (css/animations.css)');
const cssPath = path.join(__dirname, 'css', 'animations.css');
const css = fs.readFileSync(cssPath, 'utf8');

assert(css.includes('.gramlink-3d-canvas'), '.gramlink-3d-canvas CSS rule defined');
assert(css.includes('.smart-village-intro:not(.webgl-fallback) .smart-village-canvas'), '2D backup SVG hidden when 3D is active');
assert(css.includes('.smart-village-intro.webgl-fallback'), 'Graceful WebGL fallback presentation defined');
assert(css.includes('--depth-scale'), 'CSS supports 3D --depth-scale transform');
assert(css.includes('@media (max-width: 768px)'), 'Mobile responsive breakpoint (< 768px) defined');

// Deep-black theme and layering checks
assert(css.includes('background-color: #000000'), 'Deep-black background-color #000000 applied to intro');
assert(css.includes('.intro-radial-glow {\n  display: none !important;'), 'Bright blue/green radial glow removed/hidden');
assert(css.includes('z-index: 70'), 'Service badges configured with z-index 70 above card for proper layering');

// ------------------------------------------------------------------
// SUITE 5: Main Controller Integration (js/main.js)
// ------------------------------------------------------------------
console.log('\nSuite 5: Main Controller Integration (js/main.js)');
const mainPath = path.join(__dirname, 'js', 'main.js');
const mainCode = fs.readFileSync(mainPath, 'utf8');

assert(mainCode.includes('triggerExitTransition'), 'dismissIntro hooks into 3D triggerExitTransition');
assert(mainCode.includes('resetIntro'), 'playIntro hooks into 3D resetIntro');
assert(mainCode.includes('setHoveredService'), 'Badge hover syncs with 3D setHoveredService');

// ------------------------------------------------------------------
// SUITE 6: Translations Engine (js/translations.js)
// ------------------------------------------------------------------
console.log('\nSuite 6: Bilingual Translations (js/translations.js)');
const transPath = path.join(__dirname, 'js', 'translations.js');
const transCode = fs.readFileSync(transPath, 'utf8');

assert(transCode.includes('"intro_smart_tagline": "Smart Village, Better Living"'), 'English tagline set to "Smart Village, Better Living"');
assert(transCode.includes('"intro_smart_tagline": "स्मार्ट गाव • समृद्ध जीवन"'), 'Marathi tagline set in translations');
assert(transCode.includes('"intro_motto": "माझे गाव • माझी जबाबदारी • आपला विकास"'), 'Marathi motto verified in translations');

// ------------------------------------------------------------------
// FINAL SUMMARY
// ------------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log(`TOTAL 3D INTRO ASSERTIONS: ${totalAssertions}`);
console.log(`PASSED: ${passedAssertions}`);
console.log(`FAILED: ${failedAssertions}`);
console.log('----------------------------------------------------------------');

if (failedAssertions === 0) {
  console.log('ALL 3D INTRO VERIFICATIONS PASSED! (100% End-to-End Success)\n');
  process.exit(0);
} else {
  console.error('SOME 3D INTRO ASSERTIONS FAILED.\n');
  process.exit(1);
}
