import { user } from "@/db/auth-schema";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    user: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  const {user: email } = await params;
  const recipient = await db
    .select({ publicKey: user.publicKey })
    .from(user)
    .where(eq(user.email, email));

    if (!recipient[0] || recipient[0].publicKey === null) {
        return NextResponse.json({error: "user does not exist"}, {status: 400})
    }

    return NextResponse.json({publicKey: recipient[0].publicKey})
}