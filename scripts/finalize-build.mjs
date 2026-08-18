import { rename } from "node:fs/promises";

await rename("dist/index.source.html", "dist/index.html");
