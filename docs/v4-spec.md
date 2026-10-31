# react-headings 4.0 — Design spec

## Goals

- Heading levels computed from the current nesting, not hard-coded.
- Components can be written without knowing the heading hierarchy of their parents.
- Small, predictable API that mirrors the HTML [`headingoffset`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/headingoffset) / [`headingreset`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/headingreset) proposal (a userland polyfill of its semantics).
- Works through portals (modals, popovers).
- SSR-safe; usable from React Server Components.
- Dev-only hierarchy enforcement.

The 3.0 API is not a constraint. Docs are written fresh (no migration guide).

## Release

Development happens on a feature branch whose PR targets `next` (not `master`). Ship 4.0 as a prerelease from the `next` branch first (see `.releaserc.json`: `next` → npm dist-tag `next`, versions `4.0.0-next.N`). The breaking change must be marked with a `BREAKING CHANGE:` footer (or `feat!:`) so semantic-release bumps the major. Merge `next` into `master` to publish stable `4.0.0` once validated.

## API

```ts
export { Heading, Heading as H, HeadingOffset, HeadingReset, useHeadingLevel };
```

### `Heading` (alias `H`)

Renders `h1`–`h6` according to the current level.

- Accepts all native heading props and `ref`.
- `render?: (props, state: { level: 1–6; tag: "h1"–"h6" }) => ReactElement`
  - `props` contains only element props (`children`, `className`, `ref`, …), so spreading it never leaks `level`/`tag` to the DOM.
  - Function form only.

```tsx
<Heading render={(props, { tag }) => <Text as={tag} size="lg" {...props} />}>
  Title
</Heading>
```

### `HeadingOffset`

`offset?: number` — integer ≥ 0, default `1`.

Headings inside render `offset` levels deeper. Nested offsets accumulate. `offset={0}` is a no-op, useful for conditional nesting without changing tree shape.

### `HeadingReset`

`offset?: number` — integer ≥ 0, default `0`.

Discards all ancestor offsets, then applies its own offset (matches native `headingreset` + `headingoffset` on the same element).

```tsx
<HeadingReset>            {/* Heading inside → h1 */}
<HeadingReset offset={1}> {/* Heading inside → h2 */}
```

### `useHeadingLevel()`

Returns `{ level: 1–6, tag: "h1"–"h6" }` — what a `Heading` rendered at this position would be. Values are clamped.

## Behaviour

- **Mechanism:** React context is the source of truth. Real `h1`–`h6` tags are rendered; native `headingoffset`/`headingreset` attributes are never emitted (they would double-count on top of the computed tag, and do not follow portals).
- **No provider required:** a `Heading` outside any `HeadingOffset`/`HeadingReset` renders `h1`.
- **No DOM:** `HeadingOffset` and `HeadingReset` render only a context provider. Users bring their own `<section>`, `<article>`, etc.
- **Convention:** a component that renders a heading wraps the content _under_ that heading. Its own heading renders at whatever level it is placed, so it works standalone, nested or inside a `HeadingReset` without changes (like native `headingoffset`, where the embedder applies the offset):

  ```tsx
  function Card({ title, children }) {
    return (
      <article>
        <H>{title}</H>
        <HeadingOffset>{children}</HeadingOffset>
      </article>
    );
  }

  <H>Page</H>                    {/* h1 */}
  <HeadingOffset>
    <Card title="Chapter">       {/* h2 */}
      <Card title="Subchapter" /> {/* h3 */}
    </Card>
  </HeadingOffset>
  ```

- **Portals:** context flows through portals, so portaled content inherits its React-tree level by default. Dialogs opt out with `HeadingReset`:

  ```tsx
  <Dialog>
    <HeadingReset>
      <H>Confirm</H> {/* h1 */}
    </HeadingReset>
  </Dialog>
  ```

- **Overflow:** levels above 6 clamp to `h6`.
- **Invalid `offset`:** normalized like the native attribute, never thrown. Typed as plain `number`.

  | Input              | Treated as                        |
  | ------------------ | --------------------------------- |
  | Negative           | `0`                               |
  | Fractional         | floored (`1.5` → `1`)             |
  | `NaN`, `±Infinity` | `0`                               |
  | Large              | kept; the final level clamps to 6 |

- **Unstyled:** the library handles semantics only. Visual styling is up to the user, via `level`/`tag` from the hook or `render`.
- **Server Components:** all exports are `"use client"`; they can be rendered from Server Components (with server children), and SSR produces correct tags. Server Components cannot read the level themselves.
- **React:** 18+.

## Differences from native `headingoffset`

The semantics mirror the HTML proposal, with these deliberate divergences:

|                              | Native                                                     | react-headings                                                               |
| ---------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Tree followed                | DOM ancestors                                              | React tree, so portals inherit their React-tree level                        |
| Base level                   | The tag's own number (`h2` + offset 1 → 3)                 | Always 1; `Heading` has no intrinsic level                                   |
| Maximum level                | 9 (levels 7–9 exposed via `aria-level`)                    | 6 (clamped to `h6`)                                                          |
| Offset value range           | 0–8 per element                                            | Any non-negative integer; only the final level is clamped                    |
| Offset on the heading itself | Allowed (`<h1 headingoffset="2">` → 3)                     | Not supported; offsets come only from `HeadingOffset` / `HeadingReset`       |
| Rendered output              | Tag unchanged; level exists only in the accessibility tree | Real `h1`–`h6` tag, so CSS `h2` selectors and default styles match the level |

## Packaging & tooling

Breaking:

- **ESM only.** CommonJS support is dropped. `"type": "module"` with an `exports` map; the package root is the only public entry point (no deep imports).
- **Named exports only.** No default export.
- **React peer range** `^18.0.0 || ^19.0.0` (drops 16.8 and 17).
- **Modern build target** (ES2020) instead of ES5.
- **Dev/prod builds via export conditions.** `exports` provides `development` and `production` (default) conditions; dev warnings exist only in the development build, so no reliance on `process.env.NODE_ENV`.
- **TypeScript 5.0+** required for the published types.

Non-breaking:

- Automatic JSX runtime (`jsx: "react-jsx"`).
- New package description and keywords reflecting dynamic heading levels / `headingoffset` polyfill.
- Upgraded dev toolchain (TypeScript 5, current ESLint, Vitest).
- Size-limit budget re-baselined on the new build (should be well under the current 755 B gzip).

## Dev-only warnings

Only present in the `development` export condition build; never thrown.

1. **Skipped level** — a scope (`HeadingOffset` / `HeadingReset`) contains deeper headings but no heading at its own level (e.g. `h1` → `h3`, or `offset={2}`). Each `HeadingReset` starts a fresh scope whose expected first level is its own. Implemented via heading registration in effects (client-only; zero cost in SSR/production).
2. **Overflow** — computed level exceeds 6.
3. **Invalid offset** — `offset` was normalized (e.g. `HeadingOffset: invalid offset -1, treated as 0`).

## Non-goals

- Emitting native `headingoffset`/`headingreset` attributes. The native attribute is an _alternative_ to this library, not a complement.
- `as` / `asChild` polymorphism.
- "Single `h1`" enforcement.
- Absolute-level props on `Heading`.
