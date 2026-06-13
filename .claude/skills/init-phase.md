# init-phase skill

Execute a specific implementation phase from docs/IMPLEMENTATION_PLAN.md.

## Usage

Called as: `/init-phase <phase-number>` (e.g. `/init-phase 1`)

## Steps

1. Read `docs/IMPLEMENTATION_PLAN.md` and locate the specified phase (ФАЗА N).
2. Execute each task in the phase **in order** — tasks within a phase depend on each other.
3. After each task, verify the stated criterion ("Критерий").
4. Do NOT start the next phase without completing all tasks in the current one.

## Phase dependencies

```
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
```

Each phase depends on all previous phases being complete.

## Key constraints

- **Phase 1**: Run `npm create vite@latest . -- --template react-ts` only if `package.json` does not exist yet.
- **Phase 2**: SVG stubs must be created for ALL 14 characters before moving to Phase 3.
- **Phase 3**: Stores must be validated with Zod schemas — see `src/lib/schemas.ts`.
- **Phase 4**: `executePulls` must call `updatePity` via the store, not inline.
- **Phase 6 (PullPage)**: Results come from `location.state`; direct navigation → redirect to `/`.

## After each phase

Run:
```bash
npx tsc --noEmit   # 0 errors required
npm run dev        # must start without console errors
```
