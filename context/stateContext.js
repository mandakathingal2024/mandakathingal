'use client'
import React, {  createContext, useContext,useEffect,useRef,useState } from "react"
import { db,storage,auth } from "./firebaseConfig"
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithCustomToken } from "firebase/auth";
import { doc, setDoc,getDoc, deleteDoc,addDoc,collection, getDocs, query, where, orderBy, startAt, endAt ,updateDoc, serverTimestamp  } from "firebase/firestore";
// import { ref, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';


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
    throw new Error(err.error || 'Admin write failed')
  }

  return res.json()
}

// Establish a Firebase Auth session for the logged-in admin by minting a
// custom token server-side and signing in with it. This satisfies the
// Firestore rule `request.auth != null` so the dashboard can read protected
// collections on any device — without requiring a separate Google sign-in.
async function ensureFirebaseAdminAuth() {
  // Already signed in to Firebase — nothing to do
  if (auth.currentUser) return
  const token = localStorage.getItem('adminToken')
  if (!token) return
  try {
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

    // Get all branches that share a late member (by sharedMemberId)
    // Uses Firestore queries since the `members` state may only contain a single family's data
    async function getSharedMemberBranches(sharedMemberId) {
      if (!sharedMemberId) return []
      try {
        const membersRef = collection(db, 'members')
        const q = query(membersRef, where('sharedMemberId', '==', sharedMemberId))
        const snap = await getDocs(q)
        const sharedEntries = snap.docs.map((d) => d.data())

        // For each shared entry, find who they are "relatedTo" (the branch head)
        const branchIds = [...new Set(sharedEntries.map((e) => e.relatedTo).filter(Boolean))]
        if (branchIds.length === 0) return []

        // Fetch branch heads in parallel
        const branchPromises = branchIds.map(async (branchId) => {
          const bq = query(membersRef, where('id', '==', branchId))
          const bSnap = await getDocs(bq)
          return bSnap.empty ? null : bSnap.docs[0].data()
        })
        const branches = (await Promise.all(branchPromises)).filter(Boolean)
        return branches
      } catch (error) {
        console.error('Error fetching shared member branches:', error)
        return []
      }
    }

    async function searchMembersByName(inputString) {
      if(inputString!==''){
        const membersCollectionRef = collection(db, "members");
      
        // Create a query to find documents where 'name' starts with the input string
        const q = query(
          membersCollectionRef,
          where("name", ">=", inputString),
          where("name", ">=", inputString.toUpperCase()),
          where("name", "<", inputString + "\uf8ff"), // Use a Unicode character to find all names starting with the input
          orderBy("name") // Order by name for better results
        );
        // const caseInsensitiveRegex = new RegExp(`^${inputString.toLowerCase()}.+$`, 'i');
        // const q = query(membersCollectionRef, where("name", ">=", caseInsensitiveRegex));
      
        try {
          const querySnapshot = await getDocs(q);
          const foundDocuments = [];
      
          querySnapshot.forEach((doc) => {
            foundDocuments.push(doc.data());
          });
          return foundDocuments; // Return the array of found documents
        } catch (error) {
          console.error("Error searching members: ", error);
          return []; // Return an empty array if there's an error
        }
      }
      if(inputString===''){
         await getMembersWithNewBranchRelation()
      }
    }

// Assuming you have initialized your Firestore instance as 'db'

      async function getMembersWithNewBranchRelation(forceRefresh = false) {
        // Skip re-fetching only if full data is already loaded
        // Check both members AND newBranchData to ensure we have the complete dataset
        if (!forceRefresh && members && members.length > 0 && newBranchData && newBranchData.length > 0) {
          return { branches: newBranchData, newHomes: newHomeData };
        }

        const membersCollection = collection(db, 'members');
        const querySnapshot = await getDocs(membersCollection);

        const allMembers = [];
        querySnapshot.forEach((doc) => {
          allMembers.push({ id: doc.id, ...doc.data() });
        });

        const branches = allMembers.filter((m) => m.relation === 'New Branch');
        const newHomes = allMembers.filter((m) => m.isNewHome === true);

        // Count family members for each branch/home
        const withCount = (list) => list.map((head) => {
          const familyMembers = allMembers.filter((m) => m.relatedTo === head.id);
          return { ...head, totalMembers: 1 + familyMembers.length };
        });

        setNewBranchData(withCount(branches));
        setNewHomeData(withCount(newHomes));
        setMembers(allMembers);
        return { branches: withCount(branches), newHomes: withCount(newHomes) };
      }

      async function fetchAllMembers() {
        try {
          const membersCollection = collection(db, 'members');
          const querySnapshot = await getDocs(membersCollection);
          const membersArray = [];
          querySnapshot.forEach((doc) => {
            membersArray.push({ id: doc.id, ...doc.data() });
          });
          setMembers(membersArray);
          return membersArray;
        } catch (error) {
          console.error('Error fetching all members:', error);
          return [];
        }
      }

      async function getMembersByRelatedTo(id) {
        try {
          const membersCollection = collection(db, "members");
          const q = query(membersCollection, where("relatedTo", "==", id));
          const querySnapshot = await getDocs(q);

          const membersData = [];
          querySnapshot.forEach((doc) => {
            membersData.push(doc.data());
          });
          setViewFamilyData(membersData)
          // NOTE: Do NOT setMembers here — it corrupts the full members list
          // used by the Members page. viewFamilyData is the correct state for family view.
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
        const membersRef = collection(db, "members");
        const q = query(membersRef, where("id", "==", id));
        const querySnapshot = await getDocs(q);
      
        if (querySnapshot.size > 0) {
          setMemberObj(querySnapshot.docs[0].data());
          return querySnapshot.docs[0].data();
        } else {
          return null; // Or handle the case where no member is found
        }
      }
  
      async function fetchAllEvents() {
        try {
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
          const gmailCollection = collection(db, 'gmail');
          const querySnapshot = await getDocs(gmailCollection);
          const gmailData = querySnapshot.docs.map((doc )=> ({
            id: doc.id,
            ...doc.data(),
          }));
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
        try {
          const membersRef = collection(db, "gmail");
          // Try exact match first (works with strict Firestore rules)
          const q = query(membersRef, where("gmail", "==", gmail.toLowerCase()));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.size > 0) {
            setIsGmailAuthenticated(true)
            return querySnapshot.docs[0].data();
          }

          // Fallback: try original case (for old entries stored with mixed case)
          if (gmail !== gmail.toLowerCase()) {
            const q2 = query(membersRef, where("gmail", "==", gmail));
            const querySnapshot2 = await getDocs(q2);
            if (querySnapshot2.size > 0) {
              setIsGmailAuthenticated(true)
              return querySnapshot2.docs[0].data();
            }
          }

          setIsAuthorised(false)
          setDeniedEmail(gmail)
        } catch (error) {
          console.error('Gmail access check failed:', error)
          setIsAuthorised(false)
          setDeniedEmail(gmail)
        }
      }
      const googleSignOut=async()=>{
          await signOut(auth)
          setuser(null)
          setIsGmailAuthenticated(false)
          setIsAuthorised(true)
          setDeniedEmail(null)
      }

      // Handle mobile redirect result after page reload
      useEffect(()=>{
        getRedirectResult(auth).then((result) => {
          if(result && result.user){
            setuser({ gmail: result.user.email })
          }
        }).catch(() => {
          setIsGmailLoading(false)
        })
      },[])

      // Persist auth: listen for Firebase auth state on mount
      useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          // Admins sign in via custom token (no email) — that session is only
          // for Firestore reads, not the public Gmail-gated members flow. Ignore it here.
          if(firebaseUser && firebaseUser.email){
            setuser({ gmail: firebaseUser.email })
          } else {
            setuser(null)
            setIsGmailAuthenticated(false)
            setIsGmailLoading(false)
          }
        })
        return () => unsubscribe()
      },[])

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
        getMembersWithNewBranchRelation,
        fetchAllMembers, setNewBranchData, newBranchData, newHomeData,
        getMembersByRelatedTo, viewFamilyData, setViewFamilyData,
        memberObj, setMemberObj, getMemberById,
        addGallery, addEvent, fetchAllEvents, setEvents, events,
        fetchAllGallery, setGallery, gallery,
        addExecutive, fetchAllExecutives, executives, setExecutives,
        deleteDocument, members, setMembers, updateMember, updateDocument, getDeduplicatedMembers,
        addGmail, googleSignIn, googleSignOut,
        user, isGmailAuthenticated, setIsGmailAuthenticated,
        isAuthorised, setIsAuthorised, deniedEmail,
        gmail, fetchAllGmail, isGmailLoading,
        adminUser, setAdminUser, hasPermission, logActivity,
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