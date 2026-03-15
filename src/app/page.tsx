"use client";

import { useState } from "react";
import ViewerControls from "@/components/ui/ViewerControls";

export default function Home() {
  const [page, setPage] = useState(1);
  const [muted, setMuted] = useState(false);
  const totalPages = 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
      <main className="flex flex-col items-center max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Portfolio 2026</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-20 text-center">
          Test out the Figma interactions we just built!<br/>
          (Click the theme toggle on the bottom right or try the viewer controls below)
        </p>
        
        {/* Demonstrate the Viewer Controls */}
        <div className="fixed bottom-6 right-6 z-40">
          <ViewerControls 
            currentPage={page}
            totalPages={totalPages}
            onFirst={() => setPage(1)}
            onPrev={() => setPage(Math.max(1, page - 1))}
            onNext={() => setPage(Math.min(totalPages, page + 1))}
            onLast={() => setPage(totalPages)}
            onToggleVolume={() => setMuted(!muted)}
            isMuted={muted}
            onDownload={() => alert("Downloading portfolio...")}
          />
        </div>
      </main>
    </div>
  );
}
