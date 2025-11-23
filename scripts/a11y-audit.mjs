import { GoogleGenAI } from "@google/genai";
import axe from "axe-core";
import { chromium } from "playwright";

const ai = new GoogleGenAI({});
const MODEL = "gemini-2.5-flash";

async function runAxe(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  await page.addScriptTag({ content: axe.source });

  const results = await page.evaluate(async () => {
    return await window.axe.run({
      runOnly: ["wcag2a", "wcag2aa"],
    });
  });

  await browser.close();
  return results;
}

function summarizeViolations(results) {
  const { violations } = results;
  return violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    help: v.help,
    helpUrl: v.helpUrl,
    nodes: v.nodes.slice(0, 5).map((n) => ({
      html: n.html,
      target: n.target,
      failureSummary: n.failureSummary,
    })),
  }));
}

async function generateA11yReport(url, summary) {
  const prompt = `
You are an accessibility (a11y) expert.

We ran axe-core on this page:
URL: ${url}

Here are the violations (JSON):
${JSON.stringify(summary, null, 2)}

Return a markdown report with:
1. Short overview of accessibility health (good/ok/bad).
2. Top 5 most critical issues (grouped by type), each with:
   - What it means (plain English)
   - How it affects users
   - Concrete fix suggestion (code-level if relevant)
3. A quick checklist for the dev to verify after fixing.

Keep it under 500 words and very dev-focused.
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return response.text();
}

async function main() {
  const url = process.env.A11Y_URL || "http://localhost:3000";
  try {
    const axeResults = await runAxe(url);
    const summary = summarizeViolations(axeResults);
    const report = await generateA11yReport(url, summary);

    console.log(report);
  } catch (err) {
    console.error("A11y audit failed:", err);
    process.exit(1);
  }
}

main();
