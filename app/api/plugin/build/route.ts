import { NextRequest, NextResponse } from "next/server";
import { compileToPlugin } from "@/lib/agent/compiler";
import { storePlugin } from "@/lib/plugin-store";
import type { BXMLDocument } from "@/lib/bxml";

/**
 * POST /api/plugin/build
 *
 * Compiles a BXML document into a PluginBundle and stores it.
 * Returns pluginId, pluginUrl, and qrUrl for display in Builder UI.
 *
 * Body: { projectId: string, projectName: string, bxml: BXMLDocument }
 * Returns: { pluginId, pluginUrl, qrUrl, bindingStats }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      projectId: string;
      projectName: string;
      bxml: BXMLDocument;
    };

    if (!body.bxml || !body.projectId) {
      return NextResponse.json({ error: "Missing bxml or projectId" }, { status: 400 });
    }

    const bundle = compileToPlugin(body.bxml, body.projectName ?? "Unnamed Project");
    const pluginId = bundle.manifest.pluginId;

    storePlugin(pluginId, {
      pluginId,
      projectId: body.projectId,
      projectName: body.projectName ?? "Unnamed Project",
      storedAt: new Date().toISOString(),
      bundle,
    });

    // Build the public URL that Life App will load
    const baseUrl = req.nextUrl.origin;
    const pluginUrl = `${baseUrl}/plugin/${pluginId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(pluginUrl)}&size=256x256&format=png&margin=12`;

    return NextResponse.json({
      pluginId,
      pluginUrl,
      qrUrl,
      bindingStats: bundle.bindingStats,
    });
  } catch (err) {
    console.error("[plugin/build]", err);
    return NextResponse.json(
      { error: "Plugin build failed", detail: String(err) },
      { status: 500 },
    );
  }
}
