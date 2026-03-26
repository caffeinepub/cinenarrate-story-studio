import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Globe, Loader2, Lock, Play, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Mood } from "../backend";
import type { Story } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteStory,
  usePublicStories,
  useUserStories,
} from "../hooks/useQueries";
import { MOOD_CONFIG } from "../utils/storyUtils";

function StoryCard({
  story,
  index,
  onPlay,
  onDelete,
}: {
  story: Story;
  index: number;
  onPlay: () => void;
  onDelete?: () => void;
}) {
  const topMood = story.scenes.length > 0 ? story.scenes[0].mood : Mood.neutral;
  const config = MOOD_CONFIG[topMood];
  const date = new Date(
    Number(story.createdAt / BigInt(1_000_000)),
  ).toLocaleDateString();

  return (
    <motion.div
      data-ocid={`library.item.${index + 1}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/40 transition-all duration-200"
    >
      <div className="h-28 relative" style={{ background: config.gradient }}>
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <Button
            size="sm"
            className="gap-1.5"
            style={{
              background: "oklch(0.74 0.17 278)",
              color: "oklch(0.085 0.008 260)",
            }}
            onClick={onPlay}
          >
            <Play className="w-3 h-3" /> Play
          </Button>
        </div>
        <div className="absolute top-3 right-3">
          {story.isPublic ? (
            <Globe className="w-3 h-3 text-white/60" />
          ) : (
            <Lock className="w-3 h-3 text-white/40" />
          )}
        </div>
        <div className="absolute bottom-3 left-3">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: config.color, background: `${config.color}20` }}
          >
            {config.label}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold truncate mb-1">{story.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {story.scenes.length} scenes · {date}
          </span>
          {onDelete && (
            <Button
              data-ocid="library.delete_button"
              variant="ghost"
              size="icon"
              className="w-6 h-6 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function LibraryPage() {
  const { identity, login } = useInternetIdentity();
  const { data: userStories, isLoading: loadingUser } = useUserStories();
  const { data: publicStories, isLoading: loadingPublic } = usePublicStories();
  const deleteStory = useDeleteStory();

  const handleDelete = async (storyId: bigint) => {
    try {
      await deleteStory.mutateAsync(storyId);
      toast.success("Story deleted");
    } catch {
      toast.error("Failed to delete story");
    }
  };

  const handlePlay = (story: Story) => {
    toast(
      `Opening "${story.title}" — go to Create tab and paste the story content`,
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {identity ? (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">My Stories</h2>
            <Badge variant="secondary">{userStories?.length ?? 0}</Badge>
          </div>

          {loadingUser ? (
            <div
              data-ocid="library.loading_state"
              className="flex items-center gap-2 text-muted-foreground text-sm py-6"
            >
              <Loader2 className="w-4 h-4 animate-spin" /> Loading your
              stories...
            </div>
          ) : !userStories || userStories.length === 0 ? (
            <div
              data-ocid="library.empty_state"
              className="text-center py-12 border border-dashed border-border rounded-2xl"
            >
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No stories yet — create and save one from the Create tab
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userStories.map((story, i) => (
                <StoryCard
                  key={story.title + String(i)}
                  story={story}
                  index={i}
                  onPlay={() => handlePlay(story)}
                  onDelete={() => handleDelete(BigInt(i))}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="mb-10 border border-dashed border-border rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Login to save and view your personal story library
          </p>
          <Button
            data-ocid="library.primary_button"
            onClick={login}
            style={{
              background: "oklch(0.74 0.17 278)",
              color: "oklch(0.085 0.008 260)",
            }}
          >
            Login to View Library
          </Button>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Public Stories</h2>
          <Badge variant="secondary">{publicStories?.length ?? 0}</Badge>
        </div>
        {loadingPublic ? (
          <div
            data-ocid="public.loading_state"
            className="flex items-center gap-2 text-muted-foreground text-sm py-6"
          >
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : !publicStories || publicStories.length === 0 ? (
          <div
            data-ocid="public.empty_state"
            className="text-center py-8 border border-dashed border-border rounded-2xl"
          >
            <p className="text-sm text-muted-foreground">
              No public stories yet — be the first to share one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {publicStories.map((story, i) => (
              <StoryCard
                key={story.title + String(i)}
                story={story}
                index={i}
                onPlay={() => handlePlay(story)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
