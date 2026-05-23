import { useState, useRef, useEffect } from "react";

const BLOCK_CHARS = ["⛏", "🪨", "🌲", "💎", "🔥", "❄️", "🍄", "🏔", "⚡", "🌊"];

const BIOMES = ["Desert", "Jungle", "Arctic", "Mushroom Island", "Mesa", "Deep Ocean", "Nether", "End", "Swamp", "Mountain", "Cherry Grove", "Mangrove"];
const BUILD_TYPES = ["Castle", "Village", "Tower", "Underground Base", "Treehouse", "Sky Base", "Dungeon", "Temple", "Farm", "Market", "Library", "Observatory", "Submarine", "Railroad Hub", "Museum", "Wizard Tower"];
const THEMES = ["Medieval", "Futuristic", "Underwater", "Steampunk", "Haunted", "Nature-Grown", "Ancient Ruins", "Pirate", "Viking", "Space", "Fairy Tale", "Cyberpunk", "Overgrown", "Crystal"];
const CHALLENGES = [
  "Use only one material type",
  "Build entirely underground",
  "No straight lines allowed",
  "Must include a secret room",
  "Incorporate a working farm",
  "Add a redstone contraption",
  "Build it upside down",
  "Use glass for the floors",
  "Include a moat or waterway",
  "Build around an existing tree",
  "Add a minecart system",
  "Light it only with torches",
];
const SPECIAL_FEATURES = [
  "Hidden treasure vault",
  "Rooftop garden",
  "Underground tunnel network",
  "Waterfall entrance",
  "Trap room",
  "Grand throne room",
  "Stable for horses",
  "Enchanting library",
  "Lava moat",
  "Skybridge to nearby structure",
  "Secret underwater level",
  "Lightning rod tower",
];
const MOBS = {
  hostile: [
    { name: "Zombies", emoji: "🧟", hint: "lurking in the lower levels" },
    { name: "Creepers", emoji: "💚", hint: "patrolling the outer walls" },
    { name: "Skeletons", emoji: "💀", hint: "guarding the towers" },
    { name: "Spiders", emoji: "🕷️", hint: "nesting in dark corners" },
    { name: "Endermen", emoji: "🖤", hint: "wandering the top floor" },
    { name: "Witch", emoji: "🧙", hint: "brewing in a hidden hut" },
    { name: "Blazes", emoji: "🔥", hint: "defending the inner sanctum" },
    { name: "Phantoms", emoji: "👻", hint: "circling overhead at night" },
    { name: "Drowned", emoji: "🌊", hint: "lurking in the moat" },
    { name: "Pillagers", emoji: "⚔️", hint: "manning the watchtowers" },
    { name: "Ravager", emoji: "🦏", hint: "chained at the entrance" },
    { name: "Warden", emoji: "😱", hint: "guarding the deepest vault" },
    { name: "Silverfish", emoji: "🐛", hint: "hidden inside the walls" },
  ],
  passive: [
    { name: "Villagers", emoji: "🧑‍🌾", hint: "trading in the marketplace" },
    { name: "Cows", emoji: "🐄", hint: "roaming the pastures" },
    { name: "Sheep", emoji: "🐑", hint: "grazing on the hilltop" },
    { name: "Chickens", emoji: "🐔", hint: "wandering the courtyard" },
    { name: "Pigs", emoji: "🐷", hint: "in a pen near the farm" },
    { name: "Horses", emoji: "🐴", hint: "stabled at the entrance" },
    { name: "Wolves", emoji: "🐺", hint: "tamed and patrolling" },
    { name: "Cats", emoji: "🐱", hint: "keeping watch on the roof" },
    { name: "Foxes", emoji: "🦊", hint: "darting through the gardens" },
    { name: "Pandas", emoji: "🐼", hint: "lounging in the bamboo grove" },
    { name: "Bees", emoji: "🐝", hint: "buzzing around the flower garden" },
    { name: "Axolotls", emoji: "🦎", hint: "swimming in the underground pool" },
    { name: "Dolphins", emoji: "🐬", hint: "leaping in the harbour" },
    { name: "Iron Golem", emoji: "🤖", hint: "standing guard at the gate" },
  ],
};

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIdea(wackiness, scale, difficulty, includeChallenges, includeHostileMobs) {
  const biome = getRandom(BIOMES);
  const buildType = getRandom(BUILD_TYPES);
  const theme = getRandom(THEMES);
  const numChallenges = !includeChallenges ? 0 : wackiness < 30 ? 0 : wackiness < 60 ? 1 : wackiness < 85 ? 2 : 3;
  const challenges = [];
  const usedChallenges = new Set();
  for (let i = 0; i < numChallenges; i++) {
    let c;
    do { c = getRandom(CHALLENGES); } while (usedChallenges.has(c));
    usedChallenges.add(c);
    challenges.push(c);
  }
  const numFeatures = Math.round(1 + scale / 50);
  const features = [];
  const usedFeatures = new Set();
  for (let i = 0; i < numFeatures; i++) {
    let f;
    do { f = getRandom(SPECIAL_FEATURES); } while (usedFeatures.has(f));
    usedFeatures.add(f);
    features.push(f);
  }
  const numHostile = !includeHostileMobs ? 0 : difficulty < 30 ? 1 : difficulty < 60 ? 2 : 3;
  const numPassive = scale < 30 ? 1 : scale < 60 ? 2 : 3;
  const pickUnique = (pool, count) => {
    const used = new Set();
    const result = [];
    for (let i = 0; i < count; i++) {
      let m;
      do { m = getRandom(pool); } while (used.has(m.name));
      used.add(m.name);
      result.push(m);
    }
    return result;
  };
  const hostileMobs = pickUnique(MOBS.hostile, numHostile);
  const passiveMobs = pickUnique(MOBS.passive, numPassive);
  const sizeLabels = ["Tiny (15x15)", "Small (30x30)", "Medium (60x60)", "Large (100x100)", "MEGA (200x200+)"];
  const size = sizeLabels[Math.min(4, Math.floor(scale / 21))];
  const diffLabels = ["Beginner", "Casual", "Intermediate", "Advanced", "Expert"];
  const diffLabel = diffLabels[Math.min(4, Math.floor(difficulty / 21))];
  const wackyMods = wackiness > 70 ? [
    "floating in mid-air",
    "built entirely upside-down",
    "made to look like a living creature",
    "shaped like a giant face",
    "twisted and spiralling",
    "half-buried in the ground",
  ] : [];
  const wackyMod = wackyMods.length > 0 ? getRandom(wackyMods) : null;
  return { biome, buildType, theme, challenges, features, size, diffLabel, wackyMod, hostileMobs, passiveMobs };
}

function BlockParticle({ x, y, emoji, delay }) {
  return (
    <span style={{
      position: "fixed", left: x, top: y, fontSize: "1.5rem",
      pointerEvents: "none",
      animation: `floatUp 2s ease-out ${delay}s forwards`,
      zIndex: 999, opacity: 0,
    }}>
      {emoji}
    </span>
  );
}

export default function App() {
  const [wackiness, setWackiness] = useState(40);
  const [scale, setScale] = useState(40);
  const [difficulty, setDifficulty] = useState(40);
  const [idea, setIdea] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [particles, setParticles] = useState([]);
  const [aiBlueprint, setAiBlueprint] = useState("");
  const [loadingBlueprint, setLoadingBlueprint] = useState(false);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [blueprintError, setBlueprintError] = useState("");
  const [includeChallenges, setIncludeChallenges] = useState(true);
  const [includeHostileMobs, setIncludeHostileMobs] = useState(true);
  const [progress, setProgress] = useState(0);
  const particleId = useRef(0);

  useEffect(() => {
    if (!loadingBlueprint) {
      if (progress > 0) {
        setProgress(100);
        const t = setTimeout(() => setProgress(0), 600);
        return () => clearTimeout(t);
      }
      return;
    }
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        return Math.min(90, p + Math.max(0.4, (90 - p) * 0.05));
      });
    }, 80);
    return () => clearInterval(interval);
  }, [loadingBlueprint]);

  const spawnParticles = () => {
    const newParticles = Array.from({ length: 12 }, () => ({
      id: particleId.current++,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.7 + 100,
      emoji: BLOCK_CHARS[Math.floor(Math.random() * BLOCK_CHARS.length)],
      delay: Math.random() * 0.5,
    }));
    setParticles((p) => [...p, ...newParticles]);
    setTimeout(() => {
      setParticles((p) => p.filter((x) => !newParticles.find((n) => n.id === x.id)));
    }, 3000);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setShowBlueprint(false);
    setAiBlueprint("");
    setBlueprintError("");
    spawnParticles();
    setTimeout(() => {
      setIdea(generateIdea(wackiness, scale, difficulty, includeChallenges, includeHostileMobs));
      setGenerating(false);
    }, 600);
  };

  const handleBlueprint = async () => {
    if (!idea) return;
    setLoadingBlueprint(true);
    setShowBlueprint(true);
    setBlueprintError("");
    setAiBlueprint("");
    try {
      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setAiBlueprint(data.blueprint);
    } catch (err) {
      setBlueprintError("Couldn't fetch the blueprint. Is the server running? Check your .env API key.");
      console.error(err);
    }
    setLoadingBlueprint(false);
  };

  const wackinessLabel = wackiness < 20 ? "Classic" : wackiness < 40 ? "Normal" : wackiness < 60 ? "Creative" : wackiness < 80 ? "Wild" : "UNHINGED 🤪";
  const scaleLabel = scale < 20 ? "Tiny" : scale < 40 ? "Small" : scale < 60 ? "Medium" : scale < 80 ? "Large" : "MEGA";
  const diffLabel = difficulty < 20 ? "Easy Peasy" : difficulty < 40 ? "Casual" : difficulty < 60 ? "Normal" : difficulty < 80 ? "Hard Mode" : "EXPERT";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0d1117 0%, #0f2027 40%, #1a1a2e 100%)",
      fontFamily: "'Fredoka One', 'Segoe UI', sans-serif",
      color: "#e8f4f8",
      padding: "0",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translateY(-200px) scale(1.5) rotate(360deg); }
        }
        @keyframes pixelPop {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px #00d4ff44; }
          50% { box-shadow: 0 0 40px #00d4ff88, 0 0 60px #00d4ff33; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px) rotate(-1deg); }
          75% { transform: translateX(4px) rotate(1deg); }
        }
        .idea-card { animation: pixelPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .gen-btn {
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          border: none; border-radius: 16px; color: #0d1117;
          font-family: 'Fredoka One', sans-serif; font-size: 1.4rem;
          padding: 16px 48px; cursor: pointer; transition: all 0.2s;
          letter-spacing: 1px; animation: pulse 2s infinite;
        }
        .gen-btn:hover { transform: scale(1.05) translateY(-2px); filter: brightness(1.1); }
        .gen-btn:active { transform: scale(0.97); animation: shake 0.3s; }
        .gen-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; animation: none; }
        .slider-track {
          -webkit-appearance: none; width: 100%; height: 10px;
          border-radius: 10px; outline: none; cursor: pointer; transition: all 0.2s;
        }
        .slider-track::-webkit-slider-thumb {
          -webkit-appearance: none; width: 26px; height: 26px; border-radius: 6px;
          background: #00d4ff; cursor: pointer; border: 3px solid #0d1117;
          box-shadow: 0 0 10px #00d4ff88; transition: all 0.2s;
        }
        .slider-track::-webkit-slider-thumb:hover { transform: scale(1.2); }
        .tag {
          display: inline-block; background: rgba(0,212,255,0.12);
          border: 1px solid rgba(0,212,255,0.3); border-radius: 20px;
          padding: 4px 14px; font-family: 'Nunito', sans-serif;
          font-size: 0.85rem; font-weight: 700; color: #00d4ff; margin: 3px;
        }
        .challenge-tag { background: rgba(255,160,0,0.12); border-color: rgba(255,160,0,0.4); color: #ffb830; }
        .feature-tag { background: rgba(100,220,100,0.12); border-color: rgba(100,220,100,0.4); color: #7ddb7d; }
        .hostile-tag { background: rgba(255,107,107,0.12); border-color: rgba(255,107,107,0.4); color: #ff8f8f; }
        .passive-tag { background: rgba(255,209,102,0.12); border-color: rgba(255,209,102,0.4); color: #ffd166; }
        .blueprint-btn {
          background: linear-gradient(135deg, #7c3aed, #a855f7); border: none;
          border-radius: 12px; color: white; font-family: 'Fredoka One', sans-serif;
          font-size: 1.1rem; padding: 12px 32px; cursor: pointer;
          transition: all 0.2s; margin-top: 16px;
        }
        .blueprint-btn:hover { transform: scale(1.04) translateY(-1px); filter: brightness(1.1); }
        .blueprint-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .blueprint-text {
          font-family: 'Nunito', sans-serif; font-size: 0.95rem; line-height: 1.8;
          color: #c8e6f0; white-space: pre-wrap; text-align: left;
          background: rgba(255,255,255,0.04); border-radius: 12px; padding: 20px;
          border: 1px solid rgba(255,255,255,0.08); margin-top: 16px;
          animation: pixelPop 0.4s ease;
        }
        .error-text {
          font-family: 'Nunito', sans-serif; font-size: 0.9rem; color: #ff8f8f;
          background: rgba(255,107,107,0.08); border: 1px solid rgba(255,107,107,0.3);
          border-radius: 10px; padding: 12px 16px; margin-top: 14px;
        }
        .progress-bar-track {
          width: 100%; height: 10px; background: rgba(255,255,255,0.08);
          border-radius: 99px; overflow: hidden; margin: 10px 0 6px;
        }
        .progress-bar-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #7c3aed, #a855f7, #00d4ff);
          background-size: 200% auto;
          animation: shimmer 1.5s linear infinite;
          transition: width 0.15s ease-out;
        }
        .export-btn {
          background: linear-gradient(135deg, #16a34a, #22c55e); border: none;
          border-radius: 12px; color: white; font-family: 'Fredoka One', sans-serif;
          font-size: 1rem; padding: 10px 24px; cursor: pointer;
          transition: all 0.2s; margin-top: 12px; margin-left: 10px;
        }
        .export-btn:hover { transform: scale(1.04) translateY(-1px); filter: brightness(1.1); }
        @media print {
          body { background: white !important; color: #111 !important; }
          .no-print { display: none !important; }
          .print-card {
            background: white !important; border: none !important;
            box-shadow: none !important; padding: 0 !important;
            animation: none !important;
          }
          .print-blueprint {
            background: white !important; border: 1px solid #ddd !important;
            color: #111 !important; font-size: 11pt !important;
          }
          .tag { border: 1px solid #999 !important; color: #333 !important; background: #f5f5f5 !important; }
          .challenge-tag, .feature-tag, .hostile-tag, .passive-tag { color: #333 !important; background: #f5f5f5 !important; }
          h2 { color: #111 !important; -webkit-text-fill-color: #111 !important; }
        }
      `}</style>

      {particles.map((p) => <BlockParticle key={p.id} {...p} />)}

      {/* Header */}
      <div className="no-print" style={{ textAlign: "center", padding: "40px 20px 20px" }}>
        <div style={{ fontSize: "2.2rem", marginBottom: "4px" }}>⛏ 🌲 💎 🪨 🔥</div>
        <h1 style={{
          fontFamily: "'Fredoka One', sans-serif",
          fontSize: "clamp(2rem, 6vw, 3.5rem)", margin: "0",
          background: "linear-gradient(90deg, #00d4ff, #7ddb7d, #ffb830, #00d4ff)",
          backgroundSize: "300% auto", WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent", animation: "shimmer 4s linear infinite",
        }}>
          BUILD IDEA FORGE
        </h1>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: "#7a9db0", fontSize: "1rem", margin: "6px 0 0" }}>
          Minecraft inspiration generator — spin the dial, get building!
        </p>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "20px 24px 60px" }}>

        {/* Sliders */}
        <div className="no-print" style={{
          background: "rgba(255,255,255,0.04)", borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)", padding: "28px", marginBottom: "24px",
        }}>
          {[
            { label: "🤪 Wackiness", value: wackiness, set: setWackiness, display: wackinessLabel, color: "#ffb830" },
            { label: "🏔 Scale", value: scale, set: setScale, display: scaleLabel, color: "#7ddb7d" },
            { label: "⚔️ Difficulty", value: difficulty, set: setDifficulty, display: diffLabel, color: "#ff6b6b" },
          ].map(({ label, value, set, display, color }) => (
            <div key={label} style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
                <span style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: "1.05rem", color: "#c8e6f0" }}>{label}</span>
                <span style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: "1rem", color }}>{display}</span>
              </div>
              <input
                type="range" min="0" max="100" value={value}
                onChange={(e) => set(Number(e.target.value))}
                className="slider-track"
                style={{ background: `linear-gradient(90deg, ${color} ${value}%, rgba(255,255,255,0.1) ${value}%)` }}
              />
            </div>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "18px", marginTop: "4px", display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
              <input
                type="checkbox"
                checked={includeChallenges}
                onChange={(e) => setIncludeChallenges(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#ffb830", cursor: "pointer" }}
              />
              <span style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: "1.05rem", color: "#c8e6f0" }}>
                🎯 Include Challenges
              </span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
              <input
                type="checkbox"
                checked={includeHostileMobs}
                onChange={(e) => setIncludeHostileMobs(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#ff6b6b", cursor: "pointer" }}
              />
              <span style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: "1.05rem", color: "#c8e6f0" }}>
                ☠️ Include Hostile Mobs
              </span>
            </label>
          </div>
        </div>

        {/* Generate button */}
        <div className="no-print" style={{ textAlign: "center", marginBottom: "28px" }}>
          <button className="gen-btn" onClick={handleGenerate} disabled={generating}>
            {generating ? "⚙️ Forging..." : "⚡ FORGE AN IDEA"}
          </button>
        </div>

        {/* Result card */}
        {idea && !generating && (
          <div className="idea-card print-card" style={{
            background: "rgba(255,255,255,0.05)", borderRadius: "24px",
            border: "1px solid rgba(0,212,255,0.2)", padding: "28px",
            boxShadow: "0 0 40px rgba(0,212,255,0.06)",
          }}>
            {/* Title */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              {idea.wackyMod && (
                <div style={{ fontSize: "0.8rem", fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#ffb830", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>
                  🤪 TWISTED BUILD
                </div>
              )}
              <h2 style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: "clamp(1.5rem, 5vw, 2.2rem)", margin: "0", color: "#fff", lineHeight: 1.2 }}>
                {idea.theme} {idea.buildType}
              </h2>
              {idea.wackyMod && (
                <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.95rem", color: "#ffb830", margin: "6px 0 0", fontWeight: 700 }}>
                  {idea.wackyMod}
                </p>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "20px" }}>
              <span className="tag">🌍 {idea.biome}</span>
              <span className="tag">📐 {idea.size}</span>
              <span className="tag">⚔️ {idea.diffLabel}</span>
            </div>

            {/* Passive mobs */}
            {idea.passiveMobs.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: "0.85rem", color: "#ffd166", letterSpacing: "1px", marginBottom: "6px", textTransform: "uppercase" }}>🐾 Friendly Mobs</div>
                <div>{idea.passiveMobs.map((m) => <span key={m.name} className="tag passive-tag" title={m.hint}>{m.emoji} {m.name}</span>)}</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.76rem", color: "#5a7a8a", marginTop: "5px" }}>
                  {idea.passiveMobs.map((m) => `${m.emoji} ${m.name} — ${m.hint}`).join(" · ")}
                </div>
              </div>
            )}

            {/* Hostile mobs */}
            {idea.hostileMobs.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: "0.85rem", color: "#ff6b6b", letterSpacing: "1px", marginBottom: "6px", textTransform: "uppercase" }}>☠️ Hostile Mobs</div>
                <div>{idea.hostileMobs.map((m) => <span key={m.name} className="tag hostile-tag" title={m.hint}>{m.emoji} {m.name}</span>)}</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: "0.76rem", color: "#5a7a8a", marginTop: "5px" }}>
                  {idea.hostileMobs.map((m) => `${m.emoji} ${m.name} — ${m.hint}`).join(" · ")}
                </div>
              </div>
            )}

            {/* Features */}
            {idea.features.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: "0.85rem", color: "#7ddb7d", letterSpacing: "1px", marginBottom: "6px", textTransform: "uppercase" }}>✨ Must Include</div>
                <div>{idea.features.map((f) => <span key={f} className="tag feature-tag">{f}</span>)}</div>
              </div>
            )}

            {/* Challenges */}
            {idea.challenges.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: "0.85rem", color: "#ffb830", letterSpacing: "1px", marginBottom: "6px", textTransform: "uppercase" }}>🎯 Challenges</div>
                <div>{idea.challenges.map((c) => <span key={c} className="tag challenge-tag">{c}</span>)}</div>
              </div>
            )}

            {/* Blueprint button */}
            <div className="no-print" style={{ textAlign: "center", marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "20px" }}>
              <button className="blueprint-btn" onClick={handleBlueprint} disabled={loadingBlueprint}>
                {loadingBlueprint ? "📜 Writing blueprint..." : "📜 Get Building Blueprint"}
              </button>
              {aiBlueprint && (
                <button className="export-btn" onClick={() => window.print()}>
                  📄 Export PDF
                </button>
              )}
            </div>

            {/* Blueprint output */}
            {showBlueprint && (
              loadingBlueprint ? (
                <div style={{ padding: "20px 4px 8px", fontFamily: "'Nunito', sans-serif" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.9rem", color: "#a78bfa", fontWeight: 700 }}>📜 Crafting your blueprint...</span>
                    <span style={{ fontSize: "0.85rem", color: "#7a9db0" }}>{Math.round(progress)}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : blueprintError ? (
                <div className="error-text">⚠️ {blueprintError}</div>
              ) : (
                <div className="blueprint-text print-blueprint">{aiBlueprint}</div>
              )
            )}
          </div>
        )}

        {!idea && (
          <div style={{ textAlign: "center", color: "#2a4a5a", fontFamily: "'Fredoka One', sans-serif", fontSize: "1.1rem", marginTop: "12px" }}>
            Hit the button to forge your first idea ⬆️
          </div>
        )}
      </div>
    </div>
  );
}
