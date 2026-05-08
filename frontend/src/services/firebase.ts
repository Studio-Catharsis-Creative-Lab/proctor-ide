import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const useDevAuth = (import.meta.env.VITE_DEV_AUTH_ROLE ?? "").length > 0;
const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

let firebaseAuth: Auth | null = null;
if (!useDevAuth && hasFirebaseConfig) {
  const app = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(app);
}

export { firebaseAuth };
