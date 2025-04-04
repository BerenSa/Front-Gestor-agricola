import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDgT9K3YiyP3dapud6vMQhrO-JI0K0TMUc",
  authDomain: "agricola-e93ec.firebaseapp.com",
  projectId: "agricola-e93ec",
  storageBucket: "agricola-e93ec.firebasestorage.app",
  messagingSenderId: "928139025919",
  appId: "1:928139025919:web:393b65582d69f870105bca",
  measurementId: "G-34810RKHNX",
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const analytics = getAnalytics(app)

export default app

