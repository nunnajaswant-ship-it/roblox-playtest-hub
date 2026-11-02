// Owner: Abhiram
// Level data for Pixel Rush: Survey Corps.
// Contract: docs/INTEGRATION.md, section "Abhiram".
// Validate with: npm run check:team
//
// This seed level is intentionally plain. It exists so the validator is green
// from day one and so the shape is obvious. Your job is to make S1..S5 actually
// teach, test, and twist. See docs/level-table.md.

export const LEVEL_SCHEMA_VERSION = 1;

export const LEVELS = [
  {
    id: 'survey-01',
    name: 'Breaking Ground',
    timeLimitMs: 90000,
    world: { width: 1920, height: 540 },
    spawn: { x: 80, y: 270 },

    // Anchors are what the hook grabs. Range is how far the line can reach.
    // S1 must have two anchors the player cannot miss.
    anchors: [
      { id: 'a1', x: 300, y: 150, range: 260 },
      { id: 'a2', x: 560, y: 320, range: 300 },
      { id: 'a3', x: 860, y: 120, range: 280 },
      { id: 'a4', x: 1180, y: 260, range: 320 },
      { id: 'a5', x: 1460, y: 380, range: 300 },
      { id: 'a6', x: 1700, y: 160, range: 300 },
      { id: 'a7', x: 1880, y: 420, range: 260 }
    ],

    // Five beacons, in order. This is the win condition.
    beacons: [
      { id: 'b1', x: 420, y: 270, order: 1 },
      { id: 'b2', x: 760, y: 180, order: 2 },
      { id: 'b3', x: 1080, y: 380, order: 3 },
      { id: 'b4', x: 1420, y: 200, order: 4 },
      { id: 'b5', x: 1780, y: 300, order: 5 }
    ],

    // Hazards must never sit within 40px of an anchor, and must be visible
    // before they can hit. spike = static, saw = horizontal, drone = vertical.
    hazards: [
      { id: 'h1', type: 'spike', x: 620, y: 450, w: 60, h: 70 },
      { id: 'h2', type: 'spike', x: 980, y: 450, w: 80, h: 70 },
      { id: 'h3', type: 'saw', x: 1240, y: 200, w: 40, h: 40, speed: 90, amplitude: 220 },
      { id: 'h4', type: 'drone', x: 1600, y: 300, w: 40, h: 40, speed: 60, amplitude: 120 }
    ]
  }
];
