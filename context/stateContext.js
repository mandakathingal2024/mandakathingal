'use client'
import React, {  createContext, useContext,useEffect,useRef,useState } from "react"
import { db,storage,auth } from "./firebaseConfig"
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc,getDoc, deleteDoc,addDoc,collection, getDocs, query, where, orderBy, startAt, endAt ,updateDoc, serverTimestamp  } from "firebase/firestore";
// import { ref, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';


const Context=createContext()
export const useStateContext=()=>useContext(Context)

export const StateContext =({children})=>{
    const [isEnglish, setIsEnglish] = useState(true)
    const [isAuthenticated,setIsAuthenticated]=useState(false)
    const [isAuthLoading,setIsAuthLoading]=useState(true)
    const [pageValue,setPageValue]=useState(0)
    const [adminUser, setAdminUser] = useState(null)
    const [newBranchData, setNewBranchData] = useState([]);
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

          // Verify session against Firestore
          verifySession(parsed)
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
        console.error('Session verification error:', error)
        // On network error, allow existing session to continue
        setIsAuthLoading(false)
      }
    }

    function forceLogout(message) {
      setIsAuthenticated(false)
      setPageValue(0)
      setAdminUser(null)
      localStorage.removeItem('adminAuth')
      localStorage.removeItem('adminPage')
      localStorage.removeItem('adminUser')
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
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const responseData = await response.json();
          setIsAuthenticated(responseData.isAuthenticated)
          if (responseData.isAuthenticated) {
            localStorage.setItem('adminAuth', 'true')
            if (responseData.admin) {
              setAdminUser(responseData.admin)
              localStorage.setItem('adminUser', JSON.stringify(responseData.admin))

              // Log login activity
              try {
                const activityRef = collection(db, 'activityLog')
                await addDoc(activityRef, {
                  id: uuidv4(),
                  adminId: responseData.admin.id,
                  adminName: responseData.admin.name,
                  action: 'Logged In',
                  module: 'Auth',
                  details: `${responseData.admin.name} logged in`,
                  createdAt: serverTimestamp(),
                })
              } catch (e) {
                console.error('Error logging login activity:', e)
              }
            }
          }
          return responseData.isAuthenticated;
        } catch (error) {
          console.error('Error:', error.message);
          return false;
        }
    }
    async function addMember(obj) {
      try {
        const membersCollectionRef = collection(db, "members");
        const uniqueId = uuidv4();
        const docRef = await addDoc(membersCollectionRef, {...obj, id: uniqueId, createdAt: serverTimestamp()});
        console.log("Document written with ID: ", docRef.id);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
    async function addGallery(obj) {
      try {
        console.log(obj);
        const galleryCollectionRef = collection(db, "gallery"); // Get a reference to the 'members' collection
        const uniqueId = uuidv4();
        const docRef = await addDoc(galleryCollectionRef, {...obj,id:uniqueId}); // Add the object to the collection, generating a unique ID
        console.log("Document written with ID: ", docRef.id); // Log the generated ID
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
    async function addEvent(obj) {
      try {
        console.log(obj);
        const eventCollectionRef = collection(db, "events");
        const uniqueId = uuidv4();
        const docRef = await addDoc(eventCollectionRef, {...obj, id: uniqueId, createdAt: serverTimestamp()});
        console.log("Document written with ID: ", docRef.id);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
    async function addExecutive(obj) {
      try {
        console.log(obj);
        const executiveCollectionRef = collection(db, "executives"); // Get a reference to the 'members' collection
        const uniqueId = uuidv4();
        const docRef = await addDoc(executiveCollectionRef, {...obj,id:uniqueId}); // Add the object to the collection, generating a unique ID
        console.log("Document written with ID: ", docRef.id); // Log the generated ID
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
    async function addGmail(obj) {
      try {
        console.log(obj);
        const gmailCollectionRef = collection(db, "gmail"); // Get a reference to the 'members' collection
        const uniqueId = uuidv4();
        const docRef = await addDoc(gmailCollectionRef, {...obj,id:uniqueId}); // Add the object to the collection, generating a unique ID
        console.log("Document written with ID: ", docRef.id); // Log the generated ID
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
 
    const handleLogOut=async()=>{
      // Log logout activity before clearing session
      if (adminUser) {
        try {
          const activityRef = collection(db, 'activityLog')
          await addDoc(activityRef, {
            id: uuidv4(),
            adminId: adminUser.id,
            adminName: adminUser.name,
            action: 'Logged Out',
            module: 'Auth',
            details: `${adminUser.name} logged out`,
            createdAt: serverTimestamp(),
          })
        } catch (e) {
          console.error('Error logging logout activity:', e)
        }
      }
      setIsAuthenticated(false)
      setPageValue(0)
      setAdminUser(null)
      localStorage.removeItem('adminAuth')
      localStorage.removeItem('adminPage')
      localStorage.removeItem('adminUser')
      localStorage.setItem('logoutMessage', 'You have been logged out successfully.')
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
        const activityRef = collection(db, 'activityLog')
        await addDoc(activityRef, {
          id: uuidv4(),
          adminId: adminUser?.id || 'unknown',
          adminName: adminUser?.name || 'Unknown',
          action,
          module,
          details,
          createdAt: serverTimestamp(),
        })
      } catch (error) {
        console.error('Error logging activity:', error)
      }
    }

    async function searchMembersByName(inputString) {
      console.log('search');
      
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
            foundDocuments.push(doc.data()); // Add the document data to the array
          });
          console.log(foundDocuments);
          
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

      async function getMembersWithNewBranchRelation() {
        const membersCollection = collection(db, 'members');

        const q = query(membersCollection, where('relation', '==', 'New Branch'));
        const querySnapshot = await getDocs(q);

        const membersArray = [];
        querySnapshot.forEach((doc) => {
          membersArray.push({ id: doc.id, ...doc.data() });
        });
        console.log(membersArray);
        setNewBranchData(membersArray)
        setMembers(membersArray)
        return membersArray;
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
          setMembers(membersData)
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
          console.log(eventsData);
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
          console.log(galleryData);
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
          console.log(executivesData);
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
          console.log(gmailData);
          setGmail(gmailData)
          return gmailData;
        } catch (error) {
          console.error("Error fetching gmail:", error);
          throw error; // Rethrow the error for proper handling
        }
      }

      async function deleteDocument(collectionName, id ) {
        try {
          const querySnapshot = await getDocs(query(collection(db, collectionName), where('id', '==', id)));
      
          if (!querySnapshot.empty) {
            querySnapshot.forEach(async (doc) => {
              await deleteDoc(doc.ref);
              console.log('Document deleted successfully!');
            });
            if(collectionName==='gallery'){
              setGallery((gallery)=>{
                return gallery?.filter((gallery)=>gallery.id!==id)
              })
            }
            if(collectionName==='events'){
              setEvents((events)=>{
                return events?.filter((event)=>event.id!==id)
              })
            }
            if(collectionName==='executives'){
              setExecutives((executives)=>{
                return executives?.filter((executive)=>executive.id!==id)
              })
            }
            if(collectionName==='gmail'){
              setGmail((gmail)=>{
                return gmail?.filter((gmail)=>gmail.id!==id)
              })
            }
            if(collectionName==='members'){
              const querySnapshotMembers = await getDocs(query(collection(db, collectionName), where('relatedTo', '==', id)));
              if (!querySnapshotMembers.empty){
                querySnapshotMembers.forEach(async (doc) => {
                  await deleteDocument('members',doc.data().id);
                  console.log(doc.data().name);
                  console.log(doc.data().uniqueText);
                });
              }
              setMembers((members)=>{
                return members?.filter((member)=>member.id!==id)
              })
            }
          } else {
            console.log('No documents found matching the criteria.');
          }
        } catch (error) {
          console.error('Error deleting document:', error);
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
        try {
          // Create a query to find the document based on the key-value pair
          // const q = query('members', where('id', "==", updatedData.id));
      
          // // Get the query snapshot
          // const querySnapshot = await getDocs(q);

          // console.log(querySnapshot);
          const membersRef = collection(db, "members");
          const q = query(membersRef, where("id", "==", updatedData.id));
          const querySnapshot = await getDocs(q);
          
      
          // If a document is found, update it
          if (!querySnapshot.empty) {
            const docRef = doc(db, querySnapshot.docs[0].ref.path);
      
            // Update the document
            await updateDoc(docRef, updatedData);
      
            console.log("Document updated successfully!");
          } else {
            console.log("Document not found.");
          }
        } catch (error) {
          console.error("Error updating document:", error);   
      
        }
      }

      async function updateDocument(collectionName, updatedData) {
        try {
          const colRef = collection(db, collectionName);
          const q = query(colRef, where("id", "==", updatedData.id));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docRef = doc(db, querySnapshot.docs[0].ref.path);
            await updateDoc(docRef, updatedData);
            console.log(`${collectionName} document updated successfully!`);
          } else {
            console.log("Document not found.");
          }
        } catch (error) {
          console.error("Error updating document:", error);
        }
      }

      const googleSignIn = async () => {
        const provider = new GoogleAuthProvider()
        try {
          // Try popup first (works on most mobile and all desktop browsers)
          const res = await signInWithPopup(auth, provider)
          console.log('Popup sign-in success:', res.user.email)
          setuser({ gmail: res.user.email })
        } catch (error) {
          console.error('Popup sign-in failed, trying redirect:', error.code)
          // Popup blocked or closed — fall back to redirect
          if (error.code === 'auth/popup-blocked' ||
              error.code === 'auth/popup-closed-by-user' ||
              error.code === 'auth/cancelled-popup-request') {
            try {
              await signInWithRedirect(auth, provider)
            } catch (redirectError) {
              console.error('Redirect sign-in also failed:', redirectError)
            }
          } else {
            console.error('Google sign-in error:', error)
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
            console.log('Redirect result received:', result.user.email)
            setuser({ gmail: result.user.email })
          }
        }).catch((error) => {
          console.error('Redirect sign-in error:', error)
          setIsGmailLoading(false)
        })
      },[])

      // Persist auth: listen for Firebase auth state on mount
      useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if(firebaseUser){
            console.log('Auth state changed - signed in:', firebaseUser.email)
            setuser({ gmail: firebaseUser.email })
          } else {
            console.log('Auth state changed - no user')
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

    return(
        <Context.Provider value={{isEnglish,
        setIsEnglish,
        authenticateUser,
        isAuthenticated,
        isAuthLoading,
        pageValue,
        setPageValue,
        addMember,
        handleLogOut,
        searchMembersByName,
        getMembersWithNewBranchRelation,
        fetchAllMembers,
        setNewBranchData,
        newBranchData,
        getMembersByRelatedTo,
        viewFamilyData,
        setViewFamilyData,
        memberObj,
        setMemberObj,
        getMemberById,
        addGallery,
        addEvent,
        fetchAllEvents,
        setEvents,
        events,
        fetchAllGallery,
        setGallery,
        gallery,
        addExecutive,
        fetchAllExecutives,
        executives,
        setExecutives,
        deleteDocument,
        members,
        setMembers,
        updateMember,
        updateDocument,
        addGmail,
        googleSignIn,
        googleSignOut,
        user,
        isGmailAuthenticated,
        setIsGmailAuthenticated,
        isAuthorised,
        setIsAuthorised,
        deniedEmail,
        gmail,
        fetchAllGmail,
        isGmailLoading,
        adminUser,
        setAdminUser,
        hasPermission,
        logActivity,
        logoutMessage,
        setLogoutMessage
        }}>
            {children}
        </Context.Provider>
    )
}