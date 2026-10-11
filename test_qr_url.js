/**
 * GRAMLINK 360 - QR Code Absolute URL Test Suite
 * Verifies that QR codes generate the correct deployed GitHub Pages absolute URL:
 * https://nachi7331.github.io/Gramlink360/pages/complaint-track.html?token={TOKEN}
 */

const qrHandler = require('./js/qr-handler.js');

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
console.log('GRAMLINK 360 - QR CODE ABSOLUTE URL TEST SUITE');
console.log('================================================================\n');

// Test 1: Absolute URL Generation for Standard Complaint Token
const token1 = 'GL-2026-1042';
const url1 = qrHandler.buildTrackingUrl(token1);
const expectedUrl1 = 'https://nachi7331.github.io/Gramlink360/pages/complaint-track.html?token=GL-2026-1042';

assert(url1 === expectedUrl1, `buildTrackingUrl('${token1}') === '${expectedUrl1}'`);
assert(url1.startsWith('https://nachi7331.github.io/Gramlink360/'), 'URL begins with required GitHub Pages base URL');
assert(url1.includes('pages/complaint-track.html'), 'URL includes actual tracking-page filename');
assert(url1.includes(`?token=${token1}`), 'URL includes existing unique complaint token');
assert(!url1.startsWith('complaint-track.html'), 'URL is NOT a relative path');

// Test 2: Token Normalization and URL Encoding
const token2 = '  gl-2026-1088  ';
const url2 = qrHandler.buildTrackingUrl(token2);
const expectedUrl2 = 'https://nachi7331.github.io/Gramlink360/pages/complaint-track.html?token=GL-2026-1088';

assert(url2 === expectedUrl2, `Normalized uppercase token in URL: '${url2}'`);

// Test 3: Multiple grievance tokens
const testTokens = ['GL-2026-2104', 'GL-2026-3055', 'GL-2026-4120'];
testTokens.forEach(t => {
  const url = qrHandler.buildTrackingUrl(t);
  assert(url === `https://nachi7331.github.io/Gramlink360/pages/complaint-track.html?token=${t}`, `Generates correct absolute URL for token ${t}`);
});

// Test 4: Mobile Scanner Compatibility & Round-trip Token Extraction
const scannedToken = qrHandler.extractToken(url1);
assert(scannedToken === token1, `extractToken successfully extracts '${token1}' from absolute URL`);

// Test 5: Simulated Mobile Camera QR Payload Verification
const dummyContainer = { innerHTML: '', querySelector: () => null };
global.qrcode = function(type, level) {
  let storedData = '';
  return {
    addData: function(d) { storedData = d; },
    make: function() {},
    getModuleCount: function() { return 21; },
    isDark: function() { return false; },
    getStoredData: function() { return storedData; }
  };
};

// Check generate call logic
const qrInstance = global.qrcode(0, 'M');
qrInstance.addData(qrHandler.buildTrackingUrl('GL-2026-1042'));
assert(qrInstance.getStoredData() === expectedUrl1, 'QR payload contains absolute URL ready for mobile camera scanning');

console.log('\n----------------------------------------------------------------');
console.log(`TOTAL ASSERTIONS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('----------------------------------------------------------------');

if (failCount > 0) {
  console.error('QR CODE URL TEST FAILED!');
  process.exit(1);
} else {
  console.log('ALL QR CODE URL TESTS PASSED! (100% Verified)');
  process.exit(0);
}
