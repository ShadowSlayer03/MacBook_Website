import { GoogleGenAI } from "@google/genai";
import * as cheerio from "cheerio";

const ai = new GoogleGenAI({});

const MODEL = "gemini-2.5-flash";

async function fetchHtml(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

function extractSeoData(html, url) {
  const $ = cheerio.load(html);

  const title = $("title").text().trim();
  const metaDescription = $('meta[name="description"]').attr("content") || "";
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";
  const ogDescription = $('meta[property="og:description"]').attr("content") || "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";

  const headings = [];
  ["h1", "h2", "h3"].forEach((tag) => {
    $(tag).each((_, el) => headings.push({ tag, text: $(el).text().trim() }));
  });

  const images = [];
  $("img").each((_, el) => {
    images.push({
      src: $(el).attr("src"),
      alt: $(el).attr("alt") || "",
    });
  });

  const textSnippet = $("body").text().replace(/\s+/g, " ").trim().slice(0, 1500);

  return {
    url,
    title,
    metaDescription,
    ogTitle,
    ogDescription,
    ogImage,
    headings,
    images,
    textSnippet,
  };
}

async function generateSeoReport(seoData) {
  const { url, title, metaDescription, ogTitle, ogDescription, ogImage, headings, images, textSnippet } =
    seoData;

  const prompt = `
You are an expert SEO consultant.

Analyze the following page for SEO and provide a concise markdown report aimed at a front-end dev.

Page URL: ${url}

Title: ${title}
Meta description: ${metaDescription}

OG Title: ${ogTitle}
OG Description: ${ogDescription}
OG Image: ${ogImage}

Headings (h1-h3):
${headings.map((h) => `- ${h.tag.toUpperCase()}: ${h.text}`).join("\n")}

Images (src | alt):
${images
  .slice(0, 30)
  .map((img) => `- ${img.src} | alt="${img.alt}"`)
  .join("\n")}

Visible text snippet:
${textSnippet}

Return markdown with:
1. Overall SEO score (0-100) and quick summary.
2. Issues & improvements for:
   - Title & meta description
   - Headings hierarchy
   - Image alt text
   - Open Graph (social sharing)
3. Concrete suggestions with example text for new title/meta/og tags.
Keep it under 400 words.
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return response.response.text();
}

async function main() {
  const url = process.env.SEO_URL || "http://localhost:3000";
  try {
    const html = await fetchHtml(url);
    const seoData = extractSeoData(html, url);
    const report = await generateSeoReport(seoData);

    console.log(report);
  } catch (err) {
    console.error("SEO analyzer failed:", err);
    process.exit(1);
  }
}

main();
