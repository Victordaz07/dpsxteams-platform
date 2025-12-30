import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { env } from "@/lib/env";

// Evitar doble inicialización
let adminApp: App;
if (getApps().length === 0) {
  // Reemplazar \\n por \n en la clave privada (para variables de entorno)
  const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

  adminApp = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
} else {
  adminApp = getApps()[0];
}

export const firebaseAdminAuth = getAuth(adminApp);


