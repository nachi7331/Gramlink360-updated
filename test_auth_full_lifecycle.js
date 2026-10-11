/**
 * GRAMLINK 360 - Complete Authentication Lifecycle Test Suite
 * Tests:
 * 1. Register a new test account with name, email, password, ward, phone
 * 2. Prevent duplicate email registration with clear error
 * 3. Verify wrong passwords are strictly rejected
 * 4. Sign in with registered credentials
 * 5. Verify session persistence & profile resolution across page refresh
 * 6. Sign out and verify session termination
 * 7. Sign in again with registered credentials
 * 8. Lodge and retrieve grievances using the authenticated resident's UUID
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
console.log('GRAMLINK 360 - FULL REGISTRATION & SIGN-IN LIFECYCLE TEST SUITE');
console.log('================================================================\n');

const clientCode = fs.readFileSync(path.join(rootDir, 'js/supabase-client.js'), 'utf8');

// In-memory localStorage mock
function createMockLocalStorage() {
  const store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    _store: store
  };
}

const mockStorage = createMockLocalStorage();

// Mock Supabase GoTrue Live Server Behavior
const mockSupabaseUsers = {};

function createMockWindow(storage) {
  return {
    localStorage: storage,
    GRAMLINK_CONFIG: {
      SUPABASE_URL: 'https://xzjdrkzetidkvymrfluo.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key'
    },
    supabase: {
      createClient: () => ({
        auth: {
          signUp: async ({ email, password, options }) => {
            const norm = email.toLowerCase();
            if (mockSupabaseUsers[norm]) {
              return { data: { user: { id: mockSupabaseUsers[norm].id, identities: [] } }, error: null };
            }
            const newId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
            mockSupabaseUsers[norm] = {
              id: newId,
              email: norm,
              password,
              user_metadata: options?.data || {}
            };
            return {
              data: {
                user: {
                  id: newId,
                  email: norm,
                  user_metadata: options?.data || {},
                  identities: [{ id: newId }]
                },
                session: null // Emulate unconfirmed email
              },
              error: null
            };
          },
          signInWithPassword: async ({ email, password }) => {
            const norm = email.toLowerCase();
            // Resident demo
            if (norm === 'resident@shivrajpur.in') {
              if (password === 'village123') {
                return { data: null, error: { status: 400, code: 'email_not_confirmed', message: 'Email not confirmed' } };
              } else {
                return { data: null, error: { status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' } };
              }
            }
            // Admin demo
            if (norm === 'sarpanch@shivrajpur.gov.in') {
              if (password === 'sarpanch2026') {
                return { data: null, error: { status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' } };
              } else {
                return { data: null, error: { status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' } };
              }
            }
            // Check mock registered user
            if (mockSupabaseUsers[norm]) {
              if (mockSupabaseUsers[norm].password === password) {
                if (mockSupabaseUsers[norm].email_confirmed) {
                  return {
                    data: {
                      user: mockSupabaseUsers[norm],
                      session: { access_token: 'auth_verified_' + mockSupabaseUsers[norm].id }
                    },
                    error: null
                  };
                }
                return { data: null, error: { status: 400, code: 'email_not_confirmed', message: 'Email not confirmed' } };
              } else {
                return { data: null, error: { status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' } };
              }
            }
            return { data: null, error: { status: 400, code: 'invalid_credentials', message: 'Invalid login credentials' } };
          },
          signOut: async () => ({ error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          onAuthStateChange: () => {}
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              order: () => ({ data: [], error: null }),
              single: () => ({ data: null, error: null })
            }),
            order: () => ({ data: [], error: null })
          }),
          insert: () => ({
            select: () => ({
              single: () => ({ data: null, error: null })
            })
          })
        })
      })
    },
    GramlinkState: {
      storage,
      getCurrentUser: function() {
        try {
          return JSON.parse(this.storage.getItem('gramlink_auth_user')) || null;
        } catch (e) {
          return null;
        }
      },
      setCurrentUser: function(u) {
        this.storage.setItem('gramlink_auth_user', JSON.stringify(u));
      },
      logout: function() {
        this.storage.removeItem('gramlink_auth_user');
      },
      getComplaints: function() {
        try {
          return JSON.parse(this.storage.getItem('gramlink_complaints')) || [];
        } catch (e) {
          return [];
        }
      },
      saveComplaint: function(c) {
        const all = this.getComplaints();
        all.unshift(c);
        this.storage.setItem('gramlink_complaints', JSON.stringify(all));
        return c;
      }
    }
  };
}

async function runLifecycleTests() {
  const window1 = createMockWindow(mockStorage);
  const evalFunc = new Function('window', 'localStorage', 'console', clientCode);
  evalFunc(window1, mockStorage, { log: () => {}, error: () => {}, warn: () => {} });

  const testUser = {
    email: 'siddhesh@shivrajpur.in',
    password: 'Password123!',
    fullName: 'Siddhesh Kulkarni',
    phone: '9822334455',
    ward: 'Ward 4 - Kisan Vasti'
  };

  // -------------------------------------------------------------------------
  // STEP 1: Registration of a new test resident account
  // -------------------------------------------------------------------------
  console.log('STEP 1: Registration of New Test Resident');
  const regRes = await window1.GramlinkAPI.auth.signUp(testUser);

  assert(regRes.error === null, 'Registration produces no error');
  assert(regRes.data !== null && regRes.data.user !== null, 'Registration returns user data');
  assert(regRes.data.user.id !== null && regRes.data.user.id.length > 10, `User assigned genuine UUID: ${regRes.data.user.id}`);
  assert(regRes.data.profile.full_name === 'Siddhesh Kulkarni', 'User profile preserves registered full name');
  assert(regRes.data.profile.ward_no === 'Ward 4 - Kisan Vasti', 'User profile preserves registered ward');
  assert(regRes.data.profile.phone === '9822334455', 'User profile preserves registered phone');
  assert(regRes.data.profile.role === 'resident', 'User profile is assigned role: "resident"');

  // -------------------------------------------------------------------------
  // STEP 2: Prevent duplicate registration with same email
  // -------------------------------------------------------------------------
  console.log('\nSTEP 2: Duplicate Registration Prevention');
  const dupRes = await window1.GramlinkAPI.auth.signUp(testUser);
  assert(dupRes.data === null, 'Duplicate registration returns null data');
  assert(dupRes.error !== null, 'Duplicate registration returns error');
  assert(dupRes.error.includes('already registered'), `Shows clear error: "${dupRes.error}"`);

  // -------------------------------------------------------------------------
  // STEP 3: Verify wrong password rejection
  // -------------------------------------------------------------------------
  console.log('\nSTEP 3: Wrong Password Security Verification');
  const wrongPassRes = await window1.GramlinkAPI.auth.signIn({
    email: testUser.email,
    password: 'WrongPassword999!'
  });
  assert(wrongPassRes.data === null, 'Incorrect password returns null data');
  assert(wrongPassRes.error !== null, 'Incorrect password returns error');
  assert(wrongPassRes.error.includes('Invalid email or password'), 'Displays "Invalid email or password"');

  // -------------------------------------------------------------------------
  // STEP 3.5: Verify unconfirmed resident sign-in is rejected
  // -------------------------------------------------------------------------
  console.log('\nSTEP 3.5: Unconfirmed Resident Sign-In Security Verification');
  const unconfirmedRes = await window1.GramlinkAPI.auth.signIn({
    email: testUser.email,
    password: testUser.password
  });
  assert(unconfirmedRes.data === null, 'Unconfirmed sign in returns null data');
  assert(unconfirmedRes.isUnconfirmed === true, 'Returns isUnconfirmed: true');
  assert(unconfirmedRes.error.includes('Email address not confirmed'), 'Displays clear email verification required error');

  // Complete email confirmation in Supabase backend
  mockSupabaseUsers[testUser.email.toLowerCase()].email_confirmed = true;

  // -------------------------------------------------------------------------
  // STEP 4: Sign in with registered credentials (after email verification)
  // -------------------------------------------------------------------------
  console.log('\nSTEP 4: Sign In with Registered Credentials (Verified)');
  const loginRes = await window1.GramlinkAPI.auth.signIn({
    email: testUser.email,
    password: testUser.password
  });
  assert(loginRes.error === null, 'Sign in with correct credentials succeeds');
  assert(loginRes.data !== null && loginRes.data.user !== null, 'Sign in returns active user object');
  assert(loginRes.data.profile.full_name === 'Siddhesh Kulkarni', 'Profile name correctly matches "Siddhesh Kulkarni"');
  assert(loginRes.data.profile.ward_no === 'Ward 4 - Kisan Vasti', 'Profile ward correctly matches "Ward 4 - Kisan Vasti"');
  assert(loginRes.data.profile.role === 'resident', 'Profile role correctly set to "resident"');

  // Cache user in GramlinkState (as auth.js does upon login)
  window1.GramlinkState.setCurrentUser({
    id: loginRes.data.user.id,
    name: loginRes.data.profile.full_name,
    email: loginRes.data.user.email,
    phone: loginRes.data.profile.phone,
    role: 'citizen',
    ward: loginRes.data.profile.ward_no
  });

  // -------------------------------------------------------------------------
  // STEP 5: Page Refresh Simulation (Session Persistence & Profile Resolution)
  // -------------------------------------------------------------------------
  console.log('\nSTEP 5: Page Refresh & Session Persistence Verification');
  // Re-instantiate window context sharing the same localStorage
  const window2 = createMockWindow(mockStorage);
  evalFunc(window2, mockStorage, { log: () => {}, error: () => {}, warn: () => {} });

  const refreshedSession = await window2.GramlinkAPI.auth.getSession();
  assert(refreshedSession.session !== null, 'Active session restored after simulated page refresh');
  assert(refreshedSession.user !== null, 'User object restored after simulated page refresh');
  assert(refreshedSession.profile !== null, 'Profile object restored after simulated page refresh');
  assert(refreshedSession.profile.full_name === 'Siddhesh Kulkarni', 'Persisted profile retains "Siddhesh Kulkarni"');
  assert(refreshedSession.profile.ward_no === 'Ward 4 - Kisan Vasti', 'Persisted profile retains "Ward 4 - Kisan Vasti"');

  // -------------------------------------------------------------------------
  // STEP 6: Grievance Creation & Retrieval under Authenticated Session
  // -------------------------------------------------------------------------
  console.log('\nSTEP 6: Grievance Redressal Integration');
  const grievancePayload = {
    category: 'utilities',
    title: 'Low Pressure in Water Pipeline',
    description: 'Pipeline pressure drops severely during morning hours in Ward 4.',
    ward: refreshedSession.profile.ward_no,
    applicantName: refreshedSession.profile.full_name,
    applicantPhone: refreshedSession.profile.phone,
    priority: 'High'
  };

  const createComplaintRes = await window2.GramlinkAPI.complaints.create(grievancePayload);
  assert(createComplaintRes.error === null, 'Lodge complaint succeeds under authenticated session');
  assert(createComplaintRes.data.tokenNumber && createComplaintRes.data.tokenNumber.startsWith('GL-2026-'),
    `Assigned official token: ${createComplaintRes.data.tokenNumber}`);
  assert(createComplaintRes.data.citizen_id === loginRes.data.user.id, 'Complaint citizen_id matches user UUID');

  // Save to GramlinkState for resident table sync
  window2.GramlinkState.saveComplaint(createComplaintRes.data);

  // List complaints for resident
  const listRes = await window2.GramlinkAPI.complaints.listForResident();
  assert(listRes.error === null, 'listForResident succeeds without "Not authenticated" error');
  assert(listRes.data.length > 0, `listForResident returns ${listRes.data.length} complaint(s) for user`);
  assert(listRes.data[0].title === grievancePayload.title, 'Resident grievance history displays filed complaint');

  // -------------------------------------------------------------------------
  // STEP 7: Sign Out Verification
  // -------------------------------------------------------------------------
  console.log('\nSTEP 7: Sign Out Verification');
  const logoutRes = await window2.GramlinkAPI.auth.signOut();
  window2.GramlinkState.logout();
  assert(logoutRes.error === null, 'Sign out completes without error');
  assert(window2.GramlinkState.getCurrentUser() === null, 'GramlinkState currentUser cleared');

  const postLogoutSession = await window2.GramlinkAPI.auth.getSession();
  assert(postLogoutSession.session === null, 'getSession() returns null session after logout');
  assert(postLogoutSession.user === null, 'getSession() returns null user after logout');

  // -------------------------------------------------------------------------
  // STEP 8: Sign In Again with Registered Credentials
  // -------------------------------------------------------------------------
  console.log('\nSTEP 8: Re-Sign In Verification');
  const reLoginRes = await window2.GramlinkAPI.auth.signIn({
    email: testUser.email,
    password: testUser.password
  });
  assert(reLoginRes.error === null, 'Re-login succeeds with original registered password');
  assert(reLoginRes.data.user.id === loginRes.data.user.id, 'User ID matches original registration UUID');
  assert(reLoginRes.data.profile.full_name === 'Siddhesh Kulkarni', 'User profile retains name on re-login');

  console.log('\n----------------------------------------------------------------');
  console.log(`TOTAL LIFECYCLE ASSERTIONS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('----------------------------------------------------------------');

  if (failCount > 0) {
    console.error('LIFECYCLE VERIFICATION FAILED!');
    process.exit(1);
  } else {
    console.log('ALL LIFECYCLE VERIFICATIONS PASSED! (100% End-to-End Success)');
    process.exit(0);
  }
}

runLifecycleTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
