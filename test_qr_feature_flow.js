/**
 * GRAMLINK 360 - QR Code Feature & Flow Verification Suite
 * Verifies end-to-end QR code generation, confirmation screen visibility,
 * GitHub Pages absolute URL encoding, and mobile scanning resolution.
 */

const fs = require('fs');
const qrHandler = require('./js/qr-handler.js');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

console.log('================================================================');
console.log('GRAMLINK 360 - QR CODE FEATURE & FLOW VERIFICATION');
console.log('================================================================\n');

// -------------------------------------------------------------------------
// TEST GROUP 1: Tracking URL Format and Token Generation
// -------------------------------------------------------------------------
console.log('TEST GROUP 1: GitHub Pages Absolute URL Format');

const testTokens = [
  'GL-2026-1042',
  'GL-2026-1088',
  'GL-2026-2104',
  'GL-2026-3055',
  'GL-2026-4120',
  'GL-2026-5099',
  'GL-2026-9999'
];

testTokens.forEach(token => {
  const url = qrHandler.buildTrackingUrl(token);
  assert(url === `https://nachi7331.github.io/Gramlink360/pages/complaint-track.html?token=${token}`,
    `Generated correct tracking URL for ${token}: ${url}`);
  assert(url.startsWith('https://nachi7331.github.io/Gramlink360/'),
    `Base domain matches GitHub Pages deployment: ${url}`);
  assert(url.includes('pages/complaint-track.html'),
    `Points to actual tracking page: ${url}`);
});

// Normalized inputs
assert(qrHandler.buildTrackingUrl('  gl-2026-1042  ') === 'https://nachi7331.github.io/Gramlink360/pages/complaint-track.html?token=GL-2026-1042',
  'Normalizes trimmed and uppercased token in tracking URL');

console.log('');

// -------------------------------------------------------------------------
// TEST GROUP 2: SVG QR Code Generation & Mobile Contrast
// -------------------------------------------------------------------------
console.log('TEST GROUP 2: SVG QR Code Rendering & Mobile Readability');

// Mock window and document environment
const qrcodeLib = require('./js/qrcode.min.js');
global.qrcode = qrcodeLib;
global.window = {
  qrcode: qrcodeLib
};

const container = {
  innerHTML: '',
  querySelector: function(sel) {
    if (this.innerHTML.includes('<svg')) {
      return { tagName: 'svg', getAttribute: (attr) => attr === 'role' ? 'img' : null };
    }
    return null;
  }
};
global.document = {
  getElementById: (id) => container
};

const renderedSvg = qrHandler.generate('GL-2026-1042', container, { size: 140 });

assert(renderedSvg !== null, 'generate() successfully returned SVG node');
assert(container.innerHTML.includes('<svg'), 'Container contains SVG element');
assert(container.innerHTML.includes('gramlink-qr-svg'), 'SVG has gramlink-qr-svg class for responsive styling');
assert(container.innerHTML.includes('fill="#ffffff"'), 'SVG contains high-contrast white background');
assert(container.innerHTML.includes('fill="#0f291e"'), 'SVG contains official Gramlink deep emerald dark modules');
assert(container.innerHTML.includes('width="140"'), 'SVG matches specified size (140px)');
assert(container.innerHTML.includes('role="img"'), 'SVG has accessible role="img"');

console.log('');

// -------------------------------------------------------------------------
// TEST GROUP 3: Mobile Camera QR Scanning & Token Extraction
// -------------------------------------------------------------------------
console.log('TEST GROUP 3: Mobile Scanner URL Parsing & Round-trip');

const fullUrl = qrHandler.buildTrackingUrl('GL-2026-1042');
const extractedFromUrl = qrHandler.extractToken(fullUrl);
assert(extractedFromUrl === 'GL-2026-1042', 'extractToken successfully decodes GL-2026-1042 from scanned mobile URL');

const rawTextReceipt = 'Panchayat Grievance Slip\nToken: GL-2026-3055\nSLA: 48 Hours';
assert(qrHandler.extractToken(rawTextReceipt) === 'GL-2026-3055', 'extractToken successfully decodes GL-2026-3055 from slip text');

const lowercaseToken = '   gl-2026-2104   ';
assert(qrHandler.extractToken(lowercaseToken) === 'GL-2026-2104', 'extractToken normalizes lowercase token to uppercase');

// Invalid payloads are safely rejected without exposing secrets
assert(qrHandler.extractToken('https://random-phishing-site.com') === null, 'Rejects arbitrary external URLs');
assert(qrHandler.extractToken('WIFI:T:WPA;S:MyNetwork;P:password;;') === null, 'Rejects Wi-Fi codes');
assert(qrHandler.extractToken('') === null, 'Handles empty string gracefully');

console.log('');

// -------------------------------------------------------------------------
// TEST GROUP 4: Complaint Confirmation Screen DOM Verification
// -------------------------------------------------------------------------
console.log('TEST GROUP 4: Complaint Confirmation Screen (#submissionSuccessModal)');

const submitHtml = fs.readFileSync('pages/complaint-submit.html', 'utf8');

assert(submitHtml.includes('id="submissionSuccessModal"'), 'Confirmation modal #submissionSuccessModal exists in complaint-submit.html');
assert(submitHtml.includes('id="generatedTokenDisplay"'), 'Unique token element #generatedTokenDisplay exists');
assert(submitHtml.includes('id="copyTokenBtn"'), 'Copy token button #copyTokenBtn exists');
assert(submitHtml.includes('id="modalQrCard"'), 'QR code card wrapper #modalQrCard exists');
assert(submitHtml.includes('id="modalQrCanvas"'), 'QR code mount point #modalQrCanvas exists');
assert(submitHtml.includes('id="trackThisTokenBtn"'), 'Track status button #trackThisTokenBtn exists');
assert(submitHtml.includes('id="closeSuccessModalBtn"'), 'Close modal button #closeSuccessModalBtn exists');

// Verify QR card has clean white styling for optical scanning contrast
assert(submitHtml.includes('background: #ffffff;') || submitHtml.includes('background:#ffffff;'),
  'QR Card has pure white background for high camera scan contrast');

// Verify script order: qrcode.min.js -> jsqr.min.js -> qr-handler.js -> main.js -> complaints.js
const qrcodeIdx = submitHtml.indexOf('qrcode.min.js');
const qrHandlerIdx = submitHtml.indexOf('qr-handler.js');
const complaintsIdx = submitHtml.indexOf('complaints.js');

assert(qrcodeIdx > 0 && qrHandlerIdx > qrcodeIdx && complaintsIdx > qrHandlerIdx,
  'Script dependencies are included in correct order in complaint-submit.html');

console.log('');

// -------------------------------------------------------------------------
// TEST GROUP 5: Tracking Page Verification
// -------------------------------------------------------------------------
console.log('TEST GROUP 5: Tracking Page & Dual Methods (#tabTrackToken & #tabTrackQr)');

const trackHtml = fs.readFileSync('pages/complaint-track.html', 'utf8');

assert(trackHtml.includes('id="tabTrackToken"'), 'Dual tracking: #tabTrackToken button exists');
assert(trackHtml.includes('id="tabTrackQr"'), 'Dual tracking: #tabTrackQr button exists');
assert(trackHtml.includes('id="tokenTrackContainer"'), 'Dual tracking: #tokenTrackContainer exists');
assert(trackHtml.includes('id="qrTrackContainer"'), 'Dual tracking: #qrTrackContainer exists');
assert(trackHtml.includes('id="trackSearchForm"'), 'Token tracking search form #trackSearchForm preserved');
assert(trackHtml.includes('id="trackSearchTokenInput"'), 'Token tracking input #trackSearchTokenInput preserved');
assert(trackHtml.includes('id="startCameraScannerBtn"'), 'Camera QR scanner start button exists');
assert(trackHtml.includes('id="uploadQrFileBtn"'), 'Photo/Image upload QR scanner button exists');
assert(trackHtml.includes('id="resultQrCanvas"'), 'Complaint result card contains #resultQrCanvas');

console.log('');

// -------------------------------------------------------------------------
// TEST GROUP 6: complaints.js Controller Flow Simulation
// -------------------------------------------------------------------------
console.log('TEST GROUP 6: complaints.js Controller Flow Simulation');

const complaintsCode = fs.readFileSync('js/complaints.js', 'utf8');

assert(complaintsCode.includes("qrService.generate(newGrievance.tokenNumber, 'modalQrCanvas'"),
  'Submission flow generates QR code for new grievance in modalQrCanvas');
assert(complaintsCode.includes("modal.classList.add('open')"),
  'Submission flow reveals confirmation modal with .open class');
assert(complaintsCode.includes("trackBtn.href = `complaint-track.html?token=${newGrievance.tokenNumber}`"),
  'Track button in modal links to complaint-track.html with token');
assert(complaintsCode.includes("qrService.generate(c.tokenNumber, 'resultQrCanvas'"),
  'Tracking result view renders QR code in resultQrCanvas');
assert(complaintsCode.includes("urlParams.get('token')"),
  'Tracking view checks URL query parameter ?token= for automatic resolution');

console.log('');
console.log('================================================================');
console.log(`TOTAL ASSERTIONS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('================================================================');

if (failCount > 0) {
  console.error('\n❌ QR CODE FEATURE TEST FAILED');
  process.exit(1);
} else {
  console.log('\n✅ 100% OF QR CODE FEATURE TESTS PASSED! FULLY RESTORED & VERIFIED.');
  process.exit(0);
}
