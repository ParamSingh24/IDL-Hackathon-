import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAG3CitDeRrjoMDUZCXO0ppym8T1GrJ_GA",
  authDomain: "mits-careerboost.firebaseapp.com",
  projectId: "mits-careerboost",
  storageBucket: "mits-careerboost.firebasestorage.app",
  messagingSenderId: "620529797748",
  appId: "1:620529797748:web:dd4ac290be44ffbf43df21",
  measurementId: "G-1RCL0037GE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
export default app;
