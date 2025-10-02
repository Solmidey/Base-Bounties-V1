import { NextRequest, NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://base-task-board.example";

export async function GET() {
  return NextResponse.json({
    version: "vNext",
    image: `${SITE_URL}/frame.svg`,
    buttons: [
      {
        label: "Open task board",
        action: "launch"
      }
    ],
    postUrl: `${SITE_URL}/api/frame`
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => undefined);
  const taskId = body?.untrustedData?.inputText ?? "";

  return NextResponse.json({
    version: "vNext",
    image: `${SITE_URL}/frame.svg`,
    buttons: [
      {
        label: taskId ? `Claim task #${taskId}` : "Launch app",
        action: "link",
        target: `${SITE_URL}/tasks/${taskId || ""}`
      }
    ],
    inputText: "Enter task id to jump in",
    postUrl: `${SITE_URL}/api/frame`
  });
}
