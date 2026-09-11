import { mkdir, writeFile } from "node:fs/promises";
import { getPageHtml } from "../src/page.js";

const outputDirectory = new URL("../dist/", import.meta.url);
await mkdir(outputDirectory, { recursive: true });
await writeFile(new URL("index.html", outputDirectory), getPageHtml(), "utf8");
console.log("Built dist/index.html");

