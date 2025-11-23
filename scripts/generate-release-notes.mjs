import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
const MODEL = "gemini-2.5-flash";

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function getPreviousTag() {
  try {
    return run("git describe --tags --abbrev=0 HEAD^");
  } catch {
    return "";
  }
}

function getCommits(fromRef, toRef) {
  const range = fromRef ? `${fromRef}..${toRef}` : toRef;
  const log = run(`git log ${range} --pretty=format:%H||%s||%b`);
  if (!log) return [];

  return log.split("\n").map((line) => {
    const [hash, subject, body] = line.split("||");
    return { hash, subject, body };
  });
}

async function generateReleaseNotes(tagName, commits) {
  const date = new Date().toISOString().split("T")[0];

  const prompt = `
You are an experienced release manager.

Create concise, well-structured release notes in markdown.

Release: ${tagName}
Date: ${date}

Commits (JSON):
${JSON.stringify(commits, null, 2)}

Requirements:
- Start with a short high-level summary paragraph.
- Then sections if relevant: "✨ Features", "🐛 Fixes", "🧹 Chore / Refactor", "📦 Build / CI".
- Group related commits together.
- Rewrite commit messages into clean, user-friendly bullet points.
- Do NOT invent features that don't exist.
- Finish with a short "Developer Notes" section if there are breaking changes or migration tips.

Return ONLY markdown.
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return response.text;
}

async function main() {
  const tagName = process.argv[2];
  if (!tagName) {
    console.error("Usage: node scripts/generate-release-notes.mjs v1.0.0");
    process.exit(1);
  }

  const prevTag = getPreviousTag();
  const commits = getCommits(prevTag, tagName);

  if (commits.length === 0) {
    console.warn("No commits found for range, generating minimal notes.");
  }

  const notes = await generateReleaseNotes(tagName, commits);

  writeFileSync("release-notes.md", notes, "utf8");
  console.log("Generated release-notes.md");
}

main().catch((err) => {
  console.error("Failed to generate release notes:", err);
  process.exit(1);
});
