import { cp, mkdir, rm } from "node:fs/promises";

await rm("assets", { recursive: true, force: true });
await mkdir("assets", { recursive: true });
await cp("dist/assets", "assets", { recursive: true });

for (const file of ["index.html", "favicon.svg", "social-preview.svg"]) {
  await cp(`dist/${file}`, file);
}

console.log("Synchronized the verified production build for branch-based GitHub Pages.");
