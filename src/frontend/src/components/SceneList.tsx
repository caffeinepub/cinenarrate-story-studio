import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import type { ParsedScene } from "../utils/storyUtils";
import { MOOD_CONFIG } from "../utils/storyUtils";

interface SceneListProps {
  scenes: ParsedScene[];
  activeIndex: number;
  onSelectScene: (index: number) => void;
  onAddScene?: () => void;
}

export function SceneList({
  scenes,
  activeIndex,
  onSelectScene,
  onAddScene,
}: SceneListProps) {
  if (scenes.length === 0) {
    return (
      <div
        data-ocid="scenes.empty_state"
        className="text-center py-8 text-muted-foreground text-sm"
      >
        <p>Scenes will appear here after generation</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {scenes.map((scene, i) => {
        const config = MOOD_CONFIG[scene.mood];
        const isActive = i === activeIndex;
        return (
          <motion.button
            key={scene.id}
            data-ocid={`scenes.item.${i + 1}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelectScene(i)}
            className={`w-full text-left rounded-xl p-3 border transition-all duration-200 group ${
              isActive
                ? "border-primary/60 bg-primary/10"
                : "border-border bg-muted/30 hover:border-border/80 hover:bg-muted/50"
            }`}
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${config.color}15 0%, transparent 100%)`
                : undefined,
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-xs font-mono text-muted-foreground">
                {scene.title}
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{ color: config.color, background: `${config.color}18` }}
              >
                {config.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {scene.text}
            </p>
          </motion.button>
        );
      })}
      {onAddScene && (
        <Button
          data-ocid="scenes.secondary_button"
          variant="outline"
          size="sm"
          className="w-full mt-2 border-dashed text-muted-foreground hover:text-foreground gap-1.5 text-xs"
          onClick={onAddScene}
        >
          <Plus className="w-3 h-3" /> New Scene +
        </Button>
      )}
    </div>
  );
}
