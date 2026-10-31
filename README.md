![React Headings Logo](https://github.com/alexnault/react-headings/raw/master/assets/react-headings.png)

# React Headings

<p>
  <a aria-label="Build check" href="https://github.com/alexnault/react-headings/actions">
    <img alt="" src="https://img.shields.io/github/actions/workflow/status/alexnault/react-headings/ci-and-publish.yml?branch=master&style=for-the-badge">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/react-headings">
    <img alt="" src="https://img.shields.io/npm/v/react-headings?style=for-the-badge">
  </a>
</p>

> Heading levels that follow your component tree, so components render the right `h1`–`h6` wherever they're used.

React-headings follows the HTML [`headingoffset`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/headingoffset) and [`headingreset`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/headingreset) proposal, but renders real heading tags today, works through portals and on the server.

## Install

```sh
npm install react-headings
```

## Usage

Use `H` for every heading. Wrap the content that belongs under a heading in `HeadingOffset`: headings inside render one level deeper.

```tsx
import { H, HeadingOffset } from "react-headings";

function Page() {
  return (
    <>
      <H>Star Wars</H> {/* h1 */}
      <HeadingOffset>
        <Card title="Characters"> {/* h2 */}
          <Card title="Luke" /> {/* h3 */}
          <Card title="Leia" /> {/* h3 */}
          <Card title="Han Solo" /> {/* h3 */}
        </Card>
      </HeadingOffset>
    </>
  );
}

function Card({ title, children }) {
  return (
    <article>
      <H>{title}</H>
      <HeadingOffset>{children}</HeadingOffset>
    </article>
  );
}
```

`Card` doesn't know its level. Its heading renders at whatever level `Card` is placed: `h2` for Characters, `h3` for each character nested inside, and `h1` if you render it on its own.

### Dialogs

Portaled content inherits the level from where it sits in the React tree. Content that isn't part of the page outline, such as a dialog, should start over with `HeadingReset`:

```tsx
<Dialog>
  <HeadingReset>
    <H>Delete file?</H> {/* h1 */}
  </HeadingReset>
</Dialog>
```

### Styling

React Headings only decides the tag. Style headings however you like, or render your own component with `render`:

```tsx
<H render={(props, { tag }) => <Text as={tag} size="lg" {...props} />}>
  Title
</H>
```

## API

### `Heading` / `H`

Renders an `h1`–`h6` according to the current level. With no `HeadingOffset` or `HeadingReset` above it, that's `h1`. Levels above 6 render as `h6`.

Accepts every `h1` prop and a `ref`, plus:

| Prop     | Type                                         | Description                                                                                                 |
| -------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `render` | `(props, { level, tag }) => ReactElement`    | Renders a custom element. Spread `props` on it: it holds `children`, `ref` and every other prop you passed. |

`H` is the same component as `Heading`. Pick one name per project.

### `HeadingOffset`

| Prop     | Type     | Default | Description                                     |
| -------- | -------- | ------- | ----------------------------------------------- |
| `offset` | `number` | `1`     | How many levels deeper headings inside render. |

Offsets add up when nested. `offset={0}` changes nothing, which is handy for conditional nesting.

### `HeadingReset`

| Prop     | Type     | Default | Description                                                          |
| -------- | -------- | ------- | -------------------------------------------------------------------- |
| `offset` | `number` | `0`     | Ignores parent offsets: headings inside start at `h1`, plus `offset`. |

### `useHeadingLevel()`

Returns `{ level, tag }` (`1`–`6` and `"h1"`–`"h6"`), what a `Heading` would render at that position.

An invalid `offset` never throws. Like the native attribute, negative values, `NaN` and `Infinity` count as `0`, and fractions round down.

## Development warnings

In development, React Headings warns in the console when:

- a heading level is skipped, for example an `h3` inside a `HeadingOffset` that has no `h2`,
- a level goes past 6,
- an `offset` is invalid.

Warnings only exist in the package's development build, so your production bundle has no warning code. Vite and webpack use the development build automatically in dev mode. In plain Node or Jest, run with `--conditions=development` to get warnings.

## Server Components and SSR

Every export is a client component (`"use client"`), so you can render them from React Server Components, with server-rendered children inside. Server-side rendering outputs the right tags. A Server Component can't read the current level itself.

## Differences from native `headingoffset`

- Levels follow the React tree, not the DOM, so portaled content inherits its level.
- `Heading` always starts at level 1, while a native `h2` starts at 2.
- Levels stop at 6, while native goes up to 9 through `aria-level`.
- The output is a real `h1`–`h6` tag, so CSS like `h2 { … }` matches the level.

Don't combine React Headings with the native attributes: both would add the offset.

## License

MIT
