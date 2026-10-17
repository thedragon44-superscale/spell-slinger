import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

export function App() {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (appRef.current) return;

    // 1. Initialize PixiJS Application
    const app = new PIXI.Application();
    
    app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      background: '#0b0e14',
      resizeTo: window,
    }).then(() => {
      if (canvasContainerRef.current && !canvasContainerRef.current.hasChildNodes()) {
        canvasContainerRef.current.appendChild(app.canvas);
        appRef.current = app;

        // Draw test wizard circle
        const wizard = new PIXI.Graphics();
        wizard.circle(0, 0, 20);
        wizard.fill(0x38bdf8);
        wizard.x = window.innerWidth / 2;
        wizard.y = window.innerHeight / 2;
        app.stage.addChild(wizard);
      }
    }).catch(err => console.error("PixiJS Init Error:", err));

    // 2. Robust WebSocket Connection with Auto-Reconnect
    let isCancelled = false;

    const connectWebSocket = () => {
      if (isCancelled) return;

      const ws = new WebSocket('ws://localhost:8080/ws');
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 Connected to Spell Slinger Server!');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          console.log(`📦 Received binary frame: ${event.data.byteLength} bytes`);
        }
      };

      ws.onclose = () => {
        console.log('❌ Disconnected from server. Reconnecting in 2s...');
        setIsConnected(false);
        if (!isCancelled) {
          setTimeout(connectWebSocket, 2000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      isCancelled = true;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0b0e14] font-mono select-none">
      <div className="absolute top-4 left-4 z-10 bg-[#0f1115]/90 border border-slate-800 p-3 rounded-xl text-slate-100 shadow-xl">
        <h1 className="text-xs font-black text-cyan-400 uppercase tracking-widest">Spell Slinger Arena</h1>
        <p className="text-[10px] text-slate-400">
          Server Status:{' '}
          <span className={isConnected ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
            {isConnected ? 'ONLINE (Connected)' : 'RECONNECTING...'}
          </span>
        </p>
      </div>

      <div ref={canvasContainerRef} className="w-full h-full" />
    </div>
  );
}

export default App;
