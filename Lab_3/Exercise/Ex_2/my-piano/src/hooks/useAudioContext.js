import { useCallback, useEffect, useRef, useState } from "react";

const GESTURE_EVENTS = ["pointerdown", "keydown"];

export function useAudioContext() {
  const contextRef = useRef(null);
  const [audioState, setAudioState] = useState("idle");
  const getAudioContext = useCallback(() => contextRef.current, []);

  useEffect(() => {
    const handleStateChange = () => {
      if (contextRef.current) setAudioState(contextRef.current.state);
    };

    const removeGestureListeners = () => {
      GESTURE_EVENTS.forEach((type) =>
        window.removeEventListener(type, handleFirstGesture, true),
      );
    };

    function handleFirstGesture() {
      removeGestureListeners();
      if (contextRef.current) return;
      const context = new AudioContext();
      context.addEventListener("statechange", handleStateChange);
      contextRef.current = context;
      setAudioState(context.state);
      if (context.state === "suspended") context.resume();
    }

    GESTURE_EVENTS.forEach((type) =>
      window.addEventListener(type, handleFirstGesture, true),
    );

    return () => {
      removeGestureListeners();
      const context = contextRef.current;
      if (!context) return;
      context.removeEventListener("statechange", handleStateChange);
      contextRef.current = null;
      if (context.state !== "closed") context.close();
    };
  }, []);

  return { getAudioContext, audioState };
}
