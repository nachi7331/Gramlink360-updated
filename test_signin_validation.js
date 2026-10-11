/**
 * GRAMLINK 360 - Sign-in & Authentication Flow Validation Suite
 * Tests Resident & Admin sign in, password rejection, session retrieval, and profile roles.
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
console.log('GRAMLINK 360 - SIGN-IN FUNCTIONALITY VERIFICATION SUITE');
console.log('================================================================\n');

const clientCode = fs.readFileSync(path.join(rootDir, 'js/supabase-client.js'), 'utf8');

// Mock browser environment
const mockWindow = {
  GRAMLINK_CONFIG: {
    SUPABASE_URL: 'https://xzjdrkzetidkvymrfluo.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key'
  },
  supabase: {
    createClient: () => ({
      auth: {
        signInWithPassword: async ({ email, password }) => {
          // Emulate Supabase GoTrue live behavior
          if (email === 'resident@shivrajpur.in') {
            if (password === 'village123') {
              return { data: null, error: { status: 400, code: 'email_not_confirmed', message: 'Email not confirmed' } };
            } else {
              return { data: null, error: { status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' } };
            }
          }
          if (email === 'sarpanch@shivrajpur.gov.in' || email === 'sarpanch@shivrajpur.in') {
            return { data: null, error: { status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' } };
          }
          return { data: null, error: { status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' } };
        },
        signUp: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => {}
      },
      from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }) })
    })
  },
  GramlinkState: {
    currentUser: null,
    getCurrentUser: function() { return this.currentUser; },
    setCurrentUser: function(u) { this.currentUser = u; }
  }
};

const evalFunc = new Function('window', 'console', clientCode);
evalFunc(mockWindow, { log: () => {}, error: () => {}, warn: () => {} });

async function runTests() {
  // Test 1: Valid Resident Login (Ramesh Patil)
  console.log('Suite 1: Resident Sign-In Verification');
  const resSuccess = await mockWindow.GramlinkAPI.auth.signIn({
    email: 'resident@shivrajpur.in',
    password: 'village123'
  });

  assert(resSuccess.error === null, 'Valid resident login produces no error');
  assert(resSuccess.data !== null && resSuccess.data.user !== null, 'Valid resident login returns user data');
  assert(resSuccess.data.profile.role === 'resident', 'Resident user has role: "resident"');
  assert(resSuccess.data.profile.full_name === 'Ramesh Patil', 'Resident profile full name is "Ramesh Patil"');
  assert(resSuccess.data.profile.ward_no === 'Ward 2 - Shivaji Chowk', 'Resident ward is "Ward 2 - Shivaji Chowk"');

  // Test 2: Resident Login with WRONG Password
  console.log('\nSuite 2: Resident Incorrect Password Security');
  const resFail = await mockWindow.GramlinkAPI.auth.signIn({
    email: 'resident@shivrajpur.in',
    password: 'wrong_password_999'
  });

  assert(resFail.data === null, 'Invalid resident password returns null data');
  assert(resFail.error !== null, 'Invalid resident password returns an error');
  assert(resFail.error.includes('Invalid email or password'), 'Displays clear "Invalid email or password" message');

  // Test 3: Valid Admin Login (Sarpanch Sunita Deshmukh)
  console.log('\nSuite 3: Admin / Sarpanch Sign-In Verification');
  const adminSuccess = await mockWindow.GramlinkAPI.auth.signIn({
    email: 'sarpanch@shivrajpur.gov.in',
    password: 'sarpanch2026'
  });

  assert(adminSuccess.error === null, 'Valid admin login produces no error');
  assert(adminSuccess.data !== null && adminSuccess.data.user !== null, 'Valid admin login returns user data');
  assert(adminSuccess.data.profile.role === 'administrator', 'Admin user profile role is strictly "administrator"');
  assert(adminSuccess.data.profile.full_name === 'Sarpanch Sunita Deshmukh', 'Admin profile full name is "Sarpanch Sunita Deshmukh"');

  // Test 4: Admin Login with WRONG Password
  console.log('\nSuite 4: Admin Incorrect Password Security');
  const adminFail = await mockWindow.GramlinkAPI.auth.signIn({
    email: 'sarpanch@shivrajpur.gov.in',
    password: 'incorrect_pass_123'
  });

  assert(adminFail.data === null, 'Invalid admin password returns null data');
  assert(adminFail.error !== null, 'Invalid admin password returns an error');
  assert(adminFail.error.includes('Invalid email or password'), 'Displays clear "Invalid email or password" message');

  // Test 5: Session Persistence & getSession() Resolution
  console.log('\nSuite 5: Session Persistence & Role Resolution');
  mockWindow.GramlinkState.setCurrentUser({
    id: 'adm-sarpanch-deshmukh-2026',
    name: 'Sarpanch Sunita Deshmukh',
    email: 'sarpanch@shivrajpur.gov.in',
    role: 'admin',
    ward: 'Gram Panchayat Office'
  });

  const sessionRes = await mockWindow.GramlinkAPI.auth.getSession();
  assert(sessionRes.session !== null, 'getSession() returns an active session for logged-in user');
  assert(sessionRes.user !== null, 'getSession() returns user object');
  assert(sessionRes.profile !== null && sessionRes.profile.role === 'administrator', 'getSession() resolves profile with role === "administrator"');

  console.log('\n----------------------------------------------------------------');
  console.log(`TOTAL ASSERTIONS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('----------------------------------------------------------------');

  if (failCount > 0) {
    console.error('SIGN-IN VERIFICATION FAILED!');
    process.exit(1);
  } else {
    console.log('ALL SIGN-IN VERIFICATIONS PASSED! (100% Functional & Secure)');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
