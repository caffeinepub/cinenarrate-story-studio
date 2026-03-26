import { STYLE_PRESETS } from "../utils/storyUtils";

interface StyleSettingsProps {
  activeStyle: string;
  onStyleChange: (style: string) => void;
}

export function StyleSettings({
  activeStyle,
  onStyleChange,
}: StyleSettingsProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Style Settings
      </h3>
      <div className="flex flex-wrap gap-2">
        {STYLE_PRESETS.map((preset) => {
          const isActive = activeStyle === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              data-ocid="style.toggle"
              onClick={() => onStyleChange(preset.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                isActive
                  ? "border-primary/80 text-primary bg-primary/15"
                  : "border-border text-muted-foreground bg-muted/20 hover:border-border/70 hover:text-foreground"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
