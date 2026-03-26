import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SceneList } from "../components/SceneList";
import { StoryPlayer } from "../components/StoryPlayer";
import { StyleSettings } from "../components/StyleSettings";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateStory } from "../hooks/useQueries";
import {
  MOOD_CONFIG,
  STYLE_PRESETS,
  generateStoryTitle,
  splitIntoScenes,
} from "../utils/storyUtils";
import type { ParsedScene } from "../utils/storyUtils";

const SAMPLE_STORY = `The old lighthouse stood at the edge of the world, its beam cutting through the fog like a desperate prayer. Elara had come here to forget — the city, the noise, the face she still saw in her dreams.

She climbed the spiral steps slowly, each one groaning beneath her weight, as if the lighthouse itself was reluctant to let her reach the top. The storm was building outside. She could hear it gathering its fury over the water.

At the summit, through the salt-crusted glass, she saw something impossible. A ship — ancient, wooden, its sails black as midnight — sailing directly into the rocks. She grabbed the emergency radio, her hands trembling.

"This is lighthouse station calling any vessel in distress," she said. "You are heading toward the reef. Please respond."

Static crackled back. Then a voice, distant and strange: "We are not lost, keeper. We are arriving."

The ship didn't shatter on the rocks. Instead, it passed through them like smoke through fingers, and stopped in the still water below the lighthouse. A figure stood at the bow, looking up at her. Even through the fog and distance, she knew those eyes.

Her father had been dead for seven years.`;

function SceneThumb({
  scene,
  index,
  isActive,
  onClick,
}: {
  scene: ParsedScene;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const config = MOOD_CONFIG[scene.mood];
  return (
    <button
      type="button"
      data-ocid={`project.item.${index + 1}`}
      onClick={onClick}
      className={`rounded-xl overflow-hidden border transition-all duration-200 text-left ${
        isActive
          ? "border-primary/60 ring-1 ring-primary/30"
          : "border-border hover:border-border/70"
      }`}
      style={{ background: config.gradient }}
    >
      <div className="p-3 h-20 flex flex-col justify-between">
        <span className="text-[10px] font-mono" style={{ color: config.color }}>
          {scene.title}
        </span>
        <p className="text-[10px] text-white/70 line-clamp-2">
          {scene.text.slice(0, 60)}...
        </p>
      </div>
      <div className="px-3 py-1.5 border-t border-white/10 flex justify-between items-center">
        <span
          className="text-[9px] font-semibold"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </div>
    </button>
  );
}

export default function CreatePage() {
  const [storyText, setStoryText] = useState("");
  const [scenes, setScenes] = useState<ParsedScene[]>([]);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [activeStyle, setActiveStyle] = useState(STYLE_PRESETS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const createStory = useCreateStory();
  const generateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleGenerate = useCallback(() => {
    if (!storyText.trim()) {
      toast.error("Please enter your story first");
      return;
    }
    setIsGenerating(true);
    if (generateTimeoutRef.current) clearTimeout(generateTimeoutRef.current);
    generateTimeoutRef.current = setTimeout(() => {
      const parsed = splitIntoScenes(storyText);
      setScenes(parsed);
      setActiveSceneIndex(0);
      setStoryTitle(generateStoryTitle(storyText));
      setIsGenerating(false);
      toast.success(`Generated ${parsed.length} scenes`);
    }, 800);
  }, [storyText]);

  const handleSave = useCallback(async () => {
    if (!identity) {
      toast.error("Please login to save your story");
      login();
      return;
    }
    if (scenes.length === 0) {
      toast.error("Generate scenes first");
      return;
    }
    const style = STYLE_PRESETS.find((s) => s.id === activeStyle);
    try {
      await createStory.mutateAsync({
        title: storyTitle || generateStoryTitle(storyText),
        content: storyText,
        style: {
          colorPalette: style?.palette || "default",
          ambientMusic: "cinematic",
        },
      });
      toast.success("Story saved to your library!");
    } catch {
      toast.error("Failed to save story");
    }
  }, [
    identity,
    scenes,
    storyText,
    storyTitle,
    activeStyle,
    createStory,
    login,
  ]);

  const loadSample = () => {
    setStoryText(SAMPLE_STORY);
    toast("Sample story loaded — click Generate!");
  };

  useEffect(
    () => () => {
      if (generateTimeoutRef.current) clearTimeout(generateTimeoutRef.current);
    },
    [],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Left column — Story Studio */}
        <div className="w-[340px] shrink-0 flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Story Studio</h2>
              <button
                type="button"
                onClick={loadSample}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Load sample
              </button>
            </div>

            <Textarea
              data-ocid="story.textarea"
              placeholder="Paste or write your story here..."
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              className="min-h-[220px] resize-none bg-muted/30 border-border text-sm leading-relaxed placeholder:text-muted-foreground/60 focus-visible:ring-primary/40"
            />

            <div className="flex gap-2">
              <Button
                data-ocid="story.primary_button"
                onClick={handleGenerate}
                disabled={isGenerating || !storyText.trim()}
                className="flex-1 gap-2 font-semibold"
                style={{
                  background: "oklch(0.74 0.17 278)",
                  color: "oklch(0.085 0.008 260)",
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate
                  </>
                )}
              </Button>
              <Button
                data-ocid="story.secondary_button"
                variant="outline"
                size="icon"
                onClick={handleSave}
                disabled={createStory.isPending || isLoggingIn}
                title="Save to library"
              >
                {createStory.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </Button>
            </div>

            {createStory.isPending && (
              <div
                data-ocid="story.loading_state"
                className="text-xs text-muted-foreground text-center"
              >
                Saving...
              </div>
            )}
          </motion.div>

          {/* Scene list */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 flex-1"
          >
            <h3 className="text-sm font-semibold">Scenes</h3>
            <ScrollArea className="max-h-[320px] pr-1">
              <SceneList
                scenes={scenes}
                activeIndex={activeSceneIndex}
                onSelectScene={setActiveSceneIndex}
              />
            </ScrollArea>
          </motion.div>
        </div>

        {/* Right column — Player */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">
                Animated Story Preview
              </h2>
              {storyTitle && (
                <span className="text-sm text-muted-foreground truncate max-w-[300px]">
                  {storyTitle}
                </span>
              )}
            </div>
            <StoryPlayer
              scenes={scenes}
              activeStyle={activeStyle}
              onRegenerate={handleGenerate}
              onChangeStyle={() =>
                toast("Use the Style Settings below to change the visual style")
              }
              onExport={() =>
                toast("Export as shareable link — save your story first!")
              }
            />
          </motion.div>
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Project Scenes mini grid */}
        <div className="md:col-span-2 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-3">Project Scenes</h3>
          {scenes.length === 0 ? (
            <div
              data-ocid="project.empty_state"
              className="text-xs text-muted-foreground py-4 text-center"
            >
              Generate your story to see scene thumbnails here
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {scenes.slice(0, 6).map((scene, i) => (
                <SceneThumb
                  key={scene.id}
                  scene={scene}
                  index={i}
                  isActive={i === activeSceneIndex}
                  onClick={() => setActiveSceneIndex(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Style Settings */}
        <StyleSettings
          activeStyle={activeStyle}
          onStyleChange={setActiveStyle}
        />
      </div>
    </div>
  );
}
