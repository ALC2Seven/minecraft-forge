import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), ".env"), override: true });

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

const app = express();
const port = process.env.PORT || 3001;

if (!isProd) app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

if (isProd) {
  const distPath = resolve(__dirname, "../client/dist");
  app.use(express.static(distPath));
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post("/api/blueprint", async (req, res) => {
  const { idea } = req.body;

  if (!idea) {
    return res.status(400).json({ error: "No idea provided" });
  }

  const prompt = `You are a Minecraft building expert helping a young player plan an exciting build.

Generate a fun, detailed building blueprint for the following Minecraft build idea:
- Build type: ${idea.buildType}
- Theme: ${idea.theme}
- Biome: ${idea.biome}
- Size: ${idea.size}
- Difficulty: ${idea.diffLabel}
${idea.wackyMod ? `- Special twist: Build it ${idea.wackyMod}` : ""}
${idea.passiveMobs?.length ? `- Friendly mobs to include: ${idea.passiveMobs.map((m) => `${m.name} (${m.hint})`).join(", ")}` : ""}
${idea.hostileMobs?.length ? `- Hostile mobs to feature: ${idea.hostileMobs.map((m) => `${m.name} (${m.hint})`).join(", ")}` : ""}
${idea.features?.length ? `- Structural features: ${idea.features.join(", ")}` : ""}
${idea.challenges?.length ? `- Challenges: ${idea.challenges.join(", ")}` : ""}

Write a blueprint with these sections:
1. 🏗️ THE CONCEPT (2-3 sentences describing the vision)
2. 📦 MATERIALS LIST (key blocks to gather, 6-8 items)
3. 🪜 BUILDING STEPS (5-7 clear steps, numbered)
4. ✨ COOL DETAILS TO ADD (3-4 finishing touches that make it special)
5. 🎯 PRO TIP (one clever building trick for this specific build)

Keep it exciting and encouraging! Write for a young Minecraft player. Use Minecraft block names.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    res.json({ blueprint: text });
  } catch (err) {
    console.error("Anthropic API error:", err);
    res.status(500).json({ error: "Failed to generate blueprint" });
  }
});

if (isProd) {
  const distPath = resolve(__dirname, "../client/dist");
  app.get("*", (_req, res) => res.sendFile(resolve(distPath, "index.html")));
}

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
