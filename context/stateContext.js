'use client'
import React, {  createContext, useContext,useEffect,useRef,useState } from "react"
import { v4 as uuidv4 } from 'uuid';

// Firebase is loaded lazily so it stays out of the shared bundle. These
// module-level holders are populated by loadFirebase() on first use, which
// lets every existing call site (collection(db,...), signInWithPopup(auth,...))
// keep working unchanged once loadFirebase() has run.
let db, auth;
let collection, getDocs, query, where, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, startAt, endAt;
let signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithCustomToken;

let _fbPromise = null;
function loadFirebase() {
  if (!_fbPromise) {
    _fbPromise = (async () => {
      const [cfg, fs, au] = await Promise.all([
        import('./firebaseConfig'),
        import('firebase/firestore'),
        import('firebase/auth'),
      ]);
      db = await cfg.getDb();
      auth = await cfg.getAuthInstance();
      ({ collection, getDocs, query, where, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, startAt, endAt } = fs);
      ({ signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithCustomToken } = au);
    })();
  }
  return _fbPromise;
}


const Context=createContext()
export const useStateContext=()=>useContext(Context)

// Helper: route all admin writes through the server-side API
// This ensures Firestore rules can deny direct client writes
async function adminWrite(action, collectionName, data, id) {
  const token = localStorage.getItem('adminToken')
  if (!token) throw new Error('No admin session')

  // Mark serverTimestamp fields so the API route can convert them
  const processedData = data ? JSON.parse(JSON.stringify(data, (key, value) => {
    // serverTimestamp() returns an object with type 'serverTimestamp'
    if (value && typeof value === 'object' && value.type === 'serverTimestamp') {
      return { _serverTimestamp: true }
    }
    return value
  })) : undefined

  const res = await fetch('/api/admin/firestore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action, collection: collectionName, data: processedData, id }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    // 401 = the admin session token is missing/expired/invalid. Clear it and
    // send the admin back to the login screen with a clear message, instead of
    // surfacing a confusing "Unauthorized" error mid-action.
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('adminAuth')
      localStorage.removeItem('adminUser')
      localStorage.removeItem('adminToken')
      localStorage.setItem('logoutMessage', 'Your session expired. Please log in again.')
      window.location.reload()
    }
    throw new Error(err.error || 'Admin write failed')
  }

  return res.json()
}

// Read a whole collection through the server (Admin SDK), authenticated by the
// admin HMAC token. Lets the admin dashboard read data on ANY device without a
// client-side Firebase session (which is unreliable in installed PWAs).
async function adminRead(collectionName) {
  const token = localStorage.getItem('adminToken')
  if (!token) throw new Error('No admin session')

  const res = await fetch('/api/admin/firestore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'list', collection: collectionName }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('adminAuth')
      localStorage.removeItem('adminUser')
      localStorage.removeItem('adminToken')
      localStorage.setItem('logoutMessage', 'Your session expired. Please log in again.')
      window.location.reload()
    }
    throw new Error(err.error || 'Admin read failed')
  }

  const { docs } = await res.json()
  return docs || []
}

// Cached full members directory for the public members pages (avoids stale
// React closures and repeat fetches within a session).
let _memberDir = null

// Load the full members directory from the server. The server verifies the
// user's Google ID token and checks the gmail allow-list, then returns the
// members via the Admin SDK — so the public members pages do NOT depend on a
// client-side Firebase custom claim (fragile in installed PWAs).
async function loadMemberDirectory() {
  await loadFirebase()
  const currentUser = auth.currentUser
  if (!currentUser) return { authorized: false, members: [] }
  const idToken = await currentUser.getIdToken()
  const res = await fetch('/api/members-data', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${idToken}` },
  })
  if (!res.ok) return { authorized: false, members: [] }
  const data = await res.json()
  return { authorized: !!data.authorized, members: data.members || [] }
}

// Establish a Firebase Auth session for the logged-in admin by minting a
// custom token server-side and signing in with it. The token carries an
// `admin: true` custom claim, which Firestore rules require to read the
// protected admins/activityLog collections — so the dashboard works on any
// device without a separate Google sign-in.
async function ensureFirebaseAdminAuth() {
  const token = localStorage.getItem('adminToken')
  if (!token) return
  try {
    await loadFirebase()
    // If already signed in WITH the admin claim, nothing to do. A plain Google
    // session (no admin claim) must still be upgraded to an admin session.
    if (auth.currentUser) {
      try {
        const result = await auth.currentUser.getIdTokenResult()
        if (result.claims && result.claims.admin === true) return
      } catch (e) {
        // Couldn't read claims — fall through and re-establish the session
      }
    }
    const res = await fetch('/api/firebase-token', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!res.ok) return
    const { token: firebaseToken } = await res.json()
    if (firebaseToken) {
      await signInWithCustomToken(auth, firebaseToken)
    }
  } catch (e) {
    // Non-fatal — reads will fail until a valid Firebase session exists
    console.error('Failed to establish Firebase admin auth:', e)
  }
}

export const StateContext =({children})=>{
    const [isEnglish, setIsEnglish] = useState(true)
    const [isAuthenticated,setIsAuthenticated]=useState(false)
    const [isAuthLoading,setIsAuthLoading]=useState(true)
    const [pageValue,setPageValue]=useState(0)
    const [adminUser, setAdminUser] = useState(null)
    const [newBranchData, setNewBranchData] = useState([]);
    const [newHomeData, setNewHomeData] = useState([]);
    const [viewFamilyData,setViewFamilyData]= useState([]);
    const [memberObj,setMemberObj]= useState(null);
    const [events,setEvents] = useState(null)
    const [gallery,setGallery] = useState(null)
    const [executives,setExecutives] = useState(null)
    const [members,setMembers] = useState(null)
    const [user,setuser]=useState(null)
    const [isGmailAuthenticated,setIsGmailAuthenticated]=useState(false)
    const [isAuthorised,setIsAuthorised]=useState(true)
    const [deniedEmail,setDeniedEmail]=useState(null)
    const [gmail,setGmail]=useState(null)
    const [isGmailLoading,setIsGmailLoading]=useState(true)
    const [logoutMessage, setLogoutMessage] = useState('')


    // Hydrate auth and page state from localStorage after mount (avoids SSR flash)
    useEffect(() => {
      const savedAuth = localStorage.getItem('adminAuth') === 'true'
      const savedPage = localStorage.getItem('adminPage')
      const savedAdmin = localStorage.getItem('adminUser')
      const savedLogoutMsg = localStorage.getItem('logoutMessage')

      if (savedLogoutMsg) {
        setLogoutMessage(savedLogoutMsg)
        localStorage.removeItem('logoutMessage')
      }

      if (savedAuth && savedAdmin) {
        try {
          const parsed = JSON.parse(savedAdmin)
          setAdminUser(parsed)
          setIsAuthenticated(true)
          if (savedPage !== null) setPageValue(Number(savedPage))

          // Re-establish the Firebase Auth session for this restored admin,
          // then verify the session against Firestore (which needs that auth)
          ensureFirebaseAdminAuth().finally(() => verifySession(parsed))
        } catch (e) {
          setIsAuthLoading(false)
        }
      } else {
        setIsAuthLoading(false)
      }
    }, [])

    // Verify that the admin session is still valid
    async function verifySession(admin) {
      try {
        await loadFirebase()
        const adminsRef = collection(db, 'admins')

        // Try finding by id first, then username
        let snap = await getDocs(query(adminsRef, where('id', '==', admin.id)))
        if (snap.empty) {
          snap = await getDocs(query(adminsRef, where('username', '==', admin.username)))
        }

        if (snap.empty) {
          // Admin account deleted
          forceLogout('Your admin account has been removed. Please contact the Super Admin.')
          return
        }

        const firestoreAdmin = snap.docs[0].data()

        if (firestoreAdmin.isActive === false) {
          // Admin deactivated
          forceLogout('Your admin account has been deactivated. Please contact the Super Admin.')
          return
        }

        const storedVersion = admin.sessionVersion || 0
        const currentVersion = firestoreAdmin.sessionVersion || 0
        if (storedVersion !== currentVersion) {
          // Password or credentials changed
          forceLogout('Your password was changed. Please log in again with your new credentials.')
          return
        }

        // Session valid — sync latest data from Firestore
        const updatedAdmin = {
          ...admin,
          name: firestoreAdmin.name,
          username: firestoreAdmin.username,
          role: firestoreAdmin.role,
          permissions: firestoreAdmin.permissions || admin.permissions,
          sessionVersion: currentVersion,
        }
        setAdminUser(updatedAdmin)
        localStorage.setItem('adminUser', JSON.stringify(updatedAdmin))
        setIsAuthLoading(false)
      } catch (error) {
        // On network error, allow existing session to continue
        setIsAuthLoading(false)
      }
    }

    function forceLogout(message) {
      // Clear server-side session cookie
      fetch('/api/logout', { method: 'POST' }).catch(() => {})

      setIsAuthenticated(false)
      setPageValue(0)
      setAdminUser(null)
      localStorage.removeItem('adminAuth')
      localStorage.removeItem('adminPage')
      localStorage.removeItem('adminUser')
      localStorage.removeItem('adminToken')
      localStorage.setItem('logoutMessage', message)
      setLogoutMessage(message)
      setIsAuthLoading(false)
    }

    // Persist pageValue to localStorage whenever it changes
    useEffect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminPage', String(pageValue))
      }
    }, [pageValue])

    //fetch function for authenticate user

    const authenticateUser=async(credentials)=>{
        const url = '/api/authentication';
        const options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        };

        try {
          const response = await fetch(url, options);
          const responseData = await response.json();

          // Handle rate limiting (429)
          if (response.status === 429) {
            return { success: false, error: responseData.error, locked: true };
          }

          setIsAuthenticated(responseData.isAuthenticated)
          if (responseData.isAuthenticated) {
            localStorage.setItem('adminAuth', 'true')
            if (responseData.admin) {
              setAdminUser(responseData.admin)
              localStorage.setItem('adminUser', JSON.stringify(responseData.admin))

              // Store session token for API authorization
              if (responseData.token) {
                localStorage.setItem('adminToken', responseData.token)
              }

              // Establish a Firebase Auth session so the dashboard can read
              // protected collections on this device (no Google sign-in needed)
              await ensureFirebaseAdminAuth()

              // Log login activity
              try {
                await adminWrite('add', 'activityLog', {
                  id: uuidv4(),
                  adminId: responseData.admin.id,
                  adminName: responseData.admin.name,
                  action: 'Logged In',
                  module: 'Auth',
                  details: `${responseData.admin.name} logged in`,
                  createdAt: { _serverTimestamp: true },
                })
              } catch (e) {
                // Activity logging is non-critical
              }
            }
          }
          return { success: responseData.isAuthenticated };
        } catch (error) {
          return { success: false, error: 'Something went wrong. Please try again.' };
        }
    }
    async function addMember(obj) {
      const uniqueId = uuidv4();
      const data = { ...obj, id: uniqueId, createdAt: { _serverTimestamp: true } };

      // Auto-assign sharedMemberId for Late Parent / Additional Member
      if (obj.relation === 'Late Parent / Additional Member' && !obj.sharedMemberId) {
        data.sharedMemberId = uuidv4();
      }

      await adminWrite('add', 'members', data);
    }
    async function addGallery(obj) {
      try {
        const uniqueId = uuidv4();
        await adminWrite('add', 'gallery', { ...obj, id: uniqueId });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
    async function addEvent(obj) {
      try {
        const uniqueId = uuidv4();
        await adminWrite('add', 'events', { ...obj, id: uniqueId, createdAt: { _serverTimestamp: true } });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
    async function addExecutive(obj) {
      try {
        const uniqueId = uuidv4();
        await adminWrite('add', 'executives', { ...obj, id: uniqueId });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
    async function addGmail(obj) {
      try {
        const uniqueId = uuidv4();
        await adminWrite('add', 'gmail', { ...obj, id: uniqueId });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
 
    const handleLogOut=async()=>{
      // Log logout activity before clearing session
      if (adminUser) {
        try {
          await adminWrite('add', 'activityLog', {
            id: uuidv4(),
            adminId: adminUser.id,
            adminName: adminUser.name,
            action: 'Logged Out',
            module: 'Auth',
            details: `${adminUser.name} logged out`,
            createdAt: { _serverTimestamp: true },
          })
        } catch (e) {
          // Activity logging is non-critical
        }
      }

      // Clear server-side session cookie
      try {
        await fetch('/api/logout', { method: 'POST' })
      } catch (e) {
        // Continue with local cleanup even if server call fails
      }

      setIsAuthenticated(false)
      setPageValue(0)
      setAdminUser(null)
      localStorage.removeItem('adminAuth')
      localStorage.removeItem('adminPage')
      localStorage.removeItem('adminUser')
      localStorage.removeItem('adminToken')
      localStorage.setItem('logoutMessage', 'You have been logged out successfully.')

      // Sign out the admin's Firebase custom-token session (no email).
      // Leave a Google session (email present) intact — that's the public members flow.
      try {
        await loadFirebase()
        if (auth.currentUser && !auth.currentUser.email) {
          await signOut(auth)
        }
      } catch (e) {
        // Non-fatal
      }
    }

    // Permission helper
    const hasPermission = (type) => {
      if (!adminUser) return false
      if (adminUser.role === 'superAdmin') return true
      return adminUser.permissions?.[type] === true
    }

    // Activity logger
    async function logActivity(action, module, details) {
      try {
        await adminWrite('add', 'activityLog', {
          id: uuidv4(),
          adminId: adminUser?.id || 'unknown',
          adminName: adminUser?.name || 'Unknown',
          action,
          module,
          details,
          createdAt: { _serverTimestamp: true },
        })
      } catch (error) {
        console.error('Error logging activity:', error)
      }
    }

    // Search for existing late/additional members that can be linked (shared across branches)
    // Uses already-loaded members array to avoid needing extra Firestore composite indexes
    function searchSharedLateMembers(inputString) {
      if (!inputString || !inputString.trim() || !members) return []
      const q = inputString.trim().toLowerCase()
      const lateMembers = members.filter(
        (m) => m.relation === 'Late Parent / Additional Member' &&
               (m.name || '').toLowerCase().includes(q)
      )
      // Deduplicate: show only one entry per sharedMemberId
      const results = []
      const seenShared = new Set()
      lateMembers.forEach((m) => {
        const key = m.sharedMemberId || m.id
        if (!seenShared.has(key)) {
          seenShared.add(key)
          results.push(m)
        }
      })
      return results
    }

    // Ensure the full members directory is loaded (from the server) and cached.
    // Returns the members array, or null if the user is not authorized.
    async function ensureMemberDirectory(forceRefresh = false) {
      if (!forceRefresh && _memberDir) return _memberDir
      const dir = await loadMemberDirectory()
      if (dir.authorized) {
        _memberDir = dir.members
        setMembers(dir.members)
        return dir.members
      }
      return null
    }

    // Get all branches that share a late member (by sharedMemberId)
    async function getSharedMemberBranches(sharedMemberId) {
      if (!sharedMemberId) return []
      try {
        const all = await ensureMemberDirectory()
        if (!all) return []
        const sharedEntries = all.filter((m) => m.sharedMemberId === sharedMemberId)
        const branchIds = [...new Set(sharedEntries.map((e) => e.relatedTo).filter(Boolean))]
        if (branchIds.length === 0) return []
        return branchIds.map((bid) => all.find((m) => m.id === bid)).filter(Boolean)
      } catch (error) {
        console.error('Error fetching shared member branches:', error)
        return []
      }
    }

    // Admin add/edit form: find members by name to pick a "related to" parent.
    // Filters the members already loaded in the admin dashboard (via the server),
    // falling back to a server read \u2014 no client Firestore query needed.
    async function searchMembersByName(inputString) {
      if (!inputString || !inputString.trim()) return [];
      const q = inputString.trim().toLowerCase();
      let source = members;
      if (!source || source.length === 0) {
        try { source = await adminRead('members'); } catch { source = []; }
      }
      return (source || []).filter((m) => (m.name || '').toLowerCase().includes(q));
    }

// Assuming you have initialized your Firestore instance as 'db'

      async function getMembersWithNewBranchRelation(forceRefresh = false) {
        // Load the directory from the server (allow-list enforced there).
        const allMembers = await ensureMemberDirectory(forceRefresh);
        if (!allMembers) return { authorized: false, branches: [], newHomes: [] };

        const branches = allMembers.filter((m) => m.relation === 'New Branch');
        const newHomes = allMembers.filter((m) => m.isNewHome === true);

        // Count family members for each branch/home
        const withCount = (list) => list.map((head) => {
          const familyMembers = allMembers.filter((m) => m.relatedTo === head.id);
          return { ...head, totalMembers: 1 + familyMembers.length };
        });

        const b = withCount(branches);
        const h = withCount(newHomes);
        setNewBranchData(b);
        setNewHomeData(h);
        return { authorized: true, branches: b, newHomes: h };
      }

      async function fetchAllMembers() {
        try {
          // Read via the server (Admin SDK) so the admin dashboard works on any
          // device/PWA without needing a client-side Firebase session.
          const membersArray = await adminRead('members');
          setMembers(membersArray);
          return membersArray;
        } catch (error) {
          console.error('Error fetching all members:', error);
          return [];
        }
      }

      async function getMembersByRelatedTo(id) {
        try {
          // Filter the server-loaded directory (no client Firestore read / claim)
          const all = await ensureMemberDirectory()
          if (!all) { setViewFamilyData([]); return [] }
          const membersData = all.filter((m) => m.relatedTo === id)
          setViewFamilyData(membersData)
          return membersData;
        } catch (error) {
          console.error("Error fetching members:", error);
          return []; // Or handle error appropriately
        }
      }

      // async function getMemberById(id) {
      //   const docRef = doc(db, 'members', id);
      
      //   try {
      //     const docSnap = await getDoc(docRef);
      //     console.log(id);
          
      //     if (docSnap.exists()) {
      //       console.log(docSnap.data());
      //       return docSnap.data();
      //     } else {
      //       console.error('No such document!');
      //       return null; 
      //  // Or handle the case where document doesn't exist
      //     }
      //   } catch (error) {
      //     console.error('Error getting document:', error);
      //     return null; // Or handle the error appropriately
      //   }
      // }

      async function getMemberById(id) {
        const all = await ensureMemberDirectory();
        if (!all) return null;
        const found = all.find((m) => m.id === id);
        if (found) {
          setMemberObj(found);
          return found;
        }
        return null;
      }
  
      async function fetchAllEvents() {
        try {
          await loadFirebase()
          const eventsCollection = collection(db, 'events');
          const querySnapshot = await getDocs(eventsCollection);
          const eventsData = querySnapshot.docs.map((doc )=> ({
            id: doc.id,
            ...doc.data(),
          }));
          setEvents(eventsData)
          return eventsData;
        } catch (error) {
          console.error("Error fetching events:", error);
          throw error; // Rethrow the error for proper handling
        }
      }

      async function fetchAllGallery() {
        try {
          await loadFirebase()
          const galleryCollection = collection(db, 'gallery');
          const querySnapshot = await getDocs(galleryCollection);
          const galleryData = querySnapshot.docs.map((doc )=> ({
            id: doc.id,
            ...doc.data(),
          }));
          setGallery(galleryData)
          return galleryData;
        } catch (error) {
          console.error("Error fetching gallery:", error);
          throw error; // Rethrow the error for proper handling
        }
      }

      async function fetchAllExecutives() {
        try {
          await loadFirebase()
          const executivesCollection = collection(db, 'executives');
          const querySnapshot = await getDocs(executivesCollection);
          const executivesData = querySnapshot.docs.map((doc )=> ({
            id: doc.id,
            ...doc.data(),
          }));
          setExecutives(executivesData)
          return executivesData;
        } catch (error) {
          console.error("Error fetching gallery:", error);
          throw error; // Rethrow the error for proper handling
        }
      }

      async function fetchAllGmail() {
        try {
          // Read via the server (Admin SDK) so it works on any device/PWA
          const gmailData = await adminRead('gmail');
          setGmail(gmailData)
          return gmailData;
        } catch (error) {
          console.error("Error fetching gmail:", error);
          throw error; // Rethrow the error for proper handling
        }
      }

      async function deleteDocument(collectionName, id) {
        if (collectionName === 'members') {
          // Use server-side recursive delete for members
          await adminWrite('deleteRecursive', 'members', null, id);
          setMembers((members) => members?.filter((member) => member.id !== id));
        } else {
          await adminWrite('delete', collectionName, null, id);
          if (collectionName === 'gallery') {
            setGallery((gallery) => gallery?.filter((g) => g.id !== id));
          }
          if (collectionName === 'events') {
            setEvents((events) => events?.filter((event) => event.id !== id));
          }
          if (collectionName === 'executives') {
            setExecutives((executives) => executives?.filter((executive) => executive.id !== id));
          }
          if (collectionName === 'gmail') {
            setGmail((gmail) => gmail?.filter((g) => g.id !== id));
          }
        }
      }

      // async function deleteImageFromStorage(imageUrl, folderName) {
      //   try {
      //     const imageRef = ref(storage, `${folderName}/${imageUrl}`);
      
      //     await deleteObject(imageRef);
      //     console.log('Image deleted successfully!');
      //   } catch (error) {
      //     console.error('Error deleting image:', error);   
      
      //   }
      // }
      async function updateMember(updatedData) {
        await adminWrite('update', 'members', updatedData, updatedData.id);
      }

      async function updateDocument(collectionName, updatedData) {
        try {
          await adminWrite('update', collectionName, updatedData, updatedData.id);
        } catch (error) {
          console.error('Error updating document:', error);
        }
      }

      const googleSignIn = async () => {
        await loadFirebase()
        const provider = new GoogleAuthProvider()
        try {
          // Try popup first (works on most mobile and all desktop browsers)
          const res = await signInWithPopup(auth, provider)
          setuser({ gmail: res.user.email })
        } catch (error) {
          // Popup blocked or closed — fall back to redirect
          // Popup blocked or closed — fall back to redirect
          if (error.code === 'auth/popup-blocked' ||
              error.code === 'auth/popup-closed-by-user' ||
              error.code === 'auth/cancelled-popup-request') {
            try {
              await signInWithRedirect(auth, provider)
            } catch (redirectError) {
              // Redirect failed silently
            }
          }
        }
      }
      async function getGmail(gmail) {
        // Authorize AND load the directory in one server call. The server checks
        // the allow-list and returns the members via the Admin SDK — no client
        // Firebase custom claim needed (robust in installed PWAs).
        try {
          const result = await getMembersWithNewBranchRelation(true)
          if (result.authorized) {
            setIsGmailAuthenticated(true)
            return
          }
          // Not on the allow-list
          setIsAuthorised(false)
          setDeniedEmail(gmail)
        } catch (error) {
          console.error('Gmail access check failed:', error)
          setIsAuthorised(false)
          setDeniedEmail(gmail)
        }
      }
      const googleSignOut=async()=>{
          await loadFirebase()
          await signOut(auth)
          _memberDir = null
          setuser(null)
          setIsGmailAuthenticated(false)
          setIsAuthorised(true)
          setDeniedEmail(null)
      }

      // Set up the Gmail (members) auth listener ON DEMAND — only when a
      // members page calls initGmailAuth(). This is what keeps Firebase out of
      // the public pages that never touch member data.
      const gmailAuthStarted = useRef(false)
      const initGmailAuth = React.useCallback(async () => {
        if (gmailAuthStarted.current) return
        gmailAuthStarted.current = true
        await loadFirebase()
        // Mobile redirect sign-in result (after a page reload)
        getRedirectResult(auth).then((result) => {
          if (result && result.user) setuser({ gmail: result.user.email })
        }).catch(() => setIsGmailLoading(false))
        // Listen for Firebase auth state changes. Admins sign in via custom
        // token (no email) — that session is only for reads, not the public
        // Gmail-gated flow, so it's ignored here.
        onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser && firebaseUser.email) {
            setuser({ gmail: firebaseUser.email })
          } else {
            setuser(null)
            setIsGmailAuthenticated(false)
            setIsGmailLoading(false)
          }
        })
      }, [])

      useEffect(()=>{
        if(user){
          setIsGmailLoading(true)
          getGmail(user.gmail).finally(() => {
            setIsGmailLoading(false)
          })
        }
      },[user])

    // Deduplicate members by sharedMemberId — shared late members count as one
    function getDeduplicatedMembers(membersList) {
      if (!membersList) return []
      const unique = []
      const seenShared = new Set()
      membersList.forEach((m) => {
        if (m.sharedMemberId) {
          if (!seenShared.has(m.sharedMemberId)) {
            seenShared.add(m.sharedMemberId)
            unique.push(m)
          }
        } else {
          unique.push(m)
        }
      })
      return unique
    }

    // Memoize context value so consumers only re-render when actual data changes,
    // not on every StateContext render caused by unrelated state updates
    const contextValue = React.useMemo(() => ({
        isEnglish, setIsEnglish,
        authenticateUser, isAuthenticated, isAuthLoading,
        pageValue, setPageValue,
        addMember, handleLogOut,
        searchMembersByName, searchSharedLateMembers, getSharedMemberBranches,
        getMembersWithNewBranchRelation, ensureMemberDirectory,
        fetchAllMembers, setNewBranchData, newBranchData, newHomeData,
        getMembersByRelatedTo, viewFamilyData, setViewFamilyData,
        memberObj, setMemberObj, getMemberById,
        addGallery, addEvent, fetchAllEvents, setEvents, events,
        fetchAllGallery, setGallery, gallery,
        addExecutive, fetchAllExecutives, executives, setExecutives,
        deleteDocument, members, setMembers, updateMember, updateDocument, getDeduplicatedMembers,
        addGmail, googleSignIn, googleSignOut, initGmailAuth,
        user, isGmailAuthenticated, setIsGmailAuthenticated,
        isAuthorised, setIsAuthorised, deniedEmail,
        gmail, fetchAllGmail, isGmailLoading,
        adminUser, setAdminUser, hasPermission, logActivity,
        adminRead,
        logoutMessage, setLogoutMessage
    }), [
        isEnglish, isAuthenticated, isAuthLoading, pageValue,
        newBranchData, newHomeData, viewFamilyData, memberObj,
        events, gallery, executives, members,
        user, isGmailAuthenticated, isAuthorised, deniedEmail,
        gmail, isGmailLoading, adminUser, logoutMessage
    ]);

    return(
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}