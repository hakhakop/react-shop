"use client";

import { useState, useEffect } from "react";

export function AntigravityTerminal() {
  const [logs, setLogs] = useState<string[]>([
    "[system] Initializing Antigravity agent environment...",
    "[system] Workspace verified at /projects/react-shop",
  ]);

  useEffect(() => {
    const mockLogs = [
      "[agent] Analyzing StorefrontBuilderRenderer.tsx...",
      "[agent] Found HeroSection component configuration.",
      "[agent] Injecting antigravity visual variant styles...",
      "[system] Hot-reloading active client components.",
      "[compiler] Compiling successfully in 0.8s.",
      "[agent:plan] Running production build check...",
      "[system] npm run build completed with code 0.",
      "[success] Deployment updated! Hero section variant is now active.",
      "[agent] Going idle. Waiting for user input..."
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < mockLogs.length) {
        const nextLog = mockLogs[currentIdx];
        setLogs(prev => [...prev, nextLog]);
        currentIdx++;
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="antigravity-mock-ide">
      <div className="ide-tabbar">
        <div className="ide-tab active">
          <span className="ide-tab-icon text-sky-400">⚛</span>
          <span>antigravity.tsx</span>
        </div>
        <div className="ide-tab">
          <span className="ide-tab-icon text-amber-500">⚡</span>
          <span>agent.log</span>
        </div>
      </div>
      <div className="ide-editor">
        <div className="ide-lines">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="ide-line-number">{i + 1}</div>
          ))}
        </div>
        <div className="ide-code">
          <span className="text-purple-400">const</span> <span className="text-blue-400">agent</span> = <span className="text-purple-400">new</span> <span className="text-emerald-400">Antigravity</span>();<br/>
          <span className="text-blue-400">agent</span>.<span className="text-yellow-400">optimizeStorefront</span>({`{`}<br/>
          &nbsp;&nbsp;<span className="text-sky-400">style</span>: <span className="text-orange-400">"futuristic"</span>,<br/>
          &nbsp;&nbsp;<span className="text-sky-400">layout</span>: <span className="text-orange-400">"antigravity"</span><br/>
          {`});`}<br/>
          <br/>
          <span className="text-neutral-500">// Execution logs:</span>
          <div className="ide-terminal">
            {logs.map((log, idx) => {
              if (!log || typeof log !== "string") return null;
              let color = "text-neutral-300";
              if (log.includes("[system]")) color = "text-sky-400/90";
              if (log.includes("[agent]")) color = "text-purple-400/90";
              if (log.includes("[compiler]")) color = "text-yellow-400/90";
              if (log.includes("[success]")) color = "text-emerald-400 font-bold";
              return (
                <div key={idx} className={`terminal-row ${color}`}>
                  {log}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default AntigravityTerminal;
