import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StoryStyle } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useUserStories() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["user-stories", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserStories(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function usePublicStories() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["public-stories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPublicStories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      style,
    }: { title: string; content: string; style: StoryStyle }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createStory(title, content, style);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-stories"] });
    },
  });
}

export function useDeleteStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (storyId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteStory(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-stories"] });
    },
  });
}
