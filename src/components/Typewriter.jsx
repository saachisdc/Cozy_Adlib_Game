// Typewriter.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";

const IMG_TOKEN_RE = /\[\[IMG:([a-zA-Z0-9_-]+):(left|right)\]\]/g;

function renderWithImages(text, imageMap) {
  const parts = [];
  let lastIdx = 0;
  let match;

  while ((match = IMG_TOKEN_RE.exec(text)) !== null) {
    const [token, id, align] = match;
    const start = match.index;

    // text before token
    if (start > lastIdx) {
      parts.push(text.slice(lastIdx, start));
    }

    const img = imageMap?.[id];
    if (img) {
      parts.push(
        <span key={`${id}-${start}`} className="choice-wrap">
          <span className={`choice-circle choice-circle--${align}`}>
            <img
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              loading={img.loading || "lazy"}
            />
          </span>
        </span>
      );
    } else {
      // if missing, just render token as text so you can debug
      //parts.push(token);
    }

    lastIdx = start + token.length;
  }

  // remaining tail text
  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  return parts;
}

export default function Typewriter({
  text = "",
  speed = 30,
  paused = false,
  onDone,
  className = "",
  resetSignal = 0,
  // prefix = null,
  imageMap = {},
}) {
  const [visible, setVisible] = useState("");
  const lastLenRef = useRef(0);
  const doneCalledRef = useRef(false);

  // Hard reset (restart / story swap)
  useEffect(() => {
    setVisible("");
    lastLenRef.current = 0;
    doneCalledRef.current = false;
  }, [resetSignal]);

  useEffect(() => {
    if (paused) return;

    // If the target text got shorter somehow, snap (rare, but safe)
    if (text.length < lastLenRef.current) {
      setVisible(text);
      lastLenRef.current = text.length;
      doneCalledRef.current = false;
      return;
    }

    // If we're already caught up, optionally call onDone (once per new target)
    if (lastLenRef.current >= text.length) {
      if (!doneCalledRef.current && onDone) {
        doneCalledRef.current = true;
        onDone();
      }
      return;
    }

    doneCalledRef.current = false;

    const id = setInterval(() => {
      setVisible((prev) => {
        const nextLen = Math.min(prev.length + 1, text.length);
        lastLenRef.current = nextLen;
        const next = text.slice(0, nextLen);

        // If we've reached the full length, ensure onDone is called once.
        if (nextLen >= text.length && onDone && !doneCalledRef.current) {
          doneCalledRef.current = true;
          // call onDone asynchronously to avoid re-entrancy inside state update
          setTimeout(() => onDone(), 0);
        }

        return next;
      });
    }, Math.max(1, speed));

    return () => clearInterval(id);
  }, [text, speed, paused, onDone]);

  const rendered = useMemo(
    () => renderWithImages(visible, imageMap),
    [visible, imageMap]
  );

  return (
    <div className={`story ${className}`}>
      {rendered}
      <span className="caret" aria-hidden="true" />
    </div>
  );
}
