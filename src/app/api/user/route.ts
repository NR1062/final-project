import { user } from "@/db/auth-schema";
import { db } from "@/db/drizzle";
import { auth } from "@/lib/auth";
import { WrappedKeyBundle } from "@/lib/encrypt";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const bundle = (await db
    .select({
      privateKey: user.privateKey,
      publicKey: user.publicKey,
      salt: user.salt,
      iv: user.iv,
    })
    .from(user).where(eq(user.id, session.user.id)));
  console.log(bundle);
  return NextResponse.json({ ...bundle[0], wrappedKey: bundle[0].privateKey });
}
