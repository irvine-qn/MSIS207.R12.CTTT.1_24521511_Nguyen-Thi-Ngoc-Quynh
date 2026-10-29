export function createAntiDriftTimer(
  durationMs: number,
  onTick: (remaining: number) => void,
): () => void {
  const targetTime = Date.now() + durationMs;
  let frameId = 0;

  const loop = () => {
    const remaining = Math.max(0, targetTime - Date.now());
    onTick(remaining);
    if (remaining > 0) {
      frameId = requestAnimationFrame(loop);
    }
  };

  frameId = requestAnimationFrame(loop);

  return () => cancelAnimationFrame(frameId);
}
