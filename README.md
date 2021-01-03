<img align="right" width="200" src="https://github.com/alexnault/react-headings/raw/master/assets/react-headings.png" />

# React Headings ![npm](https://img.shields.io/npm/v/react-headings?style=flat-square) ![size](https://img.shields.io/bundlephobia/minzip/react-headings?style=flat-square)

> Never worry about using the wrong heading level (`h1`, `h2`, etc.) in complex React apps!

React-headings maintains the current heading level and prevents skipping levels no matter your component structure, [as required by WCAG](https://www.w3.org/WAI/tutorials/page-structure/headings/).

## Basic usage

```jsx
import React from "react";
import { H, Level } from "react-headings";

function ParentComponent() {
  return (
    <div>
      <H>My heading (hx)</H>
      <Level>
        <H>My subheading (hx+1)</H>
        <p>...</p>
        <H>My subheading (hx+1)</H>
        <Level>
          <H>My subsubheading (hx+2)</H>
          <p>...</p>
          <ChildComponent />
        </Level>
      </Level>
    </div>
  );
}

function ChildComponent() {
  return (
    <div>
      <H>My heading (hy)</H>
      <Level>
        <H>My subheading (hy+1)</H>
        <p>...</p>
      </Level>
    </div>
  )
}
```

## Features

- Flexible (no component lock-in)
- Focused on developer experience
- Typed with TypeScript
- Works with component libraries (Material UI, etc.)
- Fully tested
- Zero dependencies
- Tiny (~0.4kB minified + gzipped)
- Follows [semantic versioning](https://semver.org/)

## Installation

```bash
npm install react-headings --save
```

## More examples

### Custom component

`H` exposes a `render` prop to render a custom component based on the current level.
Note: `render` as precedence over `children`.

```jsx
import React from "react";
import { H, Level } from "react-headings";
import { Typography } from "@material-ui/core";

function MyComponent() {
  return (
    <H
      render={({ Component, level }) => (
        <Typography component={Component}>This is a h{level}</Typography>
      )}
    />
  );
}
```

### `useLevel` hook

```jsx
import React from "react";
import { useLevel } from "react-headings";

function MyComponent() {
  const level = useLevel();

  return <div>Current level is {level}</div>;
}
```

## Changelog

For a list of changes and releases, see the [changelog](https://github.com/alexnault/react-headings/releases).

## Contributing

Found a bug, have a question or looking to improve react-headings? Open an [issue](https://github.com/alexnault/react-headings/issues/new) or a [PR](https://github.com/alexnault/react-headings/fork)!

## License

This project is under the [MIT license](/LICENSE).
