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

> Never write `h1`–`h6` again.

Hardcoded heading levels break accessibility and SEO when components are reused. React Headings fixes this by computing each level from your component tree.

## Features

- Supports server-side rendering
- 370 bytes minified & brotlied
- Typed with TypeScript
- Works with any CSS solution (Tailwind, CSS-in-JS, etc.)
- Plays nicely with component libraries

## Install

```sh
npm install react-headings
```

## Usage

Use `H` for every heading. Wrap the content that belongs under a heading in `HeadingLevel`: headings inside render one level deeper.

```tsx
import { H, HeadingLevel } from "react-headings";

function Page() {
  return (
    <>
      <H>Star Wars</H> {/* h1 */}
      <HeadingLevel>
        <H>Characters</H> {/* h2 */}
        <HeadingLevel>
          <Section title="Luke" /> {/* h3 */}
          <Section title="Leia" /> {/* h3 */}
          <Section title="Han Solo" /> {/* h3 */}
        </HeadingLevel>
      </HeadingLevel>
    </>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <H>{title}</H>
      <HeadingLevel>{children}</HeadingLevel>
    </section>
  );
}
```

`Section` doesn't know its level: it renders `h3` here.

### Dialogs

Portaled elements, like dialogs, aren't part of the page outline. Use `level` to start their headings at `h1`:

```tsx
<Dialog>
  <HeadingLevel level={1}>
    <H>Delete file?</H> {/* h1 */}
  </HeadingLevel>
</Dialog>
```

### Styling

React Headings only picks the tag. Style headings however you like, or use `render` for your own component:

```tsx
<H render={(props, { tag }) => <Text as={tag} size="lg" {...props} />}>
  Title
</H>
```

## API

### `Heading` / `H`

Renders `h1`–`h6` based on the current level: `h1` by default, and never deeper than `h6`.

Accepts every `h1` prop and a `ref`, plus:

| Prop     | Type                                         | Description                                                                                                 |
| -------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `render` | `(props, { level, tag }) => ReactElement`    | Renders your own element. Spread `props` on it (includes `children` and `ref`). |

`H` is the same component as `Heading`. Pick one name per project.

### `HeadingLevel`

| Prop     | Type     | Default | Description                                      |
| -------- | -------- | ------- | ------------------------------------------------ |
| `offset` | `number` | `1`     | Levels added to headings inside.                 |
| `level`  | `number` |         | Level of headings inside, ignoring parents.      |

Pass `offset` or `level`, not both. Nested offsets add up. `offset={0}` adds nothing, which is useful for conditional nesting.

Invalid values never throw: they're ignored with a warning, as if not passed. `null` counts as not passed, without a warning.

### `useHeadingLevel()`

Returns the `level` (`1`–`6`) and `tag` (`"h1"`–`"h6"`) a `Heading` would render here.

## Development warnings

In development, React Headings warns in the console when:

- a level is skipped,
- a level goes past 6,
- an `offset` or `level` is invalid.

Warnings are removed from production builds. Vite and webpack show them automatically in dev mode. In plain Node, run with `--conditions=development`.

## License

MIT
