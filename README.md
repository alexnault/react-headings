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

> Never write `<h1>`–`<h6>` again.

Hardcoded heading levels break accessibility and SEO when components are reused. React Headings fixes this by computing each level from your component tree.

## Features

- Supports server-side rendering
- Only 373 bytes minified & brotlied
- Typed with TypeScript
- Works with any CSS solution (Tailwind, CSS-in-JS, etc.)
- Plays nicely with component libraries

## Install

```sh
npm install react-headings
```

## Usage

### Basics

`HeadingLevel` moves headings inside one level deeper:

```tsx
import { Heading, HeadingLevel } from "react-headings";

function MyPage() {
  return (
    <main>
      <Heading>Star Wars</Heading>    {/* <h1> */}
      <HeadingLevel>
        <Heading>Characters</Heading> {/* <h2> */}
        <HeadingLevel>
          Luke, Leia, Han Solo...
        </HeadingLevel>
        <Heading>Planets</Heading>    {/* <h2> */}
        <HeadingLevel>
          Tatooine, Coruscant...
        </HeadingLevel>
      </HeadingLevel>
    </main>
  );
}
```

### Reusability

Headings inside a component adapt to wherever it's used:

```tsx
function MyPage() {
  return (
    <main>
      <MySection title="Star Wars">    {/* <h1> */}
        <MySection title="Characters"> {/* <h2> */}
          Luke, Leia, Han Solo...
        </MySection>
        <MySection title="Planets">    {/* <h2> */}
          Tatooine, Coruscant...
        </MySection>
      </MySection>
    </main>
  );
}

function MySection({ title, children }) {
  return (
    <section>
      <Heading>{title}</Heading> {/* <h1>, <h2>, etc. depending on where MySection is used */}
      <HeadingLevel>{children}</HeadingLevel>
    </section>
  );
}
```

### Dialogs

Portaled elements, like dialogs, aren't part of the page outline. Use `level` to reset their headings to `<h1>`:

```tsx
<Dialog>
  <HeadingLevel level={1}>
    <Heading>Delete file?</Heading> {/* <h1> */}
    <HeadingLevel>
      <button>Delete</button>
      <button>Cancel</button>
    </HeadingLevel>
  </HeadingLevel>
</Dialog>
```

### Styling

React Headings only picks the tag. Style headings however you like:

```tsx
<Heading className="text-lg">Title</Heading>
```

Or use `render` for component libraries:

```tsx
<Heading render={(props, { tag }) => <Text as={tag} size="lg" {...props} />}>
  Title
</Heading>
```

## API

### `<Heading>`

Renders `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, or `<h6>` based on the current level. `<h1>` by default.

Accepts every `<h1>` prop and a `ref`, plus:

| Prop     | Type                                         | Description                                                                                                 |
| -------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `render` | `(props, { level, tag }) => ReactElement`    | Renders your own element. Spread `props` on it (includes `children` and `ref`). |

### `<HeadingLevel>`

Moves the headings inside one level deeper.

| Prop     | Type     | Default | Description                                      |
| -------- | -------- | ------- | ------------------------------------------------ |
| `offset` | `number` | `1`     | Levels added to headings inside. Rarely used.    |
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
