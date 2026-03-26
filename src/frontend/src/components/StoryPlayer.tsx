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
import { useCallback, useEffect, useRef, useState } from "react";
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

function ParticleOrbs({ mood }: { mood: Mood }) {
  const config = MOOD_CONFIG[mood];
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <div
        className="absolute rounded-full blur-3xl animate-float-orb"
        style={{
          width: 300,
          height: 300,
          left: "10%",
          top: "20%",
          background: config.particleColor,
        }}
      />
      <div
        className="absolute rounded-full blur-3xl animate-float-orb-2"
        style={{
          width: 200,
          height: 200,
          right: "15%",
          bottom: "25%",
          background: config.particleColor,
          animationDelay: "3s",
        }}
      />
      <div
        className="absolute rounded-full blur-2xl animate-float-orb"
        style={{
          width: 120,
          height: 120,
          left: "60%",
          top: "15%",
          background: config.particleColor,
          animationDelay: "5s",
        }}
      />
    </div>
  );
}

// Extract solid bg color from gradient string
function getMoodBgColor(mood: Mood): string {
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
  return colorMap[mood as string] ?? "#141420";
}

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

async function recordScenesToVideo(scenes: ParsedScene[]): Promise<void> {
  const W = 1280;
  const H = 720;
  const FPS = 30;
  const SCENE_SECS = 5;
  const TOTAL_FRAMES = scenes.length * SCENE_SECS * FPS;

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

  // Render frames
  let frameIndex = 0;
  await new Promise<void>((resolve) => {
    function renderFrame() {
      const sceneIdx = Math.floor(frameIndex / (SCENE_SECS * FPS));
      const scene = scenes[Math.min(sceneIdx, scenes.length - 1)];
      const config = MOOD_CONFIG[scene.mood];
      const bg = getMoodBgColor(scene.mood);

      // Background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Soft radial glow
      const grd = ctx.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        W * 0.6,
      );
      grd.addColorStop(0, `${config.particleColor}`);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Cinematic bars
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H * 0.06);
      ctx.fillRect(0, H * 0.94, W, H * 0.06);

      // Scene title (top-left)
      ctx.font = "bold 15px monospace";
      ctx.fillStyle = config.color;
      ctx.globalAlpha = 0.8;
      ctx.fillText(scene.title.toUpperCase(), 36, H * 0.12);
      ctx.globalAlpha = 1;

      // Mood badge (top-right)
      const badgeText = config.label.toUpperCase();
      ctx.font = "bold 13px sans-serif";
      const bw = ctx.measureText(badgeText).width + 24;
      const bx = W - bw - 30;
      const by = H * 0.08;
      ctx.fillStyle = `${config.color}22`;
      ctx.beginPath();
      ctx.roundRect(bx, by - 14, bw, 24, 12);
      ctx.fill();
      ctx.strokeStyle = `${config.color}66`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = config.color;
      ctx.fillText(badgeText, bx + 12, by + 5);

      // Main scene text (center)
      ctx.font = "28px serif";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 16;
      const lines = wrapText(ctx, scene.text, W * 0.72);
      const lineH = 40;
      const textBlockH = lines.length * lineH;
      let ty = H / 2 - textBlockH / 2 + lineH * 0.5;
      ctx.textAlign = "center";
      for (const line of lines) {
        ctx.fillText(line, W / 2, ty);
        ty += lineH;
      }
      ctx.shadowBlur = 0;
      ctx.textAlign = "left";

      // Scene counter (bottom-right)
      ctx.font = "13px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(
        `Scene ${scene.sceneNumber} / ${scenes.length}`,
        W - 160,
        H * 0.91,
      );

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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);
  const SCENE_DURATION = 7000;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goToScene = useCallback(
    (index: number) => {
      clearTimer();
      const clamped = Math.max(0, Math.min(index, scenes.length - 1));
      setCurrentIndex(clamped);
      setProgress(0);
      progressRef.current = 0;
    },
    [scenes.length, clearTimer],
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

  return (
    <div className="flex flex-col gap-4">
      <div
        data-ocid="player.canvas_target"
        className="relative rounded-2xl overflow-hidden film-grain vignette"
        style={{ minHeight: 400, background: config.gradient }}
      >
        <ParticleOrbs mood={scene.mood} />
        <div className="absolute top-0 left-0 right-0 h-[6%] bg-black z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-[6%] bg-black z-10" />

        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col justify-center items-center p-10 z-10"
            style={{ paddingTop: "10%", paddingBottom: "10%" }}
          >
            <div className="absolute top-[8%] left-6 z-20">
              <span
                className="text-xs font-mono tracking-widest uppercase"
                style={{ color: config.color, opacity: 0.8 }}
              >
                {scene.title}
              </span>
            </div>
            <div className="absolute top-[8%] right-6 z-20">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full border"
                style={{
                  color: config.color,
                  borderColor: `${config.color}40`,
                  background: `${config.color}15`,
                }}
              >
                {config.label}
              </span>
            </div>
            <div className="max-w-2xl text-center">
              <p
                className="text-white text-xl leading-relaxed font-display"
                style={{
                  textShadow:
                    "0 2px 12px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.5)",
                }}
              >
                <TypewriterText text={scene.text} />
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-[8%] right-6 z-20">
          <span className="text-xs font-mono text-white/60">
            Scene {currentIndex + 1} of {scenes.length}
          </span>
        </div>
      </div>

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
