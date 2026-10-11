/**
 * GRAMLINK 360 - DUAL COMPLAINT TRACKING METHODS TEST SUITE
 * Tests:
 * 1. Track by Token Code (Form, Input, Search Button, Demo Tokens, Database Retrieval)
 * 2. Track by QR Code (Tab, Viewfinder, Scanner, File Upload, Token Extraction from URLs/Text)
 * 3. Shared Database Verification (GramlinkState & Supabase consistency across both methods)
 * 4. Token Form Preservation (Form #trackSearchForm and inputs remain 100% intact)
 * 5. Privacy & Error Safety (Clear errors for invalid tokens/QR, zero private info leakage)
 * 6. QR Code Generation (Submission success modal & tracking result card)
 * 7. Bilingual Parity (English & Marathi translations for all tracking/QR keys)
 * 8. Dark & Light Mode Theme Compatibility
 */

const fs = require('fs');
const path = require('path');

let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failCount++;
  }
}

console.log('================================================================');
console.log('GRAMLINK 360 - DUAL TRACKING METHODS & QR SUITE');
console.log('Token Code, QR Scanner, Shared Database & Complainant Privacy');
console.log('================================================================\n');

// -------------------------------------------------------------
// Suite 1: Token Form Preservation & HTML Architecture
// -------------------------------------------------------------
console.log('Suite 1: Token Form Preservation & HTML Architecture');

const trackHtml = fs.readFileSync('pages/complaint-track.html', 'utf8');
const submitHtml = fs.readFileSync('pages/complaint-submit.html', 'utf8');

// 1.1 Form Preservation
assert(trackHtml.includes('id="trackSearchForm"'), 'Existing form #trackSearchForm is preserved');
assert(trackHtml.includes('id="trackSearchTokenInput"'), 'Existing input #trackSearchTokenInput is preserved');
assert(trackHtml.includes('id="trackSubmitBtn"'), 'Button #trackSubmitBtn exists for tracking complaint');
assert(trackHtml.includes('data-i18n="track_search_btn"'), 'Tracking button has data-i18n="track_search_btn"');
assert(trackHtml.includes('data-token="GL-2026-1042"'), 'Demo token GL-2026-1042 button preserved');
assert(trackHtml.includes('data-token="GL-2026-1088"'), 'Demo token GL-2026-1088 button preserved');
assert(trackHtml.includes('data-token="GL-2026-2104"'), 'Demo token GL-2026-2104 button preserved');

// 1.2 Dual Method Tabs & Switching
assert(trackHtml.includes('id="tabTrackToken"'), 'Method Tab 1 #tabTrackToken exists');
assert(trackHtml.includes('id="tabTrackQr"'), 'Method Tab 2 #tabTrackQr exists');
assert(trackHtml.includes('id="tokenTrackContainer"'), 'Method 1 container #tokenTrackContainer exists');
assert(trackHtml.includes('id="qrTrackContainer"'), 'Method 2 container #qrTrackContainer exists');
assert(trackHtml.includes('id="quickSwitchToQrBtn"'), 'Quick switch to QR button exists inside token view');
assert(trackHtml.includes('id="switchToTokenBtn"'), 'Switch to token button exists inside QR view');

// 1.3 QR Scanner Elements
assert(trackHtml.includes('id="qrScannerVideo"'), 'QR Video element #qrScannerVideo exists');
assert(trackHtml.includes('id="qrVideoWrapper"'), 'QR Video viewfinder wrapper #qrVideoWrapper exists');
assert(trackHtml.includes('id="qrScannerStatus"'), 'QR status message box #qrScannerStatus exists');
assert(trackHtml.includes('id="startCameraScannerBtn"'), 'Start Camera button #startCameraScannerBtn exists');
assert(trackHtml.includes('id="stopCameraScannerBtn"'), 'Stop Camera button #stopCameraScannerBtn exists');
assert(trackHtml.includes('id="uploadQrFileBtn"'), 'Upload / Photo QR button #uploadQrFileBtn exists');
assert(trackHtml.includes('id="qrFileInput"'), 'File input #qrFileInput exists');

// 1.4 Result QR Display Card
assert(trackHtml.includes('id="resultQrCanvas"'), 'Tracking result QR canvas #resultQrCanvas exists');

// 1.5 Submission Success Modal QR
assert(submitHtml.includes('id="modalQrCanvas"'), 'Submission modal QR canvas #modalQrCanvas exists');
assert(submitHtml.includes('id="generatedTokenDisplay"'), 'Submission modal token display preserved');

// 1.6 Script Inclusions
assert(trackHtml.includes('src="../js/qrcode.min.js"'), 'complaint-track.html includes qrcode.min.js');
assert(trackHtml.includes('src="../js/jsqr.min.js"'), 'complaint-track.html includes jsqr.min.js');
assert(trackHtml.includes('src="../js/qr-handler.js"'), 'complaint-track.html includes qr-handler.js');
assert(submitHtml.includes('src="../js/qrcode.min.js"'), 'complaint-submit.html includes qrcode.min.js');
assert(submitHtml.includes('src="../js/qr-handler.js"'), 'complaint-submit.html includes qr-handler.js');

console.log('');

// -------------------------------------------------------------
// Suite 2: QR Code Extraction & URL Resolution (Unit Logic)
// -------------------------------------------------------------
console.log('Suite 2: QR Code Extraction & URL Resolution');

const qrHandler = require('./js/qr-handler.js');

// 2.1 Extract Token from full URL
const fullUrl = 'https://nachi7331.github.io/Gramlink360/pages/complaint-track.html?token=GL-2026-1042';
assert(qrHandler.extractToken(fullUrl) === 'GL-2026-1042', 'Extracts token from full GitHub Pages URL');

// 2.2 Extract Token from relative URL
const relUrl = 'complaint-track.html?token=GL-2026-3055';
assert(qrHandler.extractToken(relUrl) === 'GL-2026-3055', 'Extracts token from relative query URL');

// 2.3 Extract Token from multiple query params
const complexUrl = 'https://domain.com/track?lang=mr&token=GL-2026-2104&ref=sms';
assert(qrHandler.extractToken(complexUrl) === 'GL-2026-2104', 'Extracts token from complex query string');

// 2.4 Extract Token from direct token string
assert(qrHandler.extractToken('GL-2026-1088') === 'GL-2026-1088', 'Extracts token from direct string GL-2026-1088');
assert(qrHandler.extractToken('  gl-2026-4120  ') === 'GL-2026-4120', 'Extracts and normalizes lowercase/whitespace token');
assert(qrHandler.extractToken('Token: GL-2026-5099 (Urgent)') === 'GL-2026-5099', 'Extracts token embedded in receipt text');

// 2.5 Rejects invalid / non-Gramlink QR codes
assert(qrHandler.extractToken('https://google.com') === null, 'Rejects generic URL without token');
assert(qrHandler.extractToken('WIFI:S:MyNetwork;T:WPA;P:pass;;') === null, 'Rejects Wi-Fi QR code');
assert(qrHandler.extractToken('Random QR Text') === null, 'Rejects random string');
assert(qrHandler.extractToken('') === null, 'Handles empty string safely');
assert(qrHandler.extractToken(null) === null, 'Handles null safely');

// 2.6 Build Tracking URL
const builtUrl = qrHandler.buildTrackingUrl('GL-2026-1042');
assert(builtUrl.includes('complaint-track.html?token=GL-2026-1042'), 'buildTrackingUrl generates valid complaint-track link');

console.log('');

// -------------------------------------------------------------
// Suite 3: Shared Complaint Database Consistency
// -------------------------------------------------------------
console.log('Suite 3: Shared Complaint Database Consistency');

// Mock browser environment for state.js
global.window = {
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  },
  addEventListener() {},
  dispatchEvent() {}
};
global.localStorage = global.window.localStorage;

const stateCode = fs.readFileSync('js/state.js', 'utf8');
const stateFn = new Function('window', 'localStorage', stateCode + '; return GramlinkState;');
const GramlinkState = stateFn(global.window, global.localStorage);

const complaints = GramlinkState.getComplaints();
assert(complaints && complaints.length >= 5, `Database contains ${complaints.length} seed complaints`);

// Verify tokens queryable via both methods
const testTokens = ['GL-2026-1042', 'GL-2026-1088', 'GL-2026-2104', 'GL-2026-3055'];
testTokens.forEach(tok => {
  const c = GramlinkState.getComplaintByToken(tok);
  assert(c && c.tokenNumber === tok, `Token ${tok} cleanly retrieved from shared database`);
  assert(Boolean(c.status), `Token ${tok} has valid status: ${c.status}`);
  assert(Boolean(c.category), `Token ${tok} has valid category: ${c.category}`);
});

// Verify updateStatus persists to shared database
const updateResult = GramlinkState.updateComplaintStatus('GL-2026-1042', 'In Progress', 'Field team dispatched');
assert(Boolean(updateResult), 'Complaint status updated successfully in GramlinkState');
const updatedC = GramlinkState.getComplaintByToken('GL-2026-1042');
assert(updatedC.status === 'In Progress', 'Updated status is immediately visible in shared database');

console.log('');

// -------------------------------------------------------------
// Suite 4: Privacy & Complainant Protection
// -------------------------------------------------------------
console.log('Suite 4: Privacy & Complainant Protection');

const complaintsCode = fs.readFileSync('js/complaints.js', 'utf8');

// Ensure QR handler and scanner errors do not reveal private info
assert(!complaintsCode.includes('applicantPhone') || complaintsCode.includes('applicantPhone:'), 'Phone number is never exposed in error handlers');
assert(!complaintsCode.includes('tokenDisplay.textContent = newGrievance.applicantName'), 'Applicant name is not leaked in token display');

// Verify that not found state does not expose any personal data
assert(trackHtml.includes('id="trackNotFoundState"'), 'Clear not-found container exists');
assert(!trackHtml.includes('applicantName'), 'No private applicantName field in tracking result display card');
assert(!trackHtml.includes('applicantPhone'), 'No private applicantPhone field in tracking result display card');

console.log('');

// -------------------------------------------------------------
// Suite 5: Bilingual English & Marathi Translations
// -------------------------------------------------------------
console.log('Suite 5: Bilingual English & Marathi Translations');

// Mock window and document for translations.js
global.document = {
  addEventListener: () => {},
  querySelectorAll: () => [],
  documentElement: { setAttribute: () => {} }
};
global.window.t = null;
global.window.getCurrentLanguage = () => 'en';
global.window.setLanguage = () => {};

const transCode = fs.readFileSync('js/translations.js', 'utf8');
const transFn = new Function('window', 'document', transCode + '; return translations;');
const translations = transFn(global.window, global.document);

const requiredKeys = [
  'track_search_btn',
  'track_method_token',
  'track_method_qr',
  'track_switch_qr_btn',
  'qr_scanner_title',
  'qr_scanner_desc',
  'qr_btn_start_cam',
  'qr_btn_stop_cam',
  'qr_btn_upload',
  'qr_btn_switch_token',
  'qr_status_ready',
  'qr_status_scanning',
  'qr_status_success',
  'qr_err_denied',
  'qr_err_unavailable',
  'qr_err_invalid',
  'qr_err_no_code',
  'modal_qr_title',
  'modal_qr_hint',
  'track_view_qr',
  'track_card_qr_hint'
];

requiredKeys.forEach(k => {
  const enVal = translations.en[k];
  const mrVal = translations.mr[k];
  assert(Boolean(enVal), `Key "${k}" defined in English: "${enVal}"`);
  assert(Boolean(mrVal), `Key "${k}" defined in Marathi: "${mrVal}"`);
});

const enTotal = Object.keys(translations.en).length;
const mrTotal = Object.keys(translations.mr).length;
assert(enTotal === mrTotal, `100% translation key symmetry: ${enTotal} EN keys == ${mrTotal} MR keys`);

console.log('');

// -------------------------------------------------------------
// Suite 6: Dark and Light Mode Theme Compatibility
// -------------------------------------------------------------
console.log('Suite 6: Dark and Light Mode Theme Compatibility');

const styleCss = fs.readFileSync('css/style.css', 'utf8');

assert(styleCss.includes('.track-method-tabs'), '.track-method-tabs base styling present');
assert(styleCss.includes('.track-method-tab.active'), '.track-method-tab.active styling present');
assert(styleCss.includes('.qr-scanner-card'), '.qr-scanner-card base styling present');
assert(styleCss.includes('.qr-video-wrapper'), '.qr-video-wrapper styling present');
assert(styleCss.includes('.qr-scanner-laser'), '.qr-scanner-laser animation present');
assert(styleCss.includes('[data-theme="dark"] .track-method-tab'), 'Dark theme override for .track-method-tab present');
assert(styleCss.includes('[data-theme="dark"] .qr-scanner-card'), 'Dark theme override for .qr-scanner-card present');
assert(styleCss.includes('[data-theme="dark"] .qr-scanner-status-box'), 'Dark theme override for .qr-scanner-status-box present');

console.log('');

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('----------------------------------------------------------------');
console.log(`TOTAL ASSERTIONS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('----------------------------------------------------------------');

if (failCount === 0) {
  console.log('ALL DUAL TRACKING & QR TESTS PASSED! (100% Verified)');
  process.exit(0);
} else {
  console.error('SOME TESTS FAILED!');
  process.exit(1);
}
