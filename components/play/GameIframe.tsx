"use client";

import { useEffect, useRef } from "react";

interface GameIframeProps {
  html: string;
  title?: string;
}

export default function GameIframe({ html, title = "QuestForge Game" }: GameIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    if (iframeRef.current) {
      iframeRef.current.src = url;
    }

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [html]);

  return (
    <div className="w-full h-full min-h-[600px] rounded-xl overflow-hidden border border-stone-200 shadow-sm">
      <iframe
        ref={iframeRef}
        title={title}
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full min-h-[600px]"
        style={{ border: "none" }}
      />
    </div>
  );
}
