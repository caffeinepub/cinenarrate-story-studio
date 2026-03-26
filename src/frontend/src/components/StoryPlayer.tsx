import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Download,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Mood } from "../backend";
import type { ParsedScene } from "../utils/storyUtils";
import { MOOD_CONFIG } from "../utils/storyUtils";

interface StoryPlayerProps {
  scenes: ParsedScene[];
  onRegenerate?: () => void;
  onChangeStyle?: () => void;
  onExport?: () => void;
  activeStyle: string;
}

function TypewriterText({
  text,
  onComplete,
}: { text: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;
    const delay = Math.max(18, Math.min(40, 3000 / text.length));
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
        setDone(true);
        onCompleteRef.current?.();
      }
    }, delay);
    return () => clearInterval(interval);
  }, [text]);

  return <span className={done ? "" : "cursor-blink"}>{displayed}</span>;
}

// ─── Character Silhouettes ───────────────────────────────────────────────────

type CharacterType = "man" | "woman" | "child" | "oldman" | "oldwoman";

const MAN_KEYWORDS = [
  "man",
  "aadmi",
  "he ",
  " he,",
  " him",
  "his ",
  "boy",
  "brother",
  "father",
  "sir",
  "mard",
  "ladka",
  "bhai",
  "baap",
  "raja",
  "hero",
  "soldier",
  "warrior",
  "king",
];
const WOMAN_KEYWORDS = [
  "woman",
  "she ",
  " she,",
  " her",
  "girl",
  "lady",
  "ladies",
  "aurat",
  "ladki",
  "behen",
  "maa",
  "mother",
  "queen",
  "princess",
  "miss",
  "madam",
];
const CHILD_KEYWORDS = [
  "child",
  "children",
  "baby",
  "kid",
  "bachcha",
  "bachchi",
  "chota",
  "chhota",
  "little one",
  "infant",
  "toddler",
];
const OLDMAN_KEYWORDS = [
  "old man",
  "elder",
  "grandfather",
  "dada",
  "nana",
  "budhha",
  "aged",
];
const OLDWOMAN_KEYWORDS = [
  "old woman",
  "grandmother",
  "dadi",
  "nani",
  "budhhi",
];

function detectCharacters(text: string): CharacterType[] {
  const lower = ` ${text.toLowerCase()} `;
  const found: CharacterType[] = [];

  const has = (keywords: string[]) => keywords.some((k) => lower.includes(k));

  if (has(OLDMAN_KEYWORDS)) found.push("oldman");
  else if (has(MAN_KEYWORDS)) found.push("man");

  if (has(OLDWOMAN_KEYWORDS)) found.push("oldwoman");
  else if (has(WOMAN_KEYWORDS)) found.push("woman");

  if (has(CHILD_KEYWORDS)) found.push("child");

  if (found.length === 0) return ["man", "woman"];
  return found.slice(0, 3);
}

function ManSVG({ fill }: { fill: string }) {
  return (
    <svg
      role="img"
      aria-label="Man silhouette"
      viewBox="0 0 40 80"
      width="80"
      height="160"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="10" r="8" fill={fill} />
      <path d="M8 25 Q20 20 32 25 L35 55 H25 L20 45 L15 55 H5 Z" fill={fill} />
      <path
        d="M8 27 L2 45 M32 27 L38 45"
        stroke={fill}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function WomanSVG({ fill }: { fill: string }) {
  return (
    <svg
      role="img"
      aria-label="Woman silhouette"
      viewBox="0 0 38 76"
      width="76"
      height="152"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="19" cy="9" r="7" fill={fill} />
      <path d="M7 22 Q19 17 31 22 L28 42 Q19 50 10 42 Z" fill={fill} />
      <path d="M10 42 L6 68 H14 L19 56 L24 68 H32 L28 42" fill={fill} />
      <path
        d="M7 24 L2 40 M31 24 L36 40"
        stroke={fill}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function ChildSVG({ fill }: { fill: string }) {
  return (
    <svg
      role="img"
      aria-label="Child silhouette"
      viewBox="0 0 30 55"
      width="60"
      height="110"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="15" cy="8" r="7" fill={fill} />
      <path d="M6 20 Q15 15 24 20 L26 42 H19 L15 34 L11 42 H4 Z" fill={fill} />
      <path
        d="M6 22 L1 36 M24 22 L29 36"
        stroke={fill}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function OldManSVG({ fill }: { fill: string }) {
  return (
    <svg
      role="img"
      aria-label="Old man silhouette"
      viewBox="0 0 40 76"
      width="80"
      height="152"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="10" r="7" fill={fill} />
      <path d="M10 23 Q20 18 30 23 L32 52 H23 L20 44 L17 52 H8 Z" fill={fill} />
      <path
        d="M10 25 L4 44 M30 25 L36 44"
        stroke={fill}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <line
        x1="34"
        y1="40"
        x2="38"
        y2="68"
        stroke={fill}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OldWomanSVG({ fill }: { fill: string }) {
  return (
    <svg
      role="img"
      aria-label="Old woman silhouette"
      viewBox="0 0 36 72"
      width="72"
      height="144"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="18" cy="9" r="6" fill={fill} />
      <path d="M8 20 Q18 15 28 20 L26 40 Q18 48 10 40 Z" fill={fill} />
      <path d="M10 40 L7 65 H14 L18 55 L22 65 H29 L26 40" fill={fill} />
      <path
        d="M8 22 L3 38 M28 22 L33 38"
        stroke={fill}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const CHARACTER_COMPONENTS: Record<
  CharacterType,
  React.FC<{ fill: string }>
> = {
  man: ManSVG,
  woman: WomanSVG,
  child: ChildSVG,
  oldman: OldManSVG,
  oldwoman: OldWomanSVG,
};

interface CharacterSilhouettesProps {
  text: string;
  moodColor: string;
  sceneId: string;
}

function CharacterSilhouettes({
  text,
  moodColor,
  sceneId,
}: CharacterSilhouettesProps) {
  const characters = useMemo(() => detectCharacters(text), [text]);

  // 80% opacity fill for strong visibility
  const silhouetteFill = useMemo(() => {
    const hex = moodColor.replace("#", "");
    if (hex.length === 6) {
      const r = Number.parseInt(hex.slice(0, 2), 16);
      const g = Number.parseInt(hex.slice(2, 4), 16);
      const b = Number.parseInt(hex.slice(4, 6), 16);
      return `rgba(${r},${g},${b},0.85)`;
    }
    return "rgba(200,200,220,0.85)";
  }, [moodColor]);

  const count = characters.length;
  const spacing = count === 1 ? 0 : count === 2 ? 100 : 88;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneId}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 flex items-end justify-center"
        style={{ zIndex: 15, paddingBottom: "8%", gap: 0 }}
      >
        {characters.map((type, i) => {
          const Comp = CHARACTER_COMPONENTS[type];
          const xOffset = (i - (count - 1) / 2) * spacing;
          const zDepth = i % 2 === 0 ? 1 : 0.88;
          return (
            <motion.div
              key={type}
              animate={{
                y: [0, -6, 0],
                opacity: [0.85, 1, 0.85],
              }}
              transition={{
                duration: 2.8 + i * 0.4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: i * 0.6,
              }}
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: `translateX(calc(-50% + ${xOffset}px)) scaleX(${zDepth})`,
                transformOrigin: "bottom center",
                filter: `drop-shadow(0 0 16px ${moodColor}99) drop-shadow(0 0 32px ${moodColor}55)`,
              }}
            >
              <Comp fill={silhouetteFill} />
            </motion.div>
          );
        })}

        {/* Ground line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: `${count * 160 + 80}px`,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${moodColor}88, transparent)`,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Particle System ────────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  opacityDelta: number;
  life: number;
  maxLife: number;
  color: string;
  type: string;
  angle?: number;
  spin?: number;
}

function createParticles(
  mood: string,
  W: number,
  H: number,
  count: number,
): Particle[] {
  const p: Particle[] = [];
  for (let i = 0; i < count; i++) {
    p.push(spawnParticle(mood, W, H, true));
  }
  return p;
}

function spawnParticle(
  mood: string,
  W: number,
  H: number,
  randomY = false,
): Particle {
  const base: Particle = {
    x: Math.random() * W,
    y: randomY ? Math.random() * H : -20,
    vx: 0,
    vy: 0,
    size: 9,
    opacity: Math.random() * 0.85 + 0.45,
    opacityDelta:
      (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
    life: 0,
    maxLife: Math.random() * 200 + 100,
    color: "#ffffff",
    type: mood,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.05,
  };

  switch (mood) {
    case "suspense":
      base.x = Math.random() * W;
      base.y = randomY ? Math.random() * H : -30;
      base.vx = (Math.random() - 0.5) * 0.5;
      base.vy = Math.random() * 2 + 1;
      base.size = Math.random() * 6 + 3;
      base.color = Math.random() > 0.6 ? "#9B7FFF" : "#6040CC";
      base.opacity = Math.random() * 0.75 + 0.45;
      break;
    case "sad":
      base.x = Math.random() * W;
      base.y = randomY ? Math.random() * H : -20;
      base.vx = (Math.random() - 0.5) * 0.3;
      base.vy = Math.random() * 1.5 + 0.8;
      base.size = Math.random() * 12 + 6;
      base.color = Math.random() > 0.5 ? "#6AAEDC" : "#4488BB";
      base.opacity = Math.random() * 0.65 + 0.45;
      break;
    case "happy":
      base.x = W / 2 + (Math.random() - 0.5) * W * 0.5;
      base.y = randomY ? Math.random() * H : H * 0.6 + Math.random() * 100;
      base.vx = (Math.random() - 0.5) * 4;
      base.vy = -(Math.random() * 3 + 1);
      base.size = Math.random() * 18 + 8;
      base.color = ["#F5C542", "#FFD700", "#FF8C00", "#FFF176", "#FF6B6B"][
        Math.floor(Math.random() * 5)
      ];
      base.opacity = Math.random() * 0.9 + 0.3;
      break;
    case "romantic":
      base.x = Math.random() * W;
      base.y = randomY ? Math.random() * H : -30;
      base.vx = Math.sin(base.angle ?? 0) * 1.2;
      base.vy = Math.random() * 1.5 + 0.5;
      base.size = Math.random() * 24 + 12;
      base.color = ["#FF7BAC", "#FF4D8A", "#FF9ABF", "#FFCCDD"][
        Math.floor(Math.random() * 4)
      ];
      base.opacity = Math.random() * 0.8 + 0.35;
      break;
    case "action": {
      base.x = W / 2 + (Math.random() - 0.5) * 60;
      base.y = H / 2 + (Math.random() - 0.5) * 60;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4;
      base.vx = Math.cos(angle) * speed;
      base.vy = Math.sin(angle) * speed;
      base.size = Math.random() * 9 + 3;
      base.color = ["#FF7A30", "#FF4500", "#FF8C00", "#FFFF00"][
        Math.floor(Math.random() * 4)
      ];
      base.opacity = Math.random() * 0.95 + 0.15;
      base.maxLife = Math.random() * 50 + 20;
      break;
    }
    case "mystery":
      base.x = Math.random() * W;
      base.y = randomY ? Math.random() * H : Math.random() * H;
      base.vx = (Math.random() - 0.5) * 0.8;
      base.vy = (Math.random() - 0.5) * 0.8;
      base.size = Math.random() * 15 + 6;
      base.color = ["#3DCCAA", "#00FF88", "#00CCA3"][
        Math.floor(Math.random() * 3)
      ];
      base.opacity = Math.random() * 0.65 + 0.25;
      base.opacityDelta =
        (Math.random() * 0.04 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
      break;
    case "dramatic": {
      const dAngle = Math.random() * Math.PI * 2;
      const dR = Math.random() * Math.min(W, H) * 0.3 + 40;
      base.x = W / 2 + Math.cos(dAngle) * dR;
      base.y = H / 2 + Math.sin(dAngle) * dR;
      base.vx = -Math.cos(dAngle) * 0.4 + (Math.random() - 0.5) * 0.3;
      base.vy = -Math.sin(dAngle) * 0.4 + (Math.random() - 0.5) * 0.3;
      base.size = Math.random() * 18 + 6;
      base.color = ["#DC3A5C", "#FF1744", "#880020"][
        Math.floor(Math.random() * 3)
      ];
      base.opacity = Math.random() * 0.8 + 0.3;
      base.spin = (Math.random() - 0.5) * 0.04;
      break;
    }
    default: // neutral
      base.x = Math.random() * W;
      base.y = randomY ? Math.random() * H : -20;
      base.vx = (Math.random() - 0.5) * 0.5;
      base.vy = -(Math.random() * 0.5 + 0.2);
      base.size = Math.random() * 12 + 5;
      base.color = ["#A8B0C0", "#C0C8D8", "#FFFFFF"][
        Math.floor(Math.random() * 3)
      ];
      base.opacity = Math.random() * 0.65 + 0.25;
      break;
  }
  return base;
}

function isOffscreen(p: Particle, W: number, H: number): boolean {
  if (p.life >= p.maxLife) return true;
  if (p.type === "sad" || p.type === "suspense" || p.type === "romantic") {
    return p.y > H + 40;
  }
  if (p.type === "happy") return p.y < -40 || p.x < -40 || p.x > W + 40;
  if (p.type === "action") return p.opacity <= 0.02;
  if (p.type === "neutral") return p.y < -40;
  if (p.type === "dramatic") {
    const dx = p.x - W / 2;
    const dy = p.y - H / 2;
    return Math.sqrt(dx * dx + dy * dy) > Math.max(W, H);
  }
  return false;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));

  if (p.type === "sad") {
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === "romantic") {
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle ?? 0);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 18;
    const s = p.size * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, s);
    ctx.bezierCurveTo(s * 2, -s * 0.5, s * 3, s * 1.5, 0, s * 3);
    ctx.bezierCurveTo(-s * 3, s * 1.5, -s * 2, -s * 0.5, 0, s);
    ctx.fill();
  } else if (p.type === "happy") {
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle ?? 0);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 14;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
  } else if (p.type === "action") {
    ctx.strokeStyle = p.color;
    ctx.lineWidth = p.size;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 22;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
    ctx.stroke();
  } else if (p.type === "mystery") {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
    g.addColorStop(0, p.color);
    g.addColorStop(0.5, `${p.color}88`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === "dramatic") {
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    g.addColorStop(0, p.color);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function getMoodBgColor(mood: string): string {
  const colorMap: Record<string, string> = {
    happy: "#2d2000",
    sad: "#0a1628",
    suspense: "#160928",
    romantic: "#2a0a18",
    action: "#2d1200",
    mystery: "#002018",
    dramatic: "#200008",
    neutral: "#141420",
  };
  return colorMap[mood] ?? "#141420";
}

const MOOD_GLOW: Record<string, string> = {
  happy: "rgba(245,197,66,0.6)",
  sad: "rgba(106,174,220,0.55)",
  suspense: "rgba(155,127,255,0.6)",
  romantic: "rgba(255,123,172,0.6)",
  action: "rgba(255,122,48,0.7)",
  mystery: "rgba(61,204,170,0.55)",
  dramatic: "rgba(220,58,92,0.65)",
  neutral: "rgba(168,176,192,0.4)",
};

function MoodCanvas({ mood }: { mood: Mood }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const frameRef = useRef(0);
  const lightningRef = useRef(0);
  const lightningActiveRef = useRef(false);
  const lightningAlphaRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particlesRef.current = createParticles(
        mood as string,
        canvas.width,
        canvas.height,
        200,
      );
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const SPAWN_RATE =
      mood === "action"
        ? 12
        : mood === "happy"
          ? 9
          : mood === "dramatic"
            ? 6
            : 3;

    function tick() {
      const W = canvas!.width;
      const H = canvas!.height;
      frameRef.current++;

      const trailAlpha =
        mood === "action"
          ? 0.35
          : mood === "mystery"
            ? 0.08
            : mood === "dramatic"
              ? 0.15
              : 0.3;
      ctx!.fillStyle = `rgba(0,0,0,${trailAlpha})`;
      ctx!.fillRect(0, 0, W, H);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.opacity += p.opacityDelta;
        if (p.opacity <= 0.05) p.opacityDelta = Math.abs(p.opacityDelta);
        if (p.opacity >= 0.95) p.opacityDelta = -Math.abs(p.opacityDelta);
        if (p.angle !== undefined && p.spin) p.angle += p.spin;

        if (mood === "action") {
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.opacity -= 0.04;
          p.size *= 0.98;
        }
        if (mood === "dramatic") {
          const cx = W / 2;
          const cy = H / 2;
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const tangentX = -dy / (dist + 1);
          const tangentY = dx / (dist + 1);
          p.vx += tangentX * 0.12;
          p.vy += tangentY * 0.12;
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > 5) {
            p.vx = (p.vx / speed) * 5;
            p.vy = (p.vy / speed) * 5;
          }
        }
        if (mood === "sad") {
          if (p.y > H - 30 && p.y < H - 10) {
            ctx!.save();
            ctx!.globalAlpha = 0.2;
            ctx!.strokeStyle = p.color;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.ellipse(
              p.x,
              H - 20,
              (15 * (p.y - (H - 30))) / 20,
              5,
              0,
              0,
              Math.PI * 2,
            );
            ctx!.stroke();
            ctx!.restore();
          }
        }

        drawParticle(ctx!, p);

        if (isOffscreen(p, W, H)) {
          particles.splice(i, 1);
        }
      }

      for (let s = 0; s < SPAWN_RATE; s++) {
        if (particles.length < 360) {
          particles.push(spawnParticle(mood as string, W, H, false));
        }
      }

      if (mood === "suspense") {
        lightningRef.current++;
        const interval = 180 + Math.random() * 120;
        if (lightningRef.current > interval && !lightningActiveRef.current) {
          lightningActiveRef.current = true;
          lightningAlphaRef.current = 0.7;
          lightningRef.current = 0;
        }
        if (lightningActiveRef.current) {
          ctx!.save();
          ctx!.globalAlpha = lightningAlphaRef.current;
          ctx!.fillStyle = "rgba(180, 150, 255, 1)";
          ctx!.fillRect(0, 0, W, H);
          if (lightningAlphaRef.current > 0.5) {
            ctx!.strokeStyle = "#ffffff";
            ctx!.lineWidth = 3;
            ctx!.shadowColor = "#9B7FFF";
            ctx!.shadowBlur = 20;
            ctx!.beginPath();
            const lx = W * 0.3 + Math.random() * W * 0.4;
            ctx!.moveTo(lx, 0);
            let ly = 0;
            while (ly < H * 0.8) {
              ly += 30 + Math.random() * 40;
              ctx!.lineTo(lx + (Math.random() - 0.5) * 80, ly);
            }
            ctx!.stroke();
          }
          ctx!.restore();
          lightningAlphaRef.current -= 0.06;
          if (lightningAlphaRef.current <= 0) {
            lightningActiveRef.current = false;
          }
        }
      }

      if (mood === "sad" && frameRef.current % 3 === 0) {
        ctx!.save();
        ctx!.globalAlpha = 0.04;
        const fg = ctx!.createLinearGradient(0, H * 0.6, 0, H);
        fg.addColorStop(0, "transparent");
        fg.addColorStop(1, "#224466");
        ctx!.fillStyle = fg;
        ctx!.fillRect(0, 0, W, H);
        ctx!.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [mood]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1, opacity: 1 }}
    />
  );
}

// ─── Video Recording ─────────────────────────────────────────────────────────

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Draw a character silhouette on canvas using 2D paths
function drawCharacterOnCanvas(
  ctx: CanvasRenderingContext2D,
  type: CharacterType,
  cx: number,
  groundY: number,
  moodColor: string,
) {
  // Parse hex color to rgba
  const hex = moodColor.replace("#", "");
  let fill = "rgba(200,200,220,0.85)";
  if (hex.length === 6) {
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    fill = `rgba(${r},${g},${b},0.85)`;
  }

  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = fill;
  ctx.shadowColor = moodColor;
  ctx.shadowBlur = 20;

  if (type === "man") {
    const scale = 2.2;
    const headR = 10 * scale;
    const headY = groundY - 80 * scale;
    // Head
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.beginPath();
    ctx.moveTo(cx - 12 * scale, headY + headR + 5 * scale);
    ctx.quadraticCurveTo(
      cx,
      headY + headR,
      cx + 12 * scale,
      headY + headR + 5 * scale,
    );
    ctx.lineTo(cx + 15 * scale, headY + headR + 30 * scale);
    ctx.lineTo(cx + 5 * scale, headY + headR + 30 * scale);
    ctx.lineTo(cx, headY + headR + 22 * scale);
    ctx.lineTo(cx - 5 * scale, headY + headR + 30 * scale);
    ctx.lineTo(cx - 15 * scale, headY + headR + 30 * scale);
    ctx.closePath();
    ctx.fill();
    // Left arm
    ctx.lineWidth = 4 * scale * 0.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 12 * scale, headY + headR + 5 * scale);
    ctx.lineTo(cx - 18 * scale, headY + headR + 20 * scale);
    ctx.stroke();
    // Right arm
    ctx.beginPath();
    ctx.moveTo(cx + 12 * scale, headY + headR + 5 * scale);
    ctx.lineTo(cx + 18 * scale, headY + headR + 20 * scale);
    ctx.stroke();
  } else if (type === "woman") {
    const scale = 2.0;
    const headR = 9 * scale;
    const headY = groundY - 76 * scale;
    // Head
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    // Torso
    ctx.beginPath();
    ctx.moveTo(cx - 10 * scale, headY + headR + 3 * scale);
    ctx.quadraticCurveTo(
      cx,
      headY + headR,
      cx + 10 * scale,
      headY + headR + 3 * scale,
    );
    ctx.lineTo(cx + 12 * scale, headY + headR + 20 * scale);
    ctx.quadraticCurveTo(
      cx,
      headY + headR + 28 * scale,
      cx - 12 * scale,
      headY + headR + 20 * scale,
    );
    ctx.closePath();
    ctx.fill();
    // Skirt
    ctx.beginPath();
    ctx.moveTo(cx - 12 * scale, headY + headR + 20 * scale);
    ctx.lineTo(cx - 18 * scale, groundY);
    ctx.lineTo(cx + 18 * scale, groundY);
    ctx.lineTo(cx + 12 * scale, headY + headR + 20 * scale);
    ctx.closePath();
    ctx.fill();
    // Arms
    ctx.lineWidth = 3.5 * scale * 0.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 10 * scale, headY + headR + 3 * scale);
    ctx.lineTo(cx - 16 * scale, headY + headR + 18 * scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 10 * scale, headY + headR + 3 * scale);
    ctx.lineTo(cx + 16 * scale, headY + headR + 18 * scale);
    ctx.stroke();
  } else if (type === "child") {
    const scale = 1.4;
    const headR = 10 * scale;
    const headY = groundY - 55 * scale;
    // Head
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.beginPath();
    ctx.moveTo(cx - 10 * scale, headY + headR + 3 * scale);
    ctx.quadraticCurveTo(
      cx,
      headY + headR,
      cx + 10 * scale,
      headY + headR + 3 * scale,
    );
    ctx.lineTo(cx + 11 * scale, headY + headR + 22 * scale);
    ctx.lineTo(cx + 4 * scale, headY + headR + 22 * scale);
    ctx.lineTo(cx, headY + headR + 16 * scale);
    ctx.lineTo(cx - 4 * scale, headY + headR + 22 * scale);
    ctx.lineTo(cx - 11 * scale, headY + headR + 22 * scale);
    ctx.closePath();
    ctx.fill();
    // Arms
    ctx.lineWidth = 3 * scale * 0.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 10 * scale, headY + headR + 3 * scale);
    ctx.lineTo(cx - 15 * scale, headY + headR + 15 * scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 10 * scale, headY + headR + 3 * scale);
    ctx.lineTo(cx + 15 * scale, headY + headR + 15 * scale);
    ctx.stroke();
  } else if (type === "oldman") {
    const scale = 2.0;
    const headR = 9 * scale;
    const headY = groundY - 76 * scale;
    // Head
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    // Body (slightly hunched)
    ctx.beginPath();
    ctx.moveTo(cx - 10 * scale, headY + headR + 3 * scale);
    ctx.quadraticCurveTo(
      cx,
      headY + headR,
      cx + 10 * scale,
      headY + headR + 3 * scale,
    );
    ctx.lineTo(cx + 12 * scale, headY + headR + 29 * scale);
    ctx.lineTo(cx + 4 * scale, headY + headR + 29 * scale);
    ctx.lineTo(cx, headY + headR + 21 * scale);
    ctx.lineTo(cx - 4 * scale, headY + headR + 29 * scale);
    ctx.lineTo(cx - 12 * scale, headY + headR + 29 * scale);
    ctx.closePath();
    ctx.fill();
    // Arms
    ctx.lineWidth = 4 * scale * 0.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 10 * scale, headY + headR + 3 * scale);
    ctx.lineTo(cx - 16 * scale, headY + headR + 18 * scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 10 * scale, headY + headR + 3 * scale);
    ctx.lineTo(cx + 16 * scale, headY + headR + 18 * scale);
    ctx.stroke();
    // Cane
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + 16 * scale, headY + headR + 18 * scale);
    ctx.lineTo(cx + 20 * scale, groundY);
    ctx.stroke();
  } else if (type === "oldwoman") {
    const scale = 1.8;
    const headR = 8 * scale;
    const headY = groundY - 72 * scale;
    // Head
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    // Torso
    ctx.beginPath();
    ctx.moveTo(cx - 9 * scale, headY + headR + 3 * scale);
    ctx.quadraticCurveTo(
      cx,
      headY + headR,
      cx + 9 * scale,
      headY + headR + 3 * scale,
    );
    ctx.lineTo(cx + 10 * scale, headY + headR + 18 * scale);
    ctx.quadraticCurveTo(
      cx,
      headY + headR + 24 * scale,
      cx - 10 * scale,
      headY + headR + 18 * scale,
    );
    ctx.closePath();
    ctx.fill();
    // Skirt
    ctx.beginPath();
    ctx.moveTo(cx - 10 * scale, headY + headR + 18 * scale);
    ctx.lineTo(cx - 14 * scale, groundY);
    ctx.lineTo(cx + 14 * scale, groundY);
    ctx.lineTo(cx + 10 * scale, headY + headR + 18 * scale);
    ctx.closePath();
    ctx.fill();
    // Arms
    ctx.lineWidth = 3 * scale * 0.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 9 * scale, headY + headR + 3 * scale);
    ctx.lineTo(cx - 14 * scale, headY + headR + 16 * scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 9 * scale, headY + headR + 3 * scale);
    ctx.lineTo(cx + 14 * scale, headY + headR + 16 * scale);
    ctx.stroke();
    // Cane
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + 14 * scale, headY + headR + 16 * scale);
    ctx.lineTo(cx + 18 * scale, groundY);
    ctx.stroke();
  }

  ctx.restore();
}

async function recordScenesToVideo(scenes: ParsedScene[]): Promise<void> {
  const W = 1280;
  const H = 720;
  const FPS = 30;
  const SCENE_FRAMES = 6 * FPS; // 6 seconds per scene = 180 frames
  const TRANSITION_FRAMES = 15; // flash transition between scenes
  const TOTAL_FRAMES =
    scenes.length * SCENE_FRAMES + (scenes.length - 1) * TRANSITION_FRAMES;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  canvas.style.cssText = "position:fixed;left:-9999px;top:-9999px;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";

  const stream = canvas.captureStream(FPS);
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const stopPromise = new Promise<void>((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "story-video.webm";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      resolve();
    };
  });

  recorder.start();

  // Per-scene particle state
  let particles: Particle[] = [];
  let currentSceneIdx = -1;

  // Seed for film grain (deterministic per frame)
  let grainSeed = 0;
  function nextGrain() {
    grainSeed = (grainSeed * 1664525 + 1013904223) & 0xffffffff;
    return (grainSeed >>> 0) / 4294967296;
  }

  // Track which scene we've toasted
  const toastedScenes = new Set<number>();

  let frameIndex = 0;
  await new Promise<void>((resolve) => {
    function renderFrame() {
      // Compute which scene and local frame we're in (accounting for transitions)
      // segmentLen unused - removed
      // Find scene and offset
      let sceneIdx = 0;
      let localFrame = frameIndex;
      let inTransition = false;
      let transitionFrame = 0;

      let offset = frameIndex;
      for (let s = 0; s < scenes.length; s++) {
        if (offset < SCENE_FRAMES) {
          sceneIdx = s;
          localFrame = offset;
          inTransition = false;
          break;
        }
        offset -= SCENE_FRAMES;
        if (s < scenes.length - 1) {
          if (offset < TRANSITION_FRAMES) {
            sceneIdx = s;
            inTransition = true;
            transitionFrame = offset;
            localFrame = SCENE_FRAMES - 1;
            break;
          }
          offset -= TRANSITION_FRAMES;
        }
        // If we've exhausted without breaking, it's the last frame
        sceneIdx = scenes.length - 1;
        localFrame = SCENE_FRAMES - 1;
      }

      const scene = scenes[Math.min(sceneIdx, scenes.length - 1)];
      const config = MOOD_CONFIG[scene.mood];
      const mood = scene.mood as string;
      const moodColor = config.color;

      // Toast at start of each scene
      if (!inTransition && !toastedScenes.has(sceneIdx)) {
        toastedScenes.add(sceneIdx);
        toast(`🎬 Recording scene ${sceneIdx + 1}/${scenes.length}...`, {
          duration: 2000,
        });
      }

      // Re-init particles when scene changes
      if (sceneIdx !== currentSceneIdx) {
        currentSceneIdx = sceneIdx;
        particles = createParticles(mood, W, H, 200);
      }

      // ── Layer 1: Solid mood background ───────────────────────────────────
      const bgColor = getMoodBgColor(mood);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);

      // ── Layer 2: Particle system ─────────────────────────────────────────
      // Advance & draw particles
      const SPAWN_RATE =
        mood === "action"
          ? 12
          : mood === "happy"
            ? 9
            : mood === "dramatic"
              ? 6
              : 3;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.opacity += p.opacityDelta;
        if (p.opacity <= 0.05) p.opacityDelta = Math.abs(p.opacityDelta);
        if (p.opacity >= 0.95) p.opacityDelta = -Math.abs(p.opacityDelta);
        if (p.angle !== undefined && p.spin) p.angle += p.spin;

        if (mood === "action") {
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.opacity -= 0.04;
          p.size *= 0.98;
        }
        if (mood === "dramatic") {
          const cx2 = W / 2;
          const cy2 = H / 2;
          const dx = p.x - cx2;
          const dy = p.y - cy2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const tangentX = -dy / (dist + 1);
          const tangentY = dx / (dist + 1);
          p.vx += tangentX * 0.12;
          p.vy += tangentY * 0.12;
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > 5) {
            p.vx = (p.vx / speed) * 5;
            p.vy = (p.vy / speed) * 5;
          }
        }

        drawParticle(ctx, p);

        if (isOffscreen(p, W, H)) {
          particles.splice(i, 1);
        }
      }

      for (let s = 0; s < SPAWN_RATE; s++) {
        if (particles.length < 360) {
          particles.push(spawnParticle(mood, W, H, false));
        }
      }

      // ── Layer 3: Radial mood glow at center ──────────────────────────────
      const grd = ctx.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        W * 0.55,
      );
      grd.addColorStop(0, config.particleColor);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // ── Layer 4: Pulsing breathing glow overlay ──────────────────────────
      const breathAlpha =
        0.18 + 0.12 * Math.sin((localFrame / FPS) * 2 * Math.PI * 0.5);
      const glowGrd = ctx.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        W * 0.45,
      );
      glowGrd.addColorStop(
        0,
        `${moodColor}${Math.round(breathAlpha * 255)
          .toString(16)
          .padStart(2, "0")}`,
      );
      glowGrd.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrd;
      ctx.fillRect(0, 0, W, H);

      // ── Layer 5: Vignette ────────────────────────────────────────────────
      const vigGrd = ctx.createRadialGradient(
        W / 2,
        H / 2,
        W * 0.25,
        W / 2,
        H / 2,
        W * 0.75,
      );
      vigGrd.addColorStop(0, "transparent");
      vigGrd.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = vigGrd;
      ctx.fillRect(0, 0, W, H);

      // ── Layer 6: Film grain ──────────────────────────────────────────────
      ctx.save();
      ctx.globalAlpha = 0.04;
      const imageData = ctx.createImageData(W, H);
      const data = imageData.data;
      for (let i2 = 0; i2 < data.length; i2 += 4) {
        const v = Math.floor(nextGrain() * 255);
        data[i2] = v;
        data[i2 + 1] = v;
        data[i2 + 2] = v;
        data[i2 + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      ctx.restore();

      // ── Layer 7: Letterbox bars ──────────────────────────────────────────
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H * 0.07);
      ctx.fillRect(0, H * 0.93, W, H * 0.07);

      // ── Layer 8: Character silhouettes ───────────────────────────────────
      const characters = detectCharacters(scene.text);
      const count = characters.length;
      const spacing = count === 1 ? 0 : count === 2 ? 110 : 95;
      const groundY = H * 0.93; // just above bottom letterbox
      // Float animation per frame
      for (let ci = 0; ci < count; ci++) {
        const xOffset = (ci - (count - 1) / 2) * spacing;
        const floatY =
          Math.sin(
            (localFrame / FPS) * Math.PI * (0.7 + ci * 0.15) + ci * 1.2,
          ) * 8;
        drawCharacterOnCanvas(
          ctx,
          characters[ci],
          W / 2 + xOffset,
          groundY + floatY,
          moodColor,
        );
      }
      // Ground glow line
      if (count > 0) {
        const lineGrd = ctx.createLinearGradient(
          W / 2 - count * 80 - 40,
          0,
          W / 2 + count * 80 + 40,
          0,
        );
        lineGrd.addColorStop(0, "transparent");
        lineGrd.addColorStop(0.5, `${moodColor}88`);
        lineGrd.addColorStop(1, "transparent");
        ctx.fillStyle = lineGrd;
        ctx.fillRect(W / 2 - count * 80 - 40, groundY - 1, count * 160 + 80, 2);
      }

      // ── Layer 9: Scene title (top left, above letterbox) ─────────────────
      ctx.save();
      ctx.font = "bold 18px monospace";
      ctx.fillStyle = moodColor;
      ctx.globalAlpha = 0.9;
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 8;
      ctx.textAlign = "left";
      ctx.fillText(scene.title.toUpperCase(), 36, H * 0.055);
      ctx.restore();

      // ── Layer 10: Mood badge (top right) ─────────────────────────────────
      ctx.save();
      ctx.font = "bold 14px sans-serif";
      const badgeText = config.label.toUpperCase();
      const bw = ctx.measureText(badgeText).width + 28;
      const bx = W - bw - 30;
      const by = H * 0.055 - 14;
      // Badge background
      ctx.fillStyle = `${moodColor}33`;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, 26, 13);
      ctx.fill();
      // Badge border
      ctx.strokeStyle = `${moodColor}99`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Badge glow
      ctx.shadowColor = moodColor;
      ctx.shadowBlur = 12;
      ctx.fillStyle = moodColor;
      ctx.textAlign = "left";
      ctx.fillText(badgeText, bx + 14, by + 18);
      ctx.restore();

      // ── Layer 11: Scene text (center) ────────────────────────────────────
      ctx.save();
      const fontSize =
        scene.text.length < 150 ? 30 : scene.text.length < 300 ? 25 : 21;
      ctx.font = `${fontSize}px Georgia, serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.95)";
      ctx.shadowBlur = 18;

      const lines = wrapText(ctx, scene.text, W * 0.68);
      const lineH = fontSize * 1.55;
      const textBlockH = lines.length * lineH;
      // Center text in the usable area (between letterboxes), shifted up to avoid silhouettes
      const usableTop = H * 0.07 + 10;
      const usableBottom = H * 0.93 - 10;
      const usableCenterY = (usableTop + usableBottom * 0.65) / 2;
      let ty = usableCenterY - textBlockH / 2 + lineH * 0.5;

      for (const line of lines) {
        // Extra glow pass
        ctx.shadowColor = `${moodColor}88`;
        ctx.shadowBlur = 28;
        ctx.fillText(line, W / 2, ty);
        // Crisp pass
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 10;
        ctx.fillText(line, W / 2, ty);
        ty += lineH;
      }
      ctx.restore();

      // ── Layer 12: Scene counter (bottom right, above letterbox) ──────────
      ctx.save();
      ctx.font = "14px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.textAlign = "right";
      ctx.fillText(
        `Scene ${scene.sceneNumber} / ${scenes.length}`,
        W - 30,
        H * 0.925,
      );
      ctx.restore();

      // ── Transition flash overlay ─────────────────────────────────────────
      if (inTransition) {
        const flashColor =
          MOOD_FLASH[scenes[sceneIdx + 1]?.mood as string] ??
          MOOD_FLASH[mood] ??
          "rgba(255,255,255,0.7)";
        const alpha = (1 - transitionFrame / TRANSITION_FRAMES) * 0.75;
        // Extract rgba from string like "rgba(r,g,b,x)"
        const match = flashColor.match(/rgba\((\d+),(\d+),(\d+),/);
        if (match) {
          ctx.fillStyle = `rgba(${match[1]},${match[2]},${match[3]},${alpha})`;
        } else {
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        }
        ctx.fillRect(0, 0, W, H);
      }

      frameIndex++;
      if (frameIndex < TOTAL_FRAMES) {
        requestAnimationFrame(renderFrame);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(renderFrame);
  });

  recorder.stop();
  await stopPromise;
  document.body.removeChild(canvas);
}

// ─── Mood flash colors ────────────────────────────────────────────────────────
const MOOD_FLASH: Record<string, string> = {
  happy: "rgba(245,197,66,0.7)",
  sad: "rgba(106,174,220,0.7)",
  suspense: "rgba(155,127,255,0.7)",
  romantic: "rgba(255,123,172,0.7)",
  action: "rgba(255,122,48,0.7)",
  mystery: "rgba(61,204,170,0.7)",
  dramatic: "rgba(220,58,92,0.7)",
  neutral: "rgba(168,176,192,0.7)",
};

// ─── StoryPlayer ─────────────────────────────────────────────────────────────

export function StoryPlayer({
  scenes,
  onRegenerate,
  onChangeStyle,
  onExport,
}: StoryPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);
  const SCENE_DURATION = 7000;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const triggerFlash = useCallback((mood: string) => {
    setFlashColor(MOOD_FLASH[mood] ?? "rgba(255,255,255,0.7)");
    setTimeout(() => setFlashColor(null), 800);
  }, []);

  const goToScene = useCallback(
    (index: number) => {
      clearTimer();
      const clamped = Math.max(0, Math.min(index, scenes.length - 1));
      const newMood = scenes[clamped]?.mood as string;
      triggerFlash(newMood);
      setCurrentIndex(clamped);
      setProgress(0);
      progressRef.current = 0;
    },
    [scenes, clearTimer, triggerFlash],
  );

  const goPrev = useCallback(
    () => goToScene(currentIndex - 1),
    [currentIndex, goToScene],
  );
  const goNext = useCallback(() => {
    if (currentIndex < scenes.length - 1) goToScene(currentIndex + 1);
    else setIsPlaying(false);
  }, [currentIndex, scenes.length, goToScene]);

  useEffect(() => {
    clearTimer();
    if (!isPlaying || scenes.length === 0) return;
    const intervalMs = 100;
    timerRef.current = setInterval(() => {
      progressRef.current += (intervalMs / SCENE_DURATION) * 100;
      setProgress(Math.min(progressRef.current, 100));
      if (progressRef.current >= 100) {
        clearTimer();
        if (currentIndex < scenes.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setProgress(0);
          progressRef.current = 0;
        } else {
          setIsPlaying(false);
        }
      }
    }, intervalMs);
    return clearTimer;
  }, [isPlaying, currentIndex, scenes.length, clearTimer]);

  const handleDownload = useCallback(async () => {
    if (isRecording || scenes.length === 0) return;
    setIsRecording(true);
    toast("🎬 Recording video... please wait", { duration: 4000 });
    try {
      await recordScenesToVideo(scenes);
      toast.success("✅ Video ready! Download started.");
    } catch (err) {
      console.error(err);
      toast.error("Recording failed. Please try again.");
    } finally {
      setIsRecording(false);
    }
  }, [isRecording, scenes]);

  if (scenes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] rounded-2xl border border-border bg-card">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            Enter your story and click Generate to begin
          </p>
        </div>
      </div>
    );
  }

  const scene = scenes[currentIndex];
  const config = MOOD_CONFIG[scene.mood];
  const elapsed =
    currentIndex * SCENE_DURATION + (progress / 100) * SCENE_DURATION;
  const total = scenes.length * SCENE_DURATION;
  const fmt = (ms: number) =>
    `${String(Math.floor(ms / 60000)).padStart(2, "0")}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

  const moodGlow = MOOD_GLOW[scene.mood as string] ?? "rgba(255,255,255,0.4)";
  const playerBoxShadow = `0 0 40px ${moodGlow}, 0 0 80px ${moodGlow.replace("0.6", "0.3").replace("0.7", "0.35").replace("0.5", "0.25").replace("0.55", "0.28").replace("0.65", "0.32")}, inset 0 0 60px rgba(0,0,0,0.4)`;

  return (
    <div className="flex flex-col gap-4">
      {/* Main cinematic player */}
      <div
        data-ocid="player.canvas_target"
        className="relative rounded-2xl overflow-hidden"
        style={{
          minHeight: 520,
          background: config.gradient,
          boxShadow: playerBoxShadow,
          transition: "box-shadow 0.8s ease",
        }}
      >
        {/* Breathing mood gradient background */}
        <motion.div
          className="absolute inset-0"
          style={{
            zIndex: 0,
            background: `radial-gradient(ellipse at center, ${config.color}30 0%, ${config.color}10 50%, transparent 80%)`,
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Canvas particle system */}
        <MoodCanvas mood={scene.mood} />

        {/* Pulsing mood glow overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 2,
            background: `radial-gradient(ellipse at center, ${config.color}25 0%, transparent 65%)`,
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 3,
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)",
          }}
        />

        {/* Scene flash on transition */}
        <AnimatePresence>
          {flashColor && (
            <motion.div
              key="flash"
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 6, background: flashColor }}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          )}
        </AnimatePresence>

        {/* Cinematic letterbox bars */}
        <div
          className="absolute top-0 left-0 right-0 bg-black z-10"
          style={{ height: "7%" }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 bg-black z-10"
          style={{ height: "7%" }}
        />

        {/* Character silhouettes */}
        <CharacterSilhouettes
          text={scene.text}
          moodColor={config.color}
          sceneId={scene.id}
        />

        {/* Scene content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, x: 100, scale: 0.93 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 1.05 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col justify-center items-center z-10"
            style={{
              paddingTop: "10%",
              paddingBottom: "10%",
              padding: "10% 2.5rem 10%",
            }}
          >
            {/* Scene title */}
            <div className="absolute top-[9%] left-6 z-20">
              <span
                className="text-xs font-mono tracking-widest uppercase"
                style={{ color: config.color, opacity: 0.9 }}
              >
                {scene.title}
              </span>
            </div>

            {/* Mood badge — pulsing */}
            <div className="absolute top-[9%] right-6 z-20">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
                transition={{
                  delay: 0.2,
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="text-xs font-semibold px-3 py-1 rounded-full border inline-block"
                style={{
                  color: config.color,
                  borderColor: `${config.color}80`,
                  background: `${config.color}30`,
                  boxShadow: `0 0 18px ${config.color}70, 0 0 40px ${config.color}40`,
                }}
              >
                {config.label}
              </motion.span>
            </div>

            {/* Main text */}
            <div className="max-w-2xl text-center px-4">
              <p
                className="text-white leading-relaxed font-display"
                style={{
                  fontSize:
                    scene.text.length < 150
                      ? "1.5rem"
                      : scene.text.length < 300
                        ? "1.25rem"
                        : "1.1rem",
                  textShadow: `0 2px 16px rgba(0,0,0,0.95), 0 0 30px ${config.color}80, 0 0 60px ${config.color}40, 0 0 80px rgba(0,0,0,0.8)`,
                  lineHeight: 1.75,
                }}
              >
                <TypewriterText text={scene.text} />
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Scene counter */}
        <div className="absolute bottom-[9%] right-6 z-20">
          <span className="text-xs font-mono text-white/50">
            {currentIndex + 1} / {scenes.length}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono w-10 text-right">
            {fmt(elapsed)}
          </span>
          <div className="flex-1">
            <Slider
              min={0}
              max={scenes.length * 100}
              value={[currentIndex * 100 + progress]}
              onValueChange={([val]) => goToScene(Math.floor(val / 100))}
              className="w-full"
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono w-10">
            {fmt(total)}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goPrev}
            disabled={currentIndex === 0 || isRecording}
            className="hover:bg-muted"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            data-ocid="player.primary_button"
            size="icon"
            onClick={() => setIsPlaying((p) => !p)}
            disabled={isRecording}
            className="w-10 h-10 rounded-full animate-pulse-glow"
            style={{
              background: "oklch(0.74 0.17 278)",
              color: "oklch(0.085 0.008 260)",
            }}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goNext}
            disabled={currentIndex === scenes.length - 1 || isRecording}
            className="hover:bg-muted"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2 pt-1 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs gap-1.5"
            onClick={onRegenerate}
            disabled={isRecording}
          >
            <RefreshCw className="w-3 h-3" /> Regenerate
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={onChangeStyle}
            disabled={isRecording}
          >
            Change Style
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={onExport}
            disabled={isRecording}
          >
            Export
          </Button>
          <Button
            data-ocid="player.download_button"
            variant="outline"
            size="sm"
            className="flex-1 text-xs gap-1.5"
            onClick={handleDownload}
            disabled={isRecording}
          >
            {isRecording ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Download className="w-3 h-3" />
                Download
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
