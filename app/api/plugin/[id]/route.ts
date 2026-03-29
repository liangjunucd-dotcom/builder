import { NextRequest, NextResponse } from "next/server";
import { getPlugin } from "@/lib/plugin-store";
import { updateDeviceState } from "@/lib/online-studio";

/**
 * GET  /api/plugin/[id]  → return the PluginBundle JSON
 * POST /api/plugin/[id]  → send a device command (toggle, scene trigger, etc.)
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const stored = getPlugin(id);
  if (!stored) {
    return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
  }
  return NextResponse.json(stored.bundle, {
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const stored = getPlugin(id);
  if (!stored) {
    return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
  }

  const body = await req.json() as {
    action: "device_command";
    onlineStudioId?: string;
    deviceId: string;
    command: string;
    params?: Record<string, unknown>;
  };

  // If an Online Studio session is linked, update device state there
  if (body.onlineStudioId) {
    const patch: Record<string, unknown> = {};
    if (body.command === "OnOff.toggle") {
      patch.OnOff = body.params?.targetState ?? true;
    } else if (body.command === "SetLevel") {
      patch.CurrentLevel = body.params?.level ?? 100;
    } else if (body.command === "SetTemperature") {
      patch.CoolingTemperature = body.params?.temperature ?? 26;
    } else {
      Object.assign(patch, body.params ?? {});
    }
    updateDeviceState(body.onlineStudioId, body.deviceId, patch);
  }

  return NextResponse.json({ success: true, command: body.command, deviceId: body.deviceId });
}
