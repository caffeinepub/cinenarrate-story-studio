import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Scene {
    duration: bigint;
    mood: Mood;
    text: string;
}
export interface StoryStyle {
    ambientMusic: string;
    colorPalette: string;
}
export interface UserProfile {
    name: string;
}
export interface Story {
    title: string;
    content: string;
    owner: Principal;
    scenes: Array<Scene>;
    createdAt: bigint;
    style: StoryStyle;
    isPublic: boolean;
}
export enum Mood {
    sad = "sad",
    action = "action",
    happy = "happy",
    romantic = "romantic",
    suspense = "suspense",
    mystery = "mystery",
    dramatic = "dramatic",
    neutral = "neutral"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createStory(title: string, content: string, style: StoryStyle): Promise<bigint>;
    deleteStory(storyId: bigint): Promise<void>;
    getAllPublicStories(): Promise<Array<Story>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getStory(storyId: bigint): Promise<Story | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStories(user: Principal): Promise<Array<Story>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleStoryVisibility(storyId: bigint): Promise<boolean>;
    updateStory(storyId: bigint, title: string, content: string, style: StoryStyle, isPublic: boolean): Promise<void>;
}
