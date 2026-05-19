import { DEMO_STORY } from "@/lib/demo";
import { storyFromReceipt } from "@/lib/openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("receipt");
    const forceDemo = form.get("demo") === "true";

    if (forceDemo || !process.env.OPENAI_API_KEY) {
      return NextResponse.json({ ...DEMO_STORY, demo: true });
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Upload a receipt image." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image (JPEG, PNG, WebP)." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be under 8 MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const story = await storyFromReceipt(base64, file.type);

    return NextResponse.json(story);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
