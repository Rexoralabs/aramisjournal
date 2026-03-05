import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ShortcutCallbacks {
  onCommandPalette?: () => void;
}

export function useKeyboardShortcuts({ onCommandPalette }: ShortcutCallbacks = {}) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      switch (e.key.toLowerCase()) {
        case "k":
          e.preventDefault();
          onCommandPalette?.();
          break;
        case "n":
          e.preventDefault();
          navigate("/compose");
          break;
        case "j":
          e.preventDefault();
          navigate("/");
          break;
        case ",":
          e.preventDefault();
          navigate("/settings");
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, onCommandPalette]);
}