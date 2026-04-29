"use client";

import { useRef } from "react";

interface GameIframeProps {
  html: string;
  title?: string;
}

export default function GameIframe({ html, title = "QuestForge Game" }: GameIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const blob = new Blob([html], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);

  return (
    <div className="w-full h-full min-h-[600px] rounded-xl overflow-hidden border border-stone-200 shadow-sm">
      <iframe
        ref={iframeRef}
        src={blobUrl}
        title={title}
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full min-h-[600px]"
        style={{ border: "none" }}
      />
    </div>
  );
}
