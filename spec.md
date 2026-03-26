# CineNarrate - Story Studio

## Current State
The `recordScenesToVideo` function in `StoryPlayer.tsx` renders a basic canvas with just text + gradient background. It does NOT include: particle animations, character silhouettes, vignette, letterbox bars, mood glow, or any of the visual effects visible in the live player.

## Requested Changes (Diff)

### Add
- Full particle system rendered during video recording (same logic as MoodCanvas)
- Character silhouettes drawn as SVG paths directly onto recording canvas
- Vignette overlay, letterbox bars, mood glow radial gradient in video frames
- Film grain noise texture overlay per frame
- Scene transition flash effect between scenes in video
- Progress toast showing scene X/N during recording

### Modify
- `recordScenesToVideo` function: rewrite to render all visual layers (bg, particles, characters, overlays, text) matching the live player appearance
- Scene duration in video: 6 seconds per scene (up from 5s) to allow typewriter text to complete
- Download button: show "Recording scene X/N..." progress feedback

### Remove
- Nothing removed

## Implementation Plan
1. Extract particle spawn/draw/update logic so it can be called from both `MoodCanvas` (live) and `recordScenesToVideo` (offscreen)
2. Add character silhouette draw functions that render SVG shapes onto a 2D canvas context
3. Rewrite `recordScenesToVideo` to: init particles per scene, run animation loop drawing all layers, advance scenes after 6s each
4. Add per-scene progress toast ("Recording scene 2/5...")
5. Validate and build
