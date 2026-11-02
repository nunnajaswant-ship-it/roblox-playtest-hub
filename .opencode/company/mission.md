# MISSION - Pixel Rush (1-day web game competition)

## Outcome
A working, deployable Phaser 4 web game repo with a game-ready toolchain:
engine-correct agent context, real browser playtesting, performance auditing,
and repo-local skills that act as squad law for design, levels, juice, demo and QA.

## Constraints
- Stack: Phaser 4.2.1 + Vite 8, plain JavaScript, no backend.
- One-day build window. Every addition must pay for itself today.
- Judges score graphics and audio separately. Polish is in scope.
- Game concept is NOT yet chosen. Scaffold must be concept-agnostic.
- Publishing to a public URL is an external action: needs explicit approval.

## Non-goals
- 3D pipelines (Blender/Unity/Godot/Unreal). 2D only.
- Spine rigging, Phaser Editor, full asset pipeline tooling.
- Any toolchain that duplicates the existing Athena agent company.

## Acceptance
1. `opencode mcp list` shows context7, playwright, chrome-devtools with real state.
2. A skill named `game-design` loads via the skill tool and returns the design contract.
3. `npm run build` in the repo exits 0 and emits dist/index.html.
4. `npm run dev` serves a page that renders a Phaser canvas with no console errors.
5. Six repo skills exist under .opencode/skills with valid frontmatter.

## Risks
- Chrome is absent; chrome-devtools MCP must target Playwright's Chromium.
- oh-my-opencode is now a separate harness (OmO), not an OpenCode plugin: conflict risk, excluded.
- Aseprite is not installed: aseprite MCP is inert, excluded.
- Agent-written game code often hallucinates Phaser APIs: mitigate with Context7.

## Decisions
- D1: Do not install oh-my-opencode. It replaces OpenCode rather than extending it.
- D2: Do not install opencode-pty. Native shell already supports background processes.
- D3: Do not install @pebbly/aseprite-ai-artist. Requires Aseprite, which is not present.
- D4: Install superpowers via its official V2 `plugins` spec.
- D5: Browser QA runs on Playwright's Chromium; no installer-hash bypass.
