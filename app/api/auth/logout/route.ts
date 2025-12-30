import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(env.AUTH_COOKIE_NAME);

  return NextResponse.json({ ok: true });
}

