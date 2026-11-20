// Entry program for make.fun's "Post a GTA 6 meme on X" bounty.
// Reads POST.json at the repository root, validates that it names an X post,
// and copies it to the output directory. Standard library only: no network,
// no wall clock, no files outside the repository, and deterministic — two
// runs write the same bytes.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? ".";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";

const postPath = join(botDir, "POST.json");
const raw = readFileSync(postPath, "utf8");

let post: unknown;
try {
  post = JSON.parse(raw);
} catch {
  throw new Error("POST.json is not valid JSON");
}
if (typeof post !== "object" || post === null || Array.isArray(post)) {
  throw new Error("POST.json must be a JSON object");
}
const url = (post as { url?: unknown }).url;
if (typeof url !== "string") {
  throw new Error("POST.json must name a url string");
}
if (url.includes("?") || url.includes("#")) {
  throw new Error("POST.json url must be clean, without query or fragment parameters");
}
if (!/^https:\/\/(www\.)?(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/[0-9]+$/.test(url)) {
  throw new Error(
    "POST.json url must be an X post address of the form https://x.com/<handle>/status/<id>",
  );
}

mkdirSync(outDir, { recursive: true });
copyFileSync(postPath, join(outDir, "POST.json"));
