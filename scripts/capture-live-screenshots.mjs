import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const urlFile = process.argv[2];
if (!urlFile) {
  throw new Error("Pass the file containing the deployed CaseReady URL.");
}

const liveUrl = (await readFile(urlFile, "utf8")).trim();
const parsedUrl = new URL(liveUrl);
const isLocalCheck =
  parsedUrl.protocol === "http:" &&
  ["127.0.0.1", "localhost"].includes(parsedUrl.hostname);
if (parsedUrl.protocol !== "https:" && !isLocalCheck) {
  throw new Error("A deployed URL must use HTTPS.");
}

const outputDirectory = path.resolve("qa-output");
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();
const browserErrors = [];
const screenshotNames = [];

function observe(page) {
  page.on("pageerror", (error) => {
    browserErrors.push("Page error: " + error.message);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push("Console error: " + message.text());
    }
  });
}

async function save(page, filename, fullPage = true) {
  await page.screenshot({
    path: path.join(outputDirectory, filename),
    fullPage,
  });
  screenshotNames.push(filename);
}

async function openScenario(page) {
  await page.goto(liveUrl, { waitUntil: "load" });
  await page
    .getByRole("button", { name: /Payment taken, order missing/i })
    .click();
  await page.getByText("Stage 1 of 5").waitFor();
}

const desktop = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "light",
});
const page = await desktop.newPage();
observe(page);

await page.goto(liveUrl, { waitUntil: "load" });
await page.getByRole("heading", {
  name: "Turn one careful intake into the right next message.",
}).waitFor();
await save(page, "homepage-desktop.png");

await page.getByRole("button", { name: "Start a case" }).click();
await page.getByRole("button", { name: "Continue" }).click();
await page.getByText(/highlighted answers before continuing/i).waitFor();
await save(page, "empty-validation-state.png");

await openScenario(page);
for (let index = 0; index < 3; index += 1) {
  await page.getByRole("button", { name: "Continue" }).click();
}
await page.getByText("Keep sensitive data out").waitFor();
await page
  .getByLabel("What evidence is available?")
  .fill("Access token: demonstration-value");
await page.getByText("Possible sensitive data detected").waitFor();
await save(page, "sensitive-data-warning.png");

await openScenario(page);
for (let index = 0; index < 4; index += 1) {
  await page.getByRole("button", { name: "Continue" }).click();
}
await page.getByRole("button", { name: "Generate case outputs" }).click();
await page.locator(".intake-summary").waitFor();
await save(page, "completed-intake.png");

await page
  .getByRole("tab", { name: "Customer confirmation" })
  .click();
await page.getByRole("heading", {
  name: "We have recorded what happened",
}).waitFor();
await save(page, "customer-confirmation.png");

await page.getByRole("tab", { name: "Support brief" }).click();
await page.locator(".output-support").waitFor();
await save(page, "support-brief.png");

await page
  .getByRole("tab", { name: "Engineering escalation" })
  .click();
await page.locator(".output-engineering").waitFor();
await save(page, "engineering-escalation.png");

await desktop.close();

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  colorScheme: "light",
});
const mobilePage = await mobile.newPage();
observe(mobilePage);
await mobilePage.goto(liveUrl, { waitUntil: "load" });
await mobilePage.getByRole("button", { name: "Start a case" }).waitFor();
const overflow = await mobilePage.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
if (overflow > 1) {
  throw new Error("Mobile layout has " + overflow + "px horizontal overflow.");
}
await save(mobilePage, "mobile-layout.png");
await mobile.close();
await browser.close();

if (browserErrors.length) {
  throw new Error(browserErrors.join("\n"));
}

await writeFile(
  path.join(outputDirectory, "qa-results.json"),
  JSON.stringify(
    {
      application: "CaseReady",
      version: "1.0.1",
      deployedUrl: liveUrl,
      capturedAt: new Date().toISOString(),
      screenshots: screenshotNames,
      browserErrors,
      mobileHorizontalOverflow: overflow,
    },
    null,
    2,
  ),
  "utf8",
);

console.log("Captured and checked " + screenshotNames.length + " live views.");
