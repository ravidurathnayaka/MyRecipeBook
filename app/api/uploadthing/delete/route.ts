import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { auth } from "@/lib/auth";

const utapi = new UTApi();

/**
 * Check if URL is from UploadThing (utfs.io or ufs.sh)
 */
function isUploadThingUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "utfs.io" || host.endsWith(".ufs.sh");
  } catch {
    return false;
  }
}

/**
 * Extract file key from UploadThing URL.
 * Supports: utfs.io/f/KEY, utfs.io/a/APP/KEY, APP.ufs.sh/f/KEY
 */
function getFileKeyFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/").filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to delete images" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const url = typeof body?.url === "string" ? body.url : "";

    if (!url) {
      return NextResponse.json(
        { message: "Image URL is required" },
        { status: 400 }
      );
    }

    if (!isUploadThingUrl(url)) {
      return NextResponse.json(
        { message: "URL is not from UploadThing" },
        { status: 400 }
      );
    }

    const fileKey = getFileKeyFromUrl(url);
    if (!fileKey) {
      return NextResponse.json(
        { message: "Could not extract file key from URL" },
        { status: 400 }
      );
    }

    await utapi.deleteFiles(fileKey);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UploadThing delete error:", error);
    return NextResponse.json(
      { message: "Failed to delete image" },
      { status: 500 }
    );
  }
}
