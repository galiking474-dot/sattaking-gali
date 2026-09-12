import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return Response.json({ success: false }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const admin = await adminDb.collection("admins").doc(decoded.uid).get();

    if (!admin.exists || admin.data()?.isActive !== true) {
      return Response.json({ success: false }, { status: 403 });
    }

    revalidatePath("/");
    return Response.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json({ success: false }, { status: 401 });
  }
}
