# Tech Stack

Every choice is here with the reason it won and what it beat.

## Runtime

| Piece | Version | Why |
| --- | --- | --- |
| React | ^19.3.1 | Component model, no framework lock-in, tiny API surface for a single-page tool |
| React DOM | ^19.3.1 | Matches React |
| TypeScript | ^7.0.2 | The data model is the product. Types are the cheapest bug defence here |
| Vite | ^8.3.5 | Instant dev server, one-command production build, zero config |
| @vitejs/plugin-react | ^6.2.0 | Fast Refresh and JSX transform |

## Testing

| Piece | Version | Why |
| --- | --- | --- |
| Vitest | ^5.0.5 | Same transform pipeline as Vite, no separate config, fast on domain logic |

## Styling

Hand-written CSS with custom properties. **No Tailwind, no component library.**

- The entire UI is one design system with about 30 tokens. A utility framework
  would add a build step and a class-name soup for no gain at this size.
- A component library would make the app look like every other admin panel, which
  is exactly what a competition entry must not do.
- CSS custom properties make the theme and the severity colours single-source.

## State

`useReducer` + `useMemo`. **No Redux, no Zustand, no React Query.**

- One store, about 12 actions, one screen. A state library would be ceremony.
- No server, so no cache invalidation problem for React Query to solve.
- If this grew past three screens or gained a backend, Zustand plus TanStack Query
  would be the next step. Documented, not built.

## Persistence

`localStorage` behind a `StorageAdapter` interface.

- Zero infrastructure, survives reload, works offline, demos anywhere.
- The adapter seam is the whole backend migration path. See ARCHITECTURE.md.
- IndexedDB was considered and rejected: the dataset is a few hundred KB at most,
  and localStorage is synchronous and simpler to test.

## Charts

Hand-rolled SVG. **No charting library.**

- Two visuals: a severity breakdown bar and a readiness ring. A library would ship
  40 kB to draw two shapes.
- SVG gives exact control over contrast and reduced-motion behaviour.

## Rejected on purpose

| Option | Why not |
| --- | --- |
| Next.js | No routing, no SEO, no server rendering. A server framework for a local tool is pure overhead |
| Supabase / Firebase | Adds auth, network, and a deployment dependency for a one-day deliverable. The adapter seam keeps the door open |
| Tailwind | Extra build layer for ~30 tokens |
| shadcn/ui | Fast to assemble, but the result reads as a template, and restyling it costs more than writing the components |
| A drag-and-drop library | Native HTML5 drag plus explicit buttons covers the requirement in 40 lines |
| Redux Toolkit | Twelve actions do not need a toolkit |

## Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server on 5173 |
| `npm run build` | Type-check then production build into `dist/` |
| `npm run preview` | Serve `dist/` on 4173 |
| `npm run test` | Vitest, single run |
| `npm run typecheck` | `tsc --noEmit` |

## Deployment

Static output. Any static host works. `netlify.toml` is included: build
`npm run build`, publish `dist`. Nothing in the app requires a server, environment
variable, or secret.
