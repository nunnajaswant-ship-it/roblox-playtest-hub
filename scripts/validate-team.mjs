#!/usr/bin/env node
// Validates both teammate modules against docs/INTEGRATION.md.
// Run: npm run check:team
// Exit 0 = PASS, exit 1 = FAIL. No dependencies.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function ok(message) {
  notes.push(message);
}

function isNum(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function distToRect(px, py, x, y, w, h) {
  const cx = Math.min(Math.max(px, x), x + w);
  const cy = Math.min(Math.max(py, y), y + h);
  return Math.hypot(px - cx, py - cy);
}

// ---------------------------------------------------------------- levels ----

async function checkLevels() {
  const file = new URL('../team/abhiram/levels/index.js', import.meta.url);
  let mod;

  try {
    mod = await import(file.href);
  } catch (error) {
    fail(`levels: module failed to import - ${error.message}`);
    return;
  }

  if (mod.LEVEL_SCHEMA_VERSION !== 1) {
    fail(`levels: LEVEL_SCHEMA_VERSION must be 1, got ${mod.LEVEL_SCHEMA_VERSION}`);
  }

  if (!Array.isArray(mod.LEVELS) || mod.LEVELS.length === 0) {
    fail('levels: LEVELS must be a non-empty array');
    return;
  }

  const seenLevelIds = new Set();

  mod.LEVELS.forEach((level, index) => {
    const tag = `levels[${index}]${level && level.id ? ` (${level.id})` : ''}`;

    if (!level || typeof level !== 'object') {
      fail(`${tag}: must be an object`);
      return;
    }

    if (typeof level.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(level.id)) {
      fail(`${tag}: id must be kebab-case`);
    } else if (seenLevelIds.has(level.id)) {
      fail(`${tag}: duplicate id`);
    } else {
      seenLevelIds.add(level.id);
    }

    if (typeof level.name !== 'string' || level.name.trim() === '') {
      fail(`${tag}: name is required`);
    }

    if (!isNum(level.timeLimitMs) || level.timeLimitMs < 60000 || level.timeLimitMs > 180000) {
      fail(`${tag}: timeLimitMs must be 60000..180000`);
    }

    const world = level.world;
    if (!world || !isNum(world.width) || !isNum(world.height)) {
      fail(`${tag}: world.width and world.height are required`);
      return;
    }
    if (world.width < 960 || world.width > 4000) {
      fail(`${tag}: world.width must be 960..4000`);
    }
    if (world.height !== 540) {
      fail(`${tag}: world.height must be 540`);
    }

    const inBounds = (label, x, y, pad = 20) => {
      if (!isNum(x) || !isNum(y)) {
        fail(`${tag}: ${label} needs numeric x and y`);
        return false;
      }
      if (x < pad || x > world.width - pad || y < pad || y > world.height - pad) {
        fail(`${tag}: ${label} at (${x},${y}) is outside the ${pad}px world margin`);
        return false;
      }
      return true;
    };

    if (!level.spawn || !inBounds('spawn', level.spawn.x, level.spawn.y)) {
      fail(`${tag}: spawn is invalid`);
    }

    // anchors
    const anchors = Array.isArray(level.anchors) ? level.anchors : [];
    if (anchors.length < 6) {
      fail(`${tag}: needs at least 6 anchors, has ${anchors.length}`);
    }
    const anchorIds = new Set();
    anchors.forEach((anchor, i) => {
      const atag = `${tag}.anchors[${i}]`;
      if (!anchor || typeof anchor.id !== 'string') fail(`${atag}: id is required`);
      else if (anchorIds.has(anchor.id)) fail(`${atag}: duplicate id ${anchor.id}`);
      else anchorIds.add(anchor.id);

      inBounds(atag, anchor && anchor.x, anchor && anchor.y);

      if (!isNum(anchor.range) || anchor.range < 120 || anchor.range > 600) {
        fail(`${atag}: range must be 120..600`);
      }
    });

    // beacons
    const beacons = Array.isArray(level.beacons) ? level.beacons : [];
    if (beacons.length !== 5) {
      fail(`${tag}: needs exactly 5 beacons, has ${beacons.length}`);
    }
    const orders = beacons.map((b) => b && b.order).sort((a, b) => a - b);
    const ordersValid = orders.length === 5 && orders.every((value, i) => value === i + 1);
    if (!ordersValid) {
      fail(`${tag}: beacon order must be exactly 1,2,3,4,5`);
    }

    beacons.forEach((beacon, i) => {
      inBounds(`${tag}.beacons[${i}]`, beacon && beacon.x, beacon && beacon.y);
    });

    for (let i = 0; i < beacons.length; i += 1) {
      for (let j = i + 1; j < beacons.length; j += 1) {
        const a = beacons[i];
        const b = beacons[j];
        if (!a || !b) continue;
        const gap = Math.hypot(a.x - b.x, a.y - b.y);
        if (gap < 180) {
          fail(`${tag}: beacons ${a.id} and ${b.id} are only ${Math.round(gap)}px apart, need 180`);
        }
      }
    }

    const first = beacons.find((b) => b && b.order === 1);
    if (level.spawn && first) {
      const reach = Math.hypot(first.x - level.spawn.x, first.y - level.spawn.y);
      if (reach > 420) {
        fail(`${tag}: first beacon is ${Math.round(reach)}px from spawn, max 420 for one hook`);
      }
    }

    // hazards
    const hazards = Array.isArray(level.hazards) ? level.hazards : [];
    const types = new Set(['spike', 'saw', 'drone']);
    hazards.forEach((hazard, i) => {
      const htag = `${tag}.hazards[${i}]`;
      if (!hazard || !types.has(hazard.type)) {
        fail(`${htag}: type must be spike, saw, or drone`);
        return;
      }
      if (!isNum(hazard.w) || !isNum(hazard.h) || hazard.w <= 0 || hazard.h <= 0) {
        fail(`${htag}: w and h must be positive numbers`);
      }
      if (hazard.type === 'saw' || hazard.type === 'drone') {
        const maxSpeed = hazard.type === 'saw' ? 300 : 200;
        const minSpeed = hazard.type === 'saw' ? 40 : 30;
        if (!isNum(hazard.speed) || hazard.speed < minSpeed || hazard.speed > maxSpeed) {
          fail(`${htag}: speed must be ${minSpeed}..${maxSpeed}`);
        }
        if (!isNum(hazard.amplitude) || hazard.amplitude <= 0) {
          fail(`${htag}: amplitude must be a positive number`);
        }
      }

      // Travel extremes must stay inside the world.
      const spanX = hazard.type === 'saw' ? (hazard.amplitude || 0) : 0;
      const spanY = hazard.type === 'drone' ? (hazard.amplitude || 0) : 0;
      if (
        isNum(hazard.x) &&
        isNum(hazard.y) &&
        isNum(hazard.w) &&
        isNum(hazard.h) &&
        (hazard.x < 20 ||
          hazard.x + spanX + hazard.w > world.width - 20 ||
          hazard.y < 20 ||
          hazard.y + spanY + hazard.h > world.height - 20)
      ) {
        fail(`${htag}: travel path leaves the world margin`);
      }

      // Hazards must not sit on an anchor.
      if (isNum(hazard.x) && isNum(hazard.y) && isNum(hazard.w) && isNum(hazard.h)) {
        anchors.forEach((anchor) => {
          if (!anchor) return;
          const gap = distToRect(anchor.x, anchor.y, hazard.x, hazard.y, hazard.w, hazard.h);
          if (gap < 40) {
            fail(`${htag}: only ${Math.round(gap)}px from anchor ${anchor.id}, need 40`);
          }
        });
      }
    });

    ok(`${tag}: ${anchors.length} anchors, ${beacons.length} beacons, ${hazards.length} hazards`);
  });
}

// ------------------------------------------------------------ audio and fx --

const AUDIO_METHODS = [
  'unlock',
  'hookFire',
  'hookAttach',
  'beacon',
  'hurt',
  'collapseTick',
  'win',
  'lose',
  'uiConfirm',
  'uiCancel',
  'startMusic',
  'stopMusic',
  'setMuted',
  'isMuted',
  'dispose'
];

async function checkAudio() {
  const file = new URL('../team/abhitej/audio/index.js', import.meta.url);
  let mod;

  try {
    mod = await import(file.href);
  } catch (error) {
    fail(`audio: module failed to import - ${error.message}`);
    return;
  }

  if (typeof mod.createAudioKit !== 'function') {
    fail('audio: must export createAudioKit(options)');
    return;
  }

  let kit;
  try {
    kit = mod.createAudioKit({ volume: 0.5 });
  } catch (error) {
    fail(`audio: createAudioKit threw at import time - ${error.message}`);
    return;
  }

  if (!kit || typeof kit !== 'object') {
    fail('audio: createAudioKit must return an object');
    return;
  }

  const missing = AUDIO_METHODS.filter((name) => typeof kit[name] !== 'function');
  if (missing.length > 0) {
    fail(`audio: missing methods - ${missing.join(', ')}`);
  }

  // Every method must be safe before unlock().
  AUDIO_METHODS.forEach((name) => {
    if (typeof kit[name] !== 'function') return;
    try {
      if (name === 'collapseTick') kit[name](0.5);
      else if (name === 'setMuted') kit[name](false);
      else kit[name]();
    } catch (error) {
      fail(`audio: ${name}() threw before unlock - ${error.message}`);
    }
  });

  ok(`audio: ${AUDIO_METHODS.length} methods, safe before unlock`);
}

async function checkFx() {
  const file = new URL('../team/abhitej/fx/index.js', import.meta.url);
  let mod;

  try {
    mod = await import(file.href);
  } catch (error) {
    fail(`fx: module failed to import - ${error.message}`);
    return;
  }

  if (typeof mod.createFx !== 'function') {
    fail('fx: must export createFx(scene, options)');
  } else {
    ok('fx: createFx exported');
  }
}

// ------------------------------------------------------------- house rules --

const BINARY_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp3', '.wav', '.ogg', '.m4a', '.aseprite']);

function walk(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) found.push(...walk(full));
    else found.push(full);
  }
  return found;
}

function checkTeamFolder() {
  const teamDir = join(root, 'team');
  let files = [];

  try {
    files = walk(teamDir);
  } catch {
    fail('team: folder is missing');
    return;
  }

  const binaries = files.filter((f) => BINARY_EXT.has(extname(f).toLowerCase()));
  if (binaries.length > 0) {
    fail(`team: binary files are not allowed - ${binaries.map((f) => relative(root, f)).join(', ')}`);
  }

  const nonAscii = [];
  for (const file of files) {
    if (extname(file) !== '.js' && extname(file) !== '.md') continue;
    const text = readFileSync(file, 'utf8');
    for (const char of text) {
      if (char.charCodeAt(0) > 127) {
        nonAscii.push(relative(root, file));
        break;
      }
    }
  }
  if (nonAscii.length > 0) {
    fail(`team: non-ASCII characters in - ${nonAscii.join(', ')}`);
  }

  ok(`team: ${files.length} files, no binaries, ASCII clean`);
}

// -------------------------------------------------------------------- run ---

await checkLevels();
await checkAudio();
await checkFx();
checkTeamFolder();

for (const note of notes) {
  console.log(`  ok   ${note}`);
}

if (failures.length > 0) {
  console.log('');
  for (const problem of failures) {
    console.log(`  FAIL ${problem}`);
  }
  console.log(`\nRESULT: FAIL (${failures.length} problem${failures.length === 1 ? '' : 's'})`);
  process.exit(1);
}

console.log(`\nRESULT: PASS`);
process.exit(0);
