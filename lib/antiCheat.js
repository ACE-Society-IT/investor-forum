/**
 * =====================================================================
 * INVESTOR FORUM: ANTI-CHEAT & INTEGRITY SHIELD
 * =====================================================================
 * Multi-layered defense to prevent AI assistance ("Ask Gemini", ChatGPT,
 * browser side-panel scraping, clipboard copy-pasting, and tab switching).
 */

/**
 * Initializes browser event listeners to lock down clipboard, right-click,
 * DevTools inspection shortcuts, and monitor window focus / tab visibility.
 */
export function initAntiCheatProtection({
  onFocusLost,
  onFocusRestored,
  onCopyAttempt,
  onContextMenuAttempt,
  onDevToolsAttempt
} = {}) {
  if (typeof window === "undefined") return () => {};

  // 1. Prevent Right-Click Context Menu (Stops browser "Ask Gemini", "Search Google", "Help me write")
  const handleContextMenu = (e) => {
    e.preventDefault();
    if (onContextMenuAttempt) onContextMenuAttempt();
    return false;
  };

  // 2. Prevent Copy / Cut Events
  const handleCopy = (e) => {
    e.preventDefault();
    if (e.clipboardData) {
      e.clipboardData.setData(
        "text/plain",
        "[INVESTOR FORUM ACADEMIC TOURNAMENT — AI PROMPT EXTRACTION PROHIBITED]"
      );
    }
    if (onCopyAttempt) onCopyAttempt();
    return false;
  };

  const handleCut = (e) => {
    e.preventDefault();
    return false;
  };

  // 3. Prevent Dragging Text out of the window into AI side panels
  const handleDragStart = (e) => {
    e.preventDefault();
    return false;
  };

  // 4. Prevent Common Inspection and Copy Key Combinations
  const handleKeyDown = (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    // F12 (DevTools)
    if (e.key === "F12" || e.keyCode === 123) {
      e.preventDefault();
      if (onDevToolsAttempt) onDevToolsAttempt();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Option+I (Inspect)
    if (ctrlOrCmd && e.shiftKey && (e.key === "I" || e.key === "i" || e.keyCode === 73)) {
      e.preventDefault();
      if (onDevToolsAttempt) onDevToolsAttempt();
      return false;
    }

    // Ctrl+Shift+J / Cmd+Option+J (Console)
    if (ctrlOrCmd && e.shiftKey && (e.key === "J" || e.key === "j" || e.keyCode === 74)) {
      e.preventDefault();
      if (onDevToolsAttempt) onDevToolsAttempt();
      return false;
    }

    // Ctrl+Shift+C (Inspect Element Picker)
    if (ctrlOrCmd && e.shiftKey && (e.key === "C" || e.key === "c" || e.keyCode === 67)) {
      e.preventDefault();
      if (onDevToolsAttempt) onDevToolsAttempt();
      return false;
    }

    // Ctrl+U / Cmd+U (View Source)
    if (ctrlOrCmd && (e.key === "U" || e.key === "u" || e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }

    // Ctrl+C / Cmd+C (Copy attempt)
    if (ctrlOrCmd && (e.key === "c" || e.key === "C" || e.keyCode === 67) && !e.shiftKey) {
      // Check if target is an editable input
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag !== "input" && tag !== "textarea") {
        e.preventDefault();
        if (onCopyAttempt) onCopyAttempt();
        return false;
      }
    }

    // Ctrl+A / Cmd+A (Select All on non-inputs)
    if (ctrlOrCmd && (e.key === "a" || e.key === "A" || e.keyCode === 65)) {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag !== "input" && tag !== "textarea") {
        e.preventDefault();
        return false;
      }
    }
  };

  // 5. Visibility Change (Tab Switching Detection)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (onFocusLost) onFocusLost("TAB_SWITCH");
    } else {
      if (onFocusRestored) onFocusRestored();
    }
  };

  // 6. Window Blur (Switching to another application or browser side panel)
  const handleWindowBlur = () => {
    if (onFocusLost) onFocusLost("WINDOW_BLUR");
  };

  const handleWindowFocus = () => {
    if (onFocusRestored) onFocusRestored();
  };

  // Attach listeners
  document.addEventListener("contextmenu", handleContextMenu, { capture: true });
  document.addEventListener("copy", handleCopy, { capture: true });
  document.addEventListener("cut", handleCut, { capture: true });
  document.addEventListener("dragstart", handleDragStart, { capture: true });
  window.addEventListener("keydown", handleKeyDown, { capture: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleWindowBlur);
  window.addEventListener("focus", handleWindowFocus);

  // Return cleanup function
  return () => {
    document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
    document.removeEventListener("copy", handleCopy, { capture: true });
    document.removeEventListener("cut", handleCut, { capture: true });
    document.removeEventListener("dragstart", handleDragStart, { capture: true });
    window.removeEventListener("keydown", handleKeyDown, { capture: true });
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleWindowBlur);
    window.removeEventListener("focus", handleWindowFocus);
  };
}

/**
 * Injects invisible zero-width unicode characters into strings.
 * If students attempt automated OCR or DOM scraping to feed into LLMs,
 * the zero-width disruption fragments the tokenizer embeddings.
 */
export function injectAntiAITextNoise(text) {
  if (!text || typeof text !== "string") return text;
  const zeroWidthChars = ["\u200B", "\u200C", "\u200D", "\uFEFF"];
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += text[i];
    // Intersperse every 4-6 characters with zero-width character
    if (i % 5 === 0 && text[i] !== " ") {
      result += zeroWidthChars[i % zeroWidthChars.length];
    }
  }
  return result;
}
