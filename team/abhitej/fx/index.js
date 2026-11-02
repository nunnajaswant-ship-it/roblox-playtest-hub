// Owner: Abhitej
// Screen effects and camera work. Budgets come from the game-juice skill.
// Contract: docs/INTEGRATION.md, section "Abhitej". Validate: npm run check:team

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createFx(scene, options = {}) {
  const reduced = Boolean(options.reducedMotion);

  let lastShake = -Infinity;
  let lastImpact = -Infinity;
  let hitStopTimer = null;
  let pulse = null;

  const owned = new Set();

  function own(obj) {
    owned.add(obj);
    return obj;
  }

  function destroyOwned() {
    for (const obj of owned) {
      if (obj && typeof obj.destroy === 'function' && obj.active !== false) {
        obj.destroy();
      }
    }
    owned.clear();
  }

  return {
    /**
     * A hit landed. Ring plus a few shards. Never more than 20 objects.
     */
    impact(x, y, { strength = 1 } = {}) {
      const now = Date.now();
      if (now - lastImpact < 40) return;
      lastImpact = now;

      const power = clamp(strength, 0.2, 1.5);
      const count = reduced ? 3 : Math.round(clamp(6 + power * 10, 6, 20));

      const ring = own(
        scene.add
          .circle(x, y, 8, 0xffffff, 0)
          .setStrokeStyle(2, 0x38e8ff, 1)
          .setDepth(30)
      );

      scene.tweens.add({
        targets: ring,
        scale: 2.2 + power,
        alpha: 0,
        duration: 240,
        ease: 'Quad.easeOut',
        onComplete: () => {
          owned.delete(ring);
          ring.destroy();
        }
      });

      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const distance = 24 + Math.random() * 40 * power;
        const shard = own(scene.add.rectangle(x, y, 3, 3, 0xffd166, 1).setDepth(29));

        scene.tweens.add({
          targets: shard,
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          alpha: 0,
          scale: 0.4,
          duration: 260 + Math.random() * 120,
          ease: 'Quad.easeOut',
          onComplete: () => {
            owned.delete(shard);
            shard.destroy();
          }
        });
      }
    },

    /**
     * Gameplay camera only. 2..8px, 80..200ms, at most once per 100ms.
     */
    shake(intensity = 1) {
      if (reduced) return;

      const now = Date.now();
      if (now - lastShake < 100) return;
      lastShake = now;

      const power = clamp(intensity, 0, 1);
      const amplitude = 2 + power * 6;
      const duration = 80 + power * 120;
      const camera = scene.cameras.main;

      camera.shake(duration, amplitude / Math.max(1, camera.width), true);
    },

    /**
     * Freeze the world for a beat. Clamped to the juice budget.
     */
    hitStop(ms = 60) {
      const duration = clamp(ms, 40, 80);
      if (hitStopTimer) return;

      const world = scene.physics && scene.physics.world;
      if (!world) return;

      world.pause();
      hitStopTimer = setTimeout(() => {
        hitStopTimer = null;
        if (world) world.resume();
      }, reduced ? Math.round(duration / 2) : duration);
    },

    /**
     * A beacon was planted. Two rings, gold.
     */
    beaconBurst(x, y) {
      const rings = reduced ? 1 : 2;

      for (let i = 0; i < rings; i += 1) {
        const ring = own(
          scene.add
            .circle(x, y, 10, 0xffffff, 0)
            .setStrokeStyle(3, 0xffd166, 1)
            .setDepth(31)
        );

        scene.tweens.add({
          targets: ring,
          scale: 3 + i,
          alpha: 0,
          delay: i * 90,
          duration: 420,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            owned.delete(ring);
            ring.destroy();
          }
        });
      }
    },

    /**
     * The collapse wall got closer. A short red pulse on the left edge.
     */
    collapsePulse() {
      if (pulse) return;

      const camera = scene.cameras.main;
      pulse = own(
        scene.add
          .rectangle(0, 0, 18, camera.height, 0xff5c7a, 0.35)
          .setOrigin(0, 0)
          .setDepth(40)
          .setScrollFactor(0)
      );

      scene.tweens.add({
        targets: pulse,
        alpha: 0,
        duration: reduced ? 120 : 260,
        ease: 'Quad.easeOut',
        onComplete: () => {
          const done = pulse;
          pulse = null;
          owned.delete(done);
          if (done) done.destroy();
        }
      });
    },

    dispose() {
      if (hitStopTimer) {
        clearTimeout(hitStopTimer);
        hitStopTimer = null;
      }
      destroyOwned();
      pulse = null;
    }
  };
}
