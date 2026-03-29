import { NextRequest, NextResponse } from "next/server";
import { deployBxmlToOnlineStudio } from "@/lib/online-studio";
import type { BXMLDocument } from "@/lib/bxml";

/**
 * POST /api/online-studio/deploy
 *
 * Deploys a BXML document to an Online Studio session.
 * If the project already has an active (non-expired) session, it is updated.
 * Otherwise, a new Cloud Studio instance is provisioned.
 *
 * Body: { projectId: string, bxml: BXMLDocument, projectName: string }
 * Returns: { onlineStudioId, status, deviceCount, topology, expiresAt }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      projectId: string;
      bxml: BXMLDocument;
      projectName: string;
    };

    if (!body.bxml || !body.projectId) {
      return NextResponse.json({ error: "Missing bxml or projectId" }, { status: 400 });
    }

    const result = await deployBxmlToOnlineStudio(body.bxml, body.projectName ?? "Unnamed Project");

    return NextResponse.json(result);
  } catch (err) {
    console.error("[online-studio/deploy]", err);
    return NextResponse.json(
      { error: "Deployment failed", detail: String(err) },
      { status: 500 },
    );
  }
}
