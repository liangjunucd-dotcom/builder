import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appServerDir = path.join(root, ".next", "server", "app");
const rootManifest = path.join(appServerDir, "page_client-reference-manifest.js");
const groupedManifest = path.join(appServerDir, "(main)", "page_client-reference-manifest.js");

function safeExists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function ensureMainGroupManifest() {
  if (!safeExists(rootManifest)) return false;
  if (safeExists(groupedManifest)) return false;
  fs.mkdirSync(path.dirname(groupedManifest), { recursive: true });
  fs.copyFileSync(rootManifest, groupedManifest);
  return true;
}

function ensureNftListedManifests() {
  if (!safeExists(appServerDir)) return 0;
  const created = [];
  const stack = [appServerDir];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".nft.json")) continue;
      let parsed;
      try {
        parsed = JSON.parse(fs.readFileSync(full, "utf8"));
      } catch {
        continue;
      }
      const listed = Array.isArray(parsed?.files) ? parsed.files : [];
      for (const rel of listed) {
        if (typeof rel !== "string") continue;
        if (!rel.endsWith("client-reference-manifest.js")) continue;
        const expected = path.resolve(path.dirname(full), rel);
        if (safeExists(expected)) continue;
        fs.mkdirSync(path.dirname(expected), { recursive: true });
        if (safeExists(rootManifest)) {
          fs.copyFileSync(rootManifest, expected);
        } else {
          fs.writeFileSync(expected, "globalThis.__RSC_MANIFEST = globalThis.__RSC_MANIFEST || {};\n", "utf8");
        }
        created.push(expected);
      }
    }
  }
  return created.length;
}

const didCopyMain = ensureMainGroupManifest();
const createdFromNft = ensureNftListedManifests();
if (didCopyMain || createdFromNft > 0) {
  console.log(`[fix-next-manifest-paths] created manifest files: ${Number(didCopyMain) + createdFromNft}`);
} else {
  console.log("[fix-next-manifest-paths] no manifest fix needed");
}
