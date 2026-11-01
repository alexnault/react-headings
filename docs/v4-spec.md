# react-headings 4.0 — Design spec

## Goals

- Heading levels computed from the current nesting, not hard-coded.
- Components can be written without knowing the heading hierarchy of their parents.
- Small, predictable API: one `HeadingLevel` component for relative nesting and absolute resets, like Ariakit's `HeadingLevel` plus an `offset` prop.
- Works through portals (modals, popovers).
- SSR-safe; usable from React Server Components.
- Dev-only hierarchy enforcement.

The 3.0 API is not a constraint. Docs are written fresh (no migration guide).

## Release

Development happens on a feature branch whose PR targets `next` (not `master`). Ship 4.0 as a prerelease from the `next` branch first (see `.releaserc.json`: `next` → npm dist-tag `next`, versions `4.0.0-next.N`). The breaking change must be marked with a `BREAKING CHANGE:` footer (or `feat!:`) so semantic-release bumps the major. Merge `next` into `master` to publish stable `4.0.0` once validated.

## API

```ts
export { Heading, Heading as H, HeadingLevel, useHeadingLevel };
export type { HeadingProps, HeadingLevelProps };
```

### `Heading` (alias `H`)

Renders `h1`–`h6` according to the current level.

- Accepts all native heading props and `ref` (via `forwardRef`, for React 18 support).
- `render?: (props, heading: { level: 1–6; tag: "h1"–"h6" }) => ReactElement`
  - `props` contains only element props (`children`, `className`, `ref`, …), so spreading it never leaks `level`/`tag` to the DOM.
  - Function form only.

```tsx
<Heading render={(props, { tag }) => <Text as={tag} size="lg" {...props} />}>
  Title
</Heading>
```

### `HeadingLevel`

Takes either `offset` or `level`, never both (enforced by a union type):

- `offset?: number` — integer ≥ 0, default `1`. Headings inside render `offset` levels deeper. Nested offsets accumulate. `offset={0}` is a no-op, useful for conditional nesting; the rendered tree is the same for every `offset`, so toggling it never remounts children.
- `level?: number` — integer ≥ 1. Discards all ancestor levels; headings inside render at `level`.

```tsx
<HeadingLevel>             {/* Heading inside → parent + 1 */}
<HeadingLevel offset={2}>  {/* Heading inside → parent + 2 */}
<HeadingLevel level={1}>   {/* Heading inside → h1 */}
```

### `useHeadingLevel()`

Returns `{ level: 1–6, tag: "h1"–"h6" }` — what a `Heading` rendered at this position would be. Values are clamped.

## Behaviour

- **Mechanism:** React context is the source of truth. Real `h1`–`h6` tags are rendered.
- **No provider required:** a `Heading` outside any `HeadingLevel` renders `h1`.
- **No DOM:** `HeadingLevel` renders only a context provider. Users bring their own `<section>`, `<article>`, etc.
- **Convention:** a component that renders a heading wraps the content _under_ that heading. Its own heading renders at whatever level it is placed, so it works standalone, nested or under `level` without changes:

  ```tsx
  function Card({ title, children }) {
    return (
      <article>
        <H>{title}</H>
        <HeadingLevel>{children}</HeadingLevel>
      </article>
    );
  }

  <H>Page</H>                    {/* h1 */}
  <HeadingLevel>
    <Card title="Chapter">       {/* h2 */}
      <Card title="Subchapter" /> {/* h3 */}
    </Card>
  </HeadingLevel>
  ```

- **Portals:** context flows through portals, so portaled content inherits its React-tree level by default. Dialogs opt out with `level`:

  ```tsx
  <Dialog>
    <HeadingLevel level={1}>
      <H>Confirm</H> {/* h1 */}
    </HeadingLevel>
  </Dialog>
  ```

- **Overflow:** levels above 6 clamp to `h6`.
- **Invalid `offset` / `level`:** normalized, never thrown. Typed as plain `number`.

  | Input                       | `offset` treated as               | `level` treated as                |
  | --------------------------- | --------------------------------- | --------------------------------- |
  | Below minimum (`<0` / `<1`) | `0`                               | `1`                               |
  | Fractional                  | floored (`1.5` → `1`)             | floored (`2.5` → `2`)             |
  | `NaN`, `±Infinity`          | `0`                               | `1`                               |
  | Large                       | kept; the final level clamps to 6 | kept; the final level clamps to 6 |

- **Unstyled:** the library handles semantics only. Visual styling is up to the user, via `level`/`tag` from the hook or `render`.
- **Server Components:** all exports are `"use client"`; they can be rendered from Server Components, including Server Components nested inside `HeadingLevel`, and SSR produces correct tags.
- **React:** 18+.

## Packaging & tooling

Breaking:

- **ESM only.** CommonJS support is dropped. `"type": "module"` with an `exports` map; the package root is the only public entry point (no deep imports), plus `./package.json`.
- **Named exports only.** No default export.
- **React peer range** `^18.0.0 || ^19.0.0` (drops 16.8 and 17).
- **Modern build target** (ES2020) instead of ES5.
- **Dev/prod builds via export conditions.** `exports` maps `types`, `development` (`dist/index.development.js`), `production` and `default` (`dist/index.js`). Dev warnings exist only in the development build, so consumers don't need `process.env.NODE_ENV` defined.
- **TypeScript 5.0+** required for the published types.

Non-breaking:

- Automatic JSX runtime (`jsx: "react-jsx"`).
- Top-level `types` field pointing at `dist/index.d.ts`, for TypeScript projects on `moduleResolution: "node"`, which ignores `exports`.
- New package description and keywords reflecting dynamic heading levels.
- Size-limit tracks `dist/index.js` (React excluded) minified, gzipped and brotlied.

Build:

- `scripts/build.js` runs esbuild twice (ESM, ES2020, React external), defining `process.env.NODE_ENV` as `"production"` or `"development"` so dead dev branches are removed. `tsc -p tsconfig.build.json` emits only `index.d.ts`.
- Source guards dev code with `process.env.NODE_ENV !== "production"`. `src/env.d.ts` declares just `process.env.NODE_ENV`, because `tsconfig.json` sets `"types": []` to keep Node APIs out of library code. Tests run the source directly and toggle modes with `vi.stubEnv`.
- Both builds start with `"use client"`.

Dev toolchain and CI:

- TypeScript 5, ESLint 10 flat config (`@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`), Prettier 3, Vitest with v8 coverage at 100%.
- Developed against React 19; a CI job also typechecks and tests against React 18, the lowest supported version.
- CI runs lint, typecheck, tests (including a build smoke test of `dist/`), build and size-limit.

## Dev-only warnings

Only present in the `development` export condition build; never thrown.

1. **Skipped level** — a scope (`HeadingLevel`) contains deeper headings but is missing a level between its first expected level and the deepest one (e.g. `h1` → `h3`, or `offset={2}`). Message: `react-headings: Skipped heading level 2: found a level 3 heading but no level 2 heading.`
   - A `HeadingLevel` with `offset` expects its first heading at the parent level + 1. `offset={0}` is not a scope; its headings count toward the nearest scope above.
   - Each `HeadingLevel` with `level` starts a fresh, isolated scope whose expected first level is `level`; its headings don't count toward the parent.
   - A non-empty nested scope counts as a heading at its own first level in its parent, so each gap is reported by exactly one scope.
   - Headings register with their scope in effects (client-only; zero cost in SSR/production). The check runs in a microtask after the commit, so it sees the whole tree, and re-runs when headings mount or unmount. Each scope warns at most once.
2. **Overflow** — computed level exceeds 6. Message: `react-headings: Heading level 7 exceeds 6 and was clamped to h6.`
3. **Invalid value** — `offset` or `level` was normalized. Message: `react-headings: HeadingLevel received invalid offset -1, treated as 0.` (or `invalid level`).

The root (outside any `HeadingLevel`) is not a scope, so a page with no `h1` is not detected. Only the levels present in a scope are compared, not their order, so an `h3` placed before its `h2` is not detected either.

## Non-goals

- `as` / `asChild` polymorphism.
- "Single `h1`" enforcement.
- Absolute-level props on `Heading` (only `HeadingLevel` takes `level`).
