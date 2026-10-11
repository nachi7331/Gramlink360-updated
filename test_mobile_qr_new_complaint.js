/**
 * GRAMLINK 360 - Mobile QR Complaint-Tracking Bug Verification Suite
 * Tests newly submitted complaint generation, QR tracking URL creation,
 * mobile device isolation (no shared storage), instant resolution without
 * "No Grievance Found", and persistence into mobile localStorage.
 */

const fs = require('fs');
const qrHandler = require('./js/qr-handler.js');

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
console.log('GRAMLINK 360 - MOBILE QR COMPLAINT-TRACKING VERIFICATION');
console.log('================================================================\n');

// -------------------------------------------------------------------------
// STEP 1: Simulate Complaint Submission on Submitting Device (Desktop/Browser)
// -------------------------------------------------------------------------
console.log('STEP 1: Submitting a new complaint on submitter device...');

// Mock submitting device browser environment
const desktopLocalStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; }
};

const stateCode = fs.readFileSync('js/state.js', 'utf8');
const desktopStateFn = new Function('window', 'localStorage', stateCode + '; return GramlinkState;');
const desktopState = desktopStateFn({ localStorage: desktopLocalStorage }, desktopLocalStorage);

const newPayload = {
  category: 'utilities',
  categoryName: 'Drinking Water Supply',
  title: 'Water Main Pipe Rupture in Ward 2',
  ward: 'Ward 2 - Shivaji Chowk',
  applicantName: 'Nachiket Ghorpade',
  applicantPhone: '9822154321',
  description: 'Main distribution line broken near primary school gate, flooding the approach road.',
  priority: 'High'
};

const newGrievance = desktopState.addComplaint(newPayload);

assert(newGrievance && newGrievance.tokenNumber, `Grievance created with token: ${newGrievance.tokenNumber}`);
assert(newGrievance.tokenNumber.startsWith('GL-2026-'), 'Token matches official GL-2026-XXXX format');
assert(desktopState.getComplaintByToken(newGrievance.tokenNumber) !== null, 'Saved in desktop localStorage');

// -------------------------------------------------------------------------
// STEP 2: Generate Confirmation Modal QR Code with Metadata
// -------------------------------------------------------------------------
console.log('\nSTEP 2: Generating confirmation modal QR code...');

const mockCanvas = { innerHTML: '', querySelector: () => ({ tagName: 'svg' }) };
global.qrcode = require('./js/qrcode.min.js');
global.window = { qrcode: global.qrcode, GramlinkState: desktopState };

const trackingUrl = qrHandler.buildTrackingUrl(newGrievance.tokenNumber, newGrievance);
assert(trackingUrl.startsWith('https://nachi7331.github.io/Gramlink360/pages/complaint-track.html?token=' + newGrievance.tokenNumber),
  'Tracking URL points to deployed GitHub Pages complaint-track.html with token');
const parsedParams = new URLSearchParams(trackingUrl.substring(trackingUrl.indexOf('?')));
assert(parsedParams.get('title') === newGrievance.title,
  `Tracking URL carries complaint title parameter: "${parsedParams.get('title')}"`);
assert(parsedParams.get('cat') === newGrievance.category,
  `Tracking URL carries complaint category parameter: "${parsedParams.get('cat')}"`);
assert(parsedParams.get('pri') === newGrievance.priority,
  `Tracking URL carries priority parameter: "${parsedParams.get('pri')}"`);

// Render QR code to canvas
qrHandler.generate(newGrievance.tokenNumber, mockCanvas, { size: 140, complaint: newGrievance });
assert(mockCanvas.innerHTML.includes('<svg'), 'QR Code vector SVG generated inside modal canvas');

// -------------------------------------------------------------------------
// STEP 3: Mobile Phone Scan Simulation (Fresh isolated device, empty storage)
// -------------------------------------------------------------------------
console.log('\nSTEP 3: Simulating mobile phone camera scan (Isolated mobile browser)...');

// Fresh mobile localStorage - COMPLETELY ISOLATED from desktop
const mobileLocalStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; }
};

const mobileWindow = {
  localStorage: mobileLocalStorage,
  location: {
    search: trackingUrl.substring(trackingUrl.indexOf('?'))
  },
  getCurrentLanguage: () => 'en',
  t: (k, d) => d,
  GramlinkQR: qrHandler,
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {}
};

// Initialize mobile GramlinkState
const mobileState = desktopStateFn(mobileWindow, mobileLocalStorage);
mobileWindow.GramlinkState = mobileState;

// Confirm mobile device has never seen this token before scan
assert(mobileState.getComplaintByToken(newGrievance.tokenNumber) === null,
  'Mobile device initially does NOT have this token in localStorage (proves isolation)');

// -------------------------------------------------------------------------
// STEP 4: Mobile complaint-track.html Initialization & performSearch Execution
// -------------------------------------------------------------------------
console.log('\nSTEP 4: Executing mobile tracking view with scanned URL parameters...');

// Setup mock DOM elements for complaint-track.html
const domElements = {
  trackSearchForm: { addEventListener: () => {} },
  trackSearchTokenInput: { value: '' },
  trackEmptyState: { style: { display: 'block' } },
  trackNotFoundState: { style: { display: 'none' } },
  trackResultContainer: { style: { display: 'none' } },
  resultTitle: { textContent: '' },
  resultToken: { textContent: '' },
  resultCreatedDate: { textContent: '' },
  resultDescription: { textContent: '' },
  resultCategory: { textContent: '' },
  resultWard: { textContent: '' },
  resultOfficer: { textContent: '' },
  resultStatusBadge: { textContent: '', className: '', classList: { add: () => {} } },
  resultPriorityBadge: { textContent: '', className: '', classList: { add: () => {} } },
  resultQrCanvas: { innerHTML: '', querySelector: () => null },
  stepperNodesContainer: { innerHTML: '' },
  timelineList: { innerHTML: '' }
};

let domReadyCb = null;
global.document = {
  getElementById: (id) => domElements[id] || null,
  querySelectorAll: () => [],
  addEventListener: (evt, cb) => {
    if (evt === 'DOMContentLoaded') domReadyCb = cb;
  }
};
global.window = mobileWindow;
global.localStorage = mobileLocalStorage;

// Load complaints.js tracking logic
const complaintsCode = fs.readFileSync('js/complaints.js', 'utf8');
const complaintsFn = new Function('window', 'document', 'GramlinkState', 'GramlinkQR', complaintsCode);
complaintsFn(mobileWindow, global.document, mobileState, qrHandler);

if (domReadyCb) {
  domReadyCb();
}

// Trigger search using mobile performSearch
async function runMobileTest() {
  const urlParams = new URLSearchParams(mobileWindow.location.search);
  const scannedToken = urlParams.get('token');

  assert(scannedToken === newGrievance.tokenNumber, `Mobile camera scanned token: ${scannedToken}`);

  await mobileWindow.performSearch(scannedToken);

  // Verification 1: Not Found state must NOT be shown!
  assert(domElements.trackNotFoundState.style.display !== 'block',
    'BUG FIXED: "No Grievance Found" is NOT displayed on mobile!');
  assert(domElements.trackResultContainer.style.display === 'block',
    'Tracking result container is displayed on mobile!');

  // Verification 2: Complaint details are populated accurately
  assert(domElements.resultToken.textContent === newGrievance.tokenNumber,
    `Displays correct token on mobile: ${domElements.resultToken.textContent}`);
  assert(domElements.resultTitle.textContent === newPayload.title,
    `Displays correct grievance subject: "${domElements.resultTitle.textContent}"`);
  assert(domElements.resultCategory.textContent === newPayload.category,
    `Displays correct department category: "${domElements.resultCategory.textContent}"`);
  assert(domElements.resultWard.textContent === newPayload.ward,
    `Displays correct ward location: "${domElements.resultWard.textContent}"`);

  // Verification 3: Grievance is now permanently cached in mobile localStorage
  const cachedInMobileStorage = mobileState.getComplaintByToken(newGrievance.tokenNumber);
  assert(cachedInMobileStorage !== null, 'Grievance is now permanently saved in mobile localStorage');
  assert(cachedInMobileStorage.tokenNumber === newGrievance.tokenNumber, 'Stored token matches in mobile database');

  // Verification 4: Subsequent manual search on mobile WITHOUT URL parameters succeeds!
  console.log('\nSTEP 5: Verifying subsequent manual search on mobile (without URL parameters)...');
  mobileWindow.location.search = ''; // Strip URL parameters
  domElements.trackResultContainer.style.display = 'none';

  await mobileWindow.performSearch(newGrievance.tokenNumber);

  assert(domElements.trackNotFoundState.style.display !== 'block',
    'Subsequent search without URL parameters does NOT show "No Grievance Found"');
  assert(domElements.trackResultContainer.style.display === 'block',
    'Subsequent manual search successfully displays tracking results from mobile storage');

  // -----------------------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TOTAL ASSERTIONS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('================================================================');

  if (failCount > 0) {
    console.error('\n❌ MOBILE QR COMPLAINT-TRACKING TEST FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ 100% OF MOBILE QR TRACKING TESTS PASSED! ROOT CAUSE FULLY RESOLVED.');
    process.exit(0);
  }
}

runMobileTest();
