"use client";

import { useEffect, useState } from "react";
import { createAntiDriftTimer } from "@/engine/antiDriftTimer";

interface HoldCountdownProps {
  /** Epoch milliseconds */
  expiresAt: number;
}

export default function HoldCountdown({ expiresAt }: HoldCountdownProps) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, expiresAt - Date.now()),
  );

  useEffect(
    () =>
      createAntiDriftTimer(Math.max(0, expiresAt - Date.now()), setRemaining),
    [expiresAt],
  );

  return (
    <span className="font-mono tabular-nums">
      {(remaining / 1000).toFixed(1)}s
    </span>
  );
}
