import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { firebaseAdminAuth } from "@/lib/firebase/admin";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "idToken is required" },
        { status: 400 }
      );
    }

    // Crear session cookie con Firebase Admin
    // expiresIn debe estar en segundos (no milisegundos)
    const expiresIn = env.AUTH_COOKIE_MAX_AGE; // ya está en segundos desde env
    const sessionCookie = await firebaseAdminAuth.createSessionCookie(
      idToken,
      { expiresIn }
    );

    // Setear cookie httpOnly, secure, sameSite
    const cookieStore = await cookies();
    cookieStore.set(env.AUTH_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: env.AUTH_COOKIE_SECURE,
      sameSite: "lax",
      path: "/",
      maxAge: env.AUTH_COOKIE_MAX_AGE,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error creating session cookie:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

