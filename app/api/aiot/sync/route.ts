import { NextRequest, NextResponse } from "next/server";
import { mapVirtualToRealDevices } from "@/lib/aiot-sync";
import { applyDeviceBindings } from "@/lib/bxml";
import type { BXMLDocument, DeviceBinding } from "@/lib/bxml";

/**
 * POST /api/aiot/sync
 *
 * Syncs AIOT devices for a user and maps them to virtual BXML devices.
 * Returns mapping summary + updated BXML (with binding metadata injected).
 *
 * Body: { projectId: string, bxml: BXMLDocument, userId?: string }
 * Returns: { syncResult, updatedBxml }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      projectId: string;
      bxml: BXMLDocument;
      userId?: string;
    };

    if (!body.bxml || !body.projectId) {
      return NextResponse.json({ error: "Missing bxml or projectId" }, { status: 400 });
    }

    const syncResult = await mapVirtualToRealDevices(body.bxml, body.userId);

    // Build binding map from sync result
    const bindingMap = new Map<string, DeviceBinding>();
    for (const entry of [...syncResult.mapped, ...syncResult.unmapped, ...syncResult.conflicted]) {
      bindingMap.set(entry.virtualDeviceId, entry.binding);
    }

    // Apply bindings to BXML
    const updatedBxml = applyDeviceBindings(
      { ...body.bxml, aiotSyncedAt: syncResult.syncedAt },
      bindingMap,
    );

    return NextResponse.json({
      syncResult,
      updatedBxml,
    });
  } catch (err) {
    console.error("[aiot/sync]", err);
    return NextResponse.json(
      { error: "AIOT sync failed", detail: String(err) },
      { status: 500 },
    );
  }
}
