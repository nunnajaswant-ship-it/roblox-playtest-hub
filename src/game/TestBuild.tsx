import { useEffect, useRef, useState } from 'react';

type Variant = '0.5.0' | '0.5.1';

interface Props {
  variant: Variant;
}

const W = 960;
const H = 540;

/** Fixed coin lanes so a demo run is repeatable and the defect is easy to trigger. */
const COIN_SPOTS: [number, number][] = [
  [200, 270],
  [320, 270],
  [440, 270],
  [560, 270],
  [680, 270],
  [800, 270]
];

const VILLAIN_START: [number, number][] = [
  [180, 20],
  [380, 90],
  [580, 160],
  [780, 230]
];

interface Coin {
  x: number;
  y: number;
}

interface Villain {
  x: number;
  y: number;
  vy: number;
}

/**
 * The test build. Two variants of the same scene.
 *
 * 0.5.0 has exactly two planted defects, both requested for the demo:
 *   1. The score only goes up once for every TWO coins collected.
 *   2. Touching a villain does not kill the player.
 *
 * 0.5.1 is the same scene with both fixed: one coin is one point, and a villain
 * ends the run.
 */
export function TestBuild({ variant }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hud, setHud] = useState({ coins: 0, score: 0, time: 30, dead: false, running: false });

  const stateRef = useRef({
    player: { x: W / 2, y: H / 2 },
    coins: [] as Coin[],
    villains: [] as Villain[],
    coinsCollected: 0,
    score: 0,
    timeLeft: 30,
    dead: false,
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
    s.coins = COIN_SPOTS.map(([x, y]) => ({ x, y }));
    s.villains = VILLAIN_START.map(([x, y], i) => ({
      x,
      y,
      vy: 110 + i * 20
    }));
    s.coinsCollected = 0;
    s.score = 0;
    s.timeLeft = 30;
    s.dead = false;
    s.running = false;
    setHud({ coins: 0, score: 0, time: 30, dead: false, running: false });

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

      if (s.running && !s.dead) {
        s.timeLeft = Math.max(0, s.timeLeft - dt);

        const speed = 270;
        let dx = 0;
        let dy = 0;
        if (s.keys.has('arrowleft') || s.keys.has('a')) dx -= 1;
        if (s.keys.has('arrowright') || s.keys.has('d')) dx += 1;
        if (s.keys.has('arrowup') || s.keys.has('w')) dy -= 1;
        if (s.keys.has('arrowdown') || s.keys.has('s')) dy += 1;
        const len = Math.hypot(dx, dy) || 1;
        s.player.x = Math.max(14, Math.min(W - 14, s.player.x + (dx / len) * speed * dt));
        s.player.y = Math.max(14, Math.min(H - 14, s.player.y + (dy / len) * speed * dt));

        for (const coin of s.coins) {
          if (Math.hypot(coin.x - s.player.x, coin.y - s.player.y) < 20) {
            s.coinsCollected += 1;

            if (variant === '0.5.1') {
              // Fixed: one coin is one point.
              s.score += 1;
            } else if (s.coinsCollected % 2 === 0) {
              // Planted defect: only every second coin scores.
              s.score += 1;
            }

            coin.x = -999;
            coin.y = -999;
          }
        }

        for (const villain of s.villains) {
          villain.y += villain.vy * dt;
          if (villain.y > H + 20) {
            villain.y = -20;
            villain.x = 70 + Math.random() * (W - 140);
          }
          if (Math.hypot(villain.x - s.player.x, villain.y - s.player.y) < 25) {
            if (variant === '0.5.1') {
              // Fixed: a villain ends the run.
              s.dead = true;
              s.running = false;
            }
            // Planted defect: in 0.5.0, contact does nothing at all.
          }
        }

        if (s.timeLeft <= 0) {
          s.running = false;
        }

        setHud({
          coins: s.coinsCollected,
          score: s.score,
          time: Math.ceil(s.timeLeft),
          dead: s.dead,
          running: s.running
        });
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

      for (const coin of s.coins) {
        if (coin.x < 0) continue;
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const villain of s.villains) {
        ctx.fillStyle = '#ff4d6d';
        ctx.beginPath();
        ctx.moveTo(villain.x, villain.y - 13);
        ctx.lineTo(villain.x + 13, villain.y + 11);
        ctx.lineTo(villain.x - 13, villain.y + 11);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = s.dead ? '#4a5a72' : '#38e8ff';
      ctx.fillRect(s.player.x - 11, s.player.y - 11, 22, 22);

      if (s.dead) {
        ctx.fillStyle = 'rgba(8, 11, 17, 0.72)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ff4d6d';
        ctx.font = 'bold 46px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ELIMINATED', W / 2, H / 2);
        ctx.fillStyle = '#93a4bd';
        ctx.font = '16px system-ui, sans-serif';
        ctx.fillText('A villain touched you. Press Restart.', W / 2, H / 2 + 34);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, [variant]);

  const restart = () => {
    const s = stateRef.current;
    s.player = { x: W / 2, y: H / 2 };
    s.coins = COIN_SPOTS.map(([x, y]) => ({ x, y }));
    s.villains = VILLAIN_START.map(([x, y], i) => ({ x, y, vy: 110 + i * 20 }));
    s.coinsCollected = 0;
    s.score = 0;
    s.timeLeft = 30;
    s.dead = false;
    s.running = true;
    s.keys.clear();
    setHud({ coins: 0, score: 0, time: 30, dead: false, running: true });
  };

  return (
    <div className="stack">
      <div className="game-hud">
        <span className="hud-item">
          <span className="hud-label">Coins</span>
          <span className="hud-value" data-testid="coins">{hud.coins}</span>
        </span>
        <span className="hud-item">
          <span className="hud-label">Score</span>
          <span className="hud-value" data-testid="score">{hud.score}</span>
        </span>
        <span className="hud-item">
          <span className="hud-label">Time</span>
          <span className="hud-value">{hud.time}s</span>
        </span>
        <span className="hud-item hud-spacer" />
        <button type="button" className="btn btn-primary" onClick={restart}>
          {hud.running ? 'Restart' : hud.dead ? 'Restart' : 'Start run'}
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
          background: '#080b11',
          display: 'block'
        }}
        aria-label={`Test build ${variant}. Move with WASD or arrow keys. Collect gold coins, avoid red villains.`}
      />

      <p className="hint">
        WASD or arrow keys. Gold circles are coins. Red triangles are villains - touching one
        should end your run.
      </p>
    </div>
  );
}
