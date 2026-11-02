import { useEffect, useRef, useState } from 'react';

type Variant = '0.5.0' | '0.5.1';

interface Props {
  variant: Variant;
}

const W = 960;
const H = 540;

interface Core {
  x: number;
  y: number;
}

interface Hazard {
  x: number;
  y: number;
  vy: number;
}

/**
 * The test build. Two variants of the same scene:
 *   0.5.0 has three planted defects, deliberately.
 *   0.5.1 is the same scene after the agent team patched them.
 * Bugs in 0.5.0: score doubles, hazard collision skips frames, restart keeps score.
 */
export function TestBuild({ variant }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [hud, setHud] = useState({ score: 0, time: 30, hits: 0 });

  const stateRef = useRef({
    player: { x: W / 2, y: H / 2 },
    cores: [] as Core[],
    hazards: [] as Hazard[],
    score: 0,
    hits: 0,
    timeLeft: 30,
    frame: 0,
    running: false,
    keys: new Set<string>()
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    s.player = { x: W / 2, y: H / 2 };
    s.cores = Array.from({ length: 6 }, () => ({
      x: 60 + Math.random() * (W - 120),
      y: 60 + Math.random() * (H - 120)
    }));
    s.hazards = Array.from({ length: 4 }, (_, i) => ({
      x: 120 + i * 210,
      y: 40 + Math.random() * 80,
      vy: 90 + Math.random() * 60
    }));
    // 0.5.0 bug 3: restart does not reset the score.
    if (variant === '0.5.1') {
      s.score = 0;
      s.hits = 0;
    }
    s.timeLeft = 30;
    s.frame = 0;
    s.running = false;
    setRunning(false);
    setHud({ score: s.score, time: 30, hits: s.hits });

    const onKey = (event: KeyboardEvent, down: boolean) => {
      const key = event.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault();
        if (down) s.keys.add(key);
        else s.keys.delete(key);
      }
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (s.running) {
        s.frame += 1;
        s.timeLeft = Math.max(0, s.timeLeft - dt);

        const speed = 260;
        let dx = 0;
        let dy = 0;
        if (s.keys.has('arrowleft') || s.keys.has('a')) dx -= 1;
        if (s.keys.has('arrowright') || s.keys.has('d')) dx += 1;
        if (s.keys.has('arrowup') || s.keys.has('w')) dy -= 1;
        if (s.keys.has('arrowdown') || s.keys.has('s')) dy += 1;
        const len = Math.hypot(dx, dy) || 1;
        s.player.x = Math.max(14, Math.min(W - 14, s.player.x + (dx / len) * speed * dt));
        s.player.y = Math.max(14, Math.min(H - 14, s.player.y + (dy / len) * speed * dt));

        for (const core of s.cores) {
          if (Math.hypot(core.x - s.player.x, core.y - s.player.y) < 20) {
            // 0.5.0 bug 1: score doubles per pickup.
            s.score += variant === '0.5.0' ? 2 : 1;
            core.x = 60 + Math.random() * (W - 120);
            core.y = 60 + Math.random() * (H - 120);
          }
        }

        for (const hazard of s.hazards) {
          hazard.y += hazard.vy * dt;
          if (hazard.y > H + 20) {
            hazard.y = -20;
            hazard.x = 60 + Math.random() * (W - 120);
          }
          // 0.5.0 bug 2: collision is only checked on every third frame.
          const check = variant === '0.5.1' || s.frame % 3 === 0;
          if (check && Math.hypot(hazard.x - s.player.x, hazard.y - s.player.y) < 24) {
            s.hits += 1;
            hazard.y = -20;
            hazard.x = 60 + Math.random() * (W - 120);
          }
        }

        if (s.timeLeft <= 0) {
          s.running = false;
          setRunning(false);
        }

        setHud({ score: s.score, time: Math.ceil(s.timeLeft), hits: s.hits });
      }

      ctx.fillStyle = '#080b11';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = '#131a26';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      for (const core of s.cores) {
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(core.x, core.y, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const hazard of s.hazards) {
        ctx.fillStyle = '#ff4d6d';
        ctx.fillRect(hazard.x - 12, hazard.y - 12, 24, 24);
      }

      ctx.fillStyle = '#38e8ff';
      ctx.fillRect(s.player.x - 11, s.player.y - 11, 22, 22);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, [variant]);

  const start = () => {
    const s = stateRef.current;
    s.running = true;
    s.timeLeft = 30;
    setRunning(true);
  };

  return (
    <div className="stack">
      <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
        <span className="chip">build {variant}</span>
        <span className="chip">score {hud.score}</span>
        <span className="chip">time {hud.time}s</span>
        <span className="chip">hits {hud.hits}</span>
        <button type="button" className="btn btn-primary" onClick={start}>
          {running ? 'Running' : hud.time === 0 ? 'Play again' : 'Start run'}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          width: '100%',
          maxWidth: 960,
          aspectRatio: '16 / 9',
          borderRadius: 10,
          border: '1px solid var(--ink-600)',
          background: '#080b11'
        }}
        aria-label={`Test build ${variant}. Move with WASD or arrow keys. Collect gold cores, avoid red blocks.`}
      />

      <p className="hint">
        Move with WASD or the arrow keys. Collect gold cores. Avoid the red blocks.
        Watch the score, the hit counter, and what happens when you restart.
      </p>
    </div>
  );
}
