import type { Build, Database, HistoryEntry, Member, Report } from '../domain/types';

const AT = (iso: string): string => iso;

const BUILDS: Build[] = [
  {
    id: 'b-050',
    version: 'v0.5.0',
    name: 'Obby Rework',
    releasedAt: AT('2026-11-01T18:00:00.000Z'),
    isLive: true,
    notes: 'Stages 1-5 rebuilt, new checkpoints, shop prices adjusted.'
  },
  {
    id: 'b-042',
    version: 'v0.4.2',
    name: 'Shop Patch',
    releasedAt: AT('2026-10-24T16:30:00.000Z'),
    isLive: false,
    notes: 'Checkout rewrite and item thumbnails.'
  },
  {
    id: 'b-041',
    version: 'v0.4.1',
    name: 'Mobile Controls',
    releasedAt: AT('2026-10-17T12:00:00.000Z'),
    isLive: false,
    notes: 'Touch HUD, joystick, and jump button layout.'
  }
];

const MEMBERS: Member[] = [
  { id: 'm-abhiram', name: 'Abhiram', role: 'Lead scripter', initials: 'AB', tint: '--member-1' },
  { id: 'm-abhitej', name: 'Abhitej', role: 'UI and art', initials: 'AT', tint: '--member-2' },
  { id: 'm-nunna', name: 'Nunna', role: 'Producer', initials: 'NU', tint: '--member-3' }
];

function entry(
  id: string,
  at: string,
  kind: HistoryEntry['kind'],
  by: string,
  text: string
): HistoryEntry {
  return { id, at, kind, by, text };
}

const REPORTS: Report[] = [
  {
    id: 'r-101',
    ref: 'PH-101',
    title: 'Shop purchase deducts Robux but grants no item',
    buildId: 'b-050',
    area: 'Checkout',
    category: 'shop',
    severity: 'blocker',
    status: 'in_progress',
    platform: 'pc',
    frequency: 'often',
    expected: 'Purchasing the Speed Coil removes 75 Robux and the item appears in inventory immediately.',
    actual: 'Robux are deducted, the confirmation toast appears, and the inventory stays empty after a rejoin.',
    steps: [
      'Join the experience on the current build',
      'Open the shop and select Speed Coil',
      'Confirm the purchase',
      'Check inventory, then rejoin and check again'
    ],
    screenshotUrl: 'https://example.com/reports/ph-101-checkout.png',
    reporter: 'Nunna',
    assigneeId: 'm-abhiram',
    duplicateOf: null,
    createdAt: AT('2026-11-01T19:12:00.000Z'),
    updatedAt: AT('2026-11-02T08:40:00.000Z'),
    history: [
      entry('h-101-1', AT('2026-11-01T19:12:00.000Z'), 'created', 'Nunna', 'Report filed.'),
      entry('h-101-2', AT('2026-11-01T19:30:00.000Z'), 'status', 'Nunna', 'Moved to Triaged.'),
      entry('h-101-3', AT('2026-11-01T19:41:00.000Z'), 'assignee', 'Nunna', 'Assigned to Abhiram.'),
      entry('h-101-4', AT('2026-11-02T08:40:00.000Z'), 'status', 'Abhiram', 'Moved to In progress.')
    ]
  },
  {
    id: 'r-102',
    ref: 'PH-102',
    title: 'Stage 4 checkpoint does not save progress',
    buildId: 'b-050',
    area: 'Stage 4',
    category: 'obby',
    severity: 'high',
    status: 'new',
    platform: 'mobile',
    frequency: 'always',
    expected: 'Touching the checkpoint at the top of stage 4 respawns me there after a fall.',
    actual: 'I respawn at the stage 1 start every time and have to replay the whole run.',
    steps: [
      'Reach stage 4 on mobile',
      'Touch the checkpoint pad',
      'Fall off the next platform',
      'Observe respawn location'
    ],
    screenshotUrl: '',
    reporter: 'Nunna',
    assigneeId: null,
    duplicateOf: null,
    createdAt: AT('2026-11-01T20:05:00.000Z'),
    updatedAt: AT('2026-11-01T20:05:00.000Z'),
    history: [entry('h-102-1', AT('2026-11-01T20:05:00.000Z'), 'created', 'Nunna', 'Report filed.')]
  },
  {
    id: 'r-103',
    ref: 'PH-103',
    title: 'Mobile jump button overlaps the joystick',
    buildId: 'b-041',
    area: 'HUD',
    category: 'ui',
    severity: 'medium',
    status: 'triaged',
    platform: 'mobile',
    frequency: 'always',
    expected: 'Jump sits clear of the movement joystick on a 6 inch phone.',
    actual: 'The jump button covers the right edge of the joystick, so diagonal movement jumps by accident.',
    steps: ['Open on a phone', 'Try to move diagonally right', 'Observe an accidental jump'],
    screenshotUrl: 'https://example.com/reports/ph-103-hud.jpg',
    reporter: 'Abhitej',
    assigneeId: 'm-abhitej',
    duplicateOf: null,
    createdAt: AT('2026-10-30T14:22:00.000Z'),
    updatedAt: AT('2026-10-31T09:10:00.000Z'),
    history: [
      entry('h-103-1', AT('2026-10-30T14:22:00.000Z'), 'created', 'Abhitej', 'Report filed.'),
      entry('h-103-2', AT('2026-10-31T09:10:00.000Z'), 'status', 'Nunna', 'Moved to Triaged.')
    ]
  },
  {
    id: 'r-104',
    ref: 'PH-104',
    title: 'Killbrick on stage 2 launches the player out of the map',
    buildId: 'b-050',
    area: 'Stage 2',
    category: 'obby',
    severity: 'high',
    status: 'fixed',
    platform: 'pc',
    frequency: 'often',
    expected: 'Touching the killbrick respawns the player at the last checkpoint.',
    actual: 'The player is thrown upward at high speed and falls out of the world, then respawns at stage 1.',
    steps: ['Reach stage 2', 'Walk into the red killbrick', 'Observe the launch'],
    screenshotUrl: '',
    reporter: 'Abhiram',
    assigneeId: 'm-abhiram',
    duplicateOf: null,
    createdAt: AT('2026-10-29T11:00:00.000Z'),
    updatedAt: AT('2026-11-01T17:00:00.000Z'),
    history: [
      entry('h-104-1', AT('2026-10-29T11:00:00.000Z'), 'created', 'Abhiram', 'Report filed.'),
      entry('h-104-2', AT('2026-10-29T13:20:00.000Z'), 'status', 'Nunna', 'Moved to Triaged.'),
      entry('h-104-3', AT('2026-10-30T10:00:00.000Z'), 'status', 'Abhiram', 'Moved to In progress.'),
      entry('h-104-4', AT('2026-11-01T17:00:00.000Z'), 'status', 'Abhiram', 'Moved to Fixed.')
    ]
  },
  {
    id: 'r-105',
    ref: 'PH-105',
    title: 'Shop preview thumbnails flash white when the shop opens',
    buildId: 'b-042',
    area: 'Shop',
    category: 'ui',
    severity: 'low',
    status: 'verified',
    platform: 'pc',
    frequency: 'sometimes',
    expected: 'Thumbnails fade in from the panel colour.',
    actual: 'A single white frame appears before each thumbnail loads.',
    steps: ['Open the shop', 'Watch the item grid on first open'],
    screenshotUrl: '',
    reporter: 'Abhitej',
    assigneeId: 'm-abhitej',
    duplicateOf: null,
    createdAt: AT('2026-10-25T09:40:00.000Z'),
    updatedAt: AT('2026-10-27T15:00:00.000Z'),
    history: [
      entry('h-105-1', AT('2026-10-25T09:40:00.000Z'), 'created', 'Abhitej', 'Report filed.'),
      entry('h-105-2', AT('2026-10-26T10:00:00.000Z'), 'status', 'Abhitej', 'Moved to Fixed.'),
      entry('h-105-3', AT('2026-10-27T15:00:00.000Z'), 'status', 'Nunna', 'Moved to Verified.')
    ]
  },
  {
    id: 'r-106',
    ref: 'PH-106',
    title: 'Leaderboard shows yesterday scores after a new day starts',
    buildId: 'b-050',
    area: 'Leaderboard',
    category: 'data',
    severity: 'medium',
    status: 'new',
    platform: 'console',
    frequency: 'sometimes',
    expected: 'The daily leaderboard resets at 00:00 UTC.',
    actual: 'Yesterday scores are still listed until the server is rejoined twice.',
    steps: ['Play on console', 'Return after midnight UTC', 'Open the leaderboard'],
    screenshotUrl: '',
    reporter: 'Abhiram',
    assigneeId: null,
    duplicateOf: null,
    createdAt: AT('2026-11-02T06:15:00.000Z'),
    updatedAt: AT('2026-11-02T06:15:00.000Z'),
    history: [entry('h-106-1', AT('2026-11-02T06:15:00.000Z'), 'created', 'Abhiram', 'Report filed.')]
  },
  {
    id: 'r-107',
    ref: 'PH-107',
    title: 'Stage 1 spawn pad places the player inside the wall',
    buildId: 'b-050',
    area: 'Stage 1',
    category: 'obby',
    severity: 'high',
    status: 'verified',
    platform: 'pc',
    frequency: 'always',
    expected: 'The player spawns on the pad, facing the first platform.',
    actual: 'The player spawns half inside the wall and has to jump out before moving.',
    steps: ['Join the experience', 'Observe the spawn position on stage 1'],
    screenshotUrl: '',
    reporter: 'Nunna',
    assigneeId: 'm-abhiram',
    duplicateOf: null,
    createdAt: AT('2026-10-31T08:00:00.000Z'),
    updatedAt: AT('2026-11-01T18:20:00.000Z'),
    history: [
      entry('h-107-1', AT('2026-10-31T08:00:00.000Z'), 'created', 'Nunna', 'Report filed.'),
      entry('h-107-2', AT('2026-10-31T09:00:00.000Z'), 'status', 'Abhiram', 'Moved to Fixed.'),
      entry('h-107-3', AT('2026-11-01T18:20:00.000Z'), 'status', 'Nunna', 'Moved to Verified.')
    ]
  },
  {
    id: 'r-108',
    ref: 'PH-108',
    title: 'Shop grid cuts off the last row on small screens',
    buildId: 'b-050',
    area: 'Shop',
    category: 'ui',
    severity: 'low',
    status: 'verified',
    platform: 'mobile',
    frequency: 'always',
    expected: 'The grid scrolls to show every item.',
    actual: 'The last row is clipped and cannot be scrolled into view.',
    steps: ['Open the shop on a small phone', 'Scroll to the bottom of the grid'],
    screenshotUrl: '',
    reporter: 'Abhitej',
    assigneeId: 'm-abhitej',
    duplicateOf: null,
    createdAt: AT('2026-10-30T10:00:00.000Z'),
    updatedAt: AT('2026-11-01T19:00:00.000Z'),
    history: [
      entry('h-108-1', AT('2026-10-30T10:00:00.000Z'), 'created', 'Abhitej', 'Report filed.'),
      entry('h-108-2', AT('2026-11-01T19:00:00.000Z'), 'status', 'Nunna', 'Moved to Verified.')
    ]
  }
];

export function seedDatabase(): Database {
  return {
    schemaVersion: 1,
    builds: BUILDS.map((build) => ({ ...build })),
    members: MEMBERS.map((member) => ({ ...member })),
    reports: REPORTS.map((report) => ({
      ...report,
      steps: [...report.steps],
      history: report.history.map((item) => ({ ...item }))
    })),
    activeBuildId: 'b-050',
    settings: { lastLoadError: null }
  };
}
