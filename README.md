![React Headings Logo](https://github.com/alexnault/react-headings/raw/master/assets/react-headings.png)

# React Headings ![npm](https://img.shields.io/npm/v/react-headings?style=flat-square) ![size](https://img.shields.io/bundlephobia/minzip/react-headings?style=flat-square)

> Never worry about using the wrong heading level (`h1`, `h2`, etc.) in complex React apps!

React-headings maintains the proper hierarchy of headings for improved accessibility and SEO, no matter the component structure, while you keep full control of what's rendered.

References:

- [WCAG 2.0 technique H69](https://www.w3.org/TR/WCAG20-TECHS/H69.html)
- [Lighthouse SEO heading order audit](https://web.dev/heading-order/)

## Table of contents

- [Demos](#demos)
- [Highlights](#highlights)
- [Installation](#installation)
- [Examples](#examples)
- [Changelog](#changelog)
- [Contributing](#contributing)

## Demos

- [Minimal](https://codesandbox.io/s/react-headings-minimal-4temt?file=/src/Demo.js)
- [Custom component](https://codesandbox.io/s/react-headings-custom-component-l4bjb?file=/src/Demo.js)
- [Advanced structure](https://codesandbox.io/s/react-headings-advanced-structure-uxk4p?file=/src/Demo.js)

## Highlights

- Flexible
- Focused on developer experience
- Fully tested
- Typed with TypeScript
- Works with component libraries (Material UI, etc.)
- Supports server-side rendering
- Under 1 kB minified & gzipped
- Follows [semantic versioning](https://semver.org/)

## Installation

```bash
npm install react-headings
# or
yarn add react-headings
```

## Examples

### Basic usage

```jsx
import React from "react";
import { H, Section } from "react-headings";
import MyIcon from "./MyIcon";

function ParentComponent() {
  return (
    <Section component={
      <div>
        <MyIcon />
        <H>My hx</H>
      </div>
    }>
      <Section component={<H>My hx+1</H>}>
        <p>...</p>
      </Section>
      <Section component={<H>My hx+1</H>}>
        <ChildComponent />
      </Section>
    </Section>
  );
}

function ChildComponent() {
  return (
    <Section component={<H>My hx+2</H>}>
      <p>...</p>
    </Section>
  );
}
```

### Custom component

You can render custom headings anywhere by using either the `useLevel` hook or the `H` component.

- With the `useLevel` hook:

```jsx
import React from "react";
import { useLevel } from "react-headings";

function App() {
  const { Component, level } = useLevel();

  return <Component>This is a h{level}</Component>;
}
```

- With the `H` component:

```jsx
import React from "react";
import { H } from "react-headings";

function App() {
  return (
    <H
      render={({ Component, level }) => (
        <Component>This is a h{level}</Component>
      )}
    />
  );
}
```

*Note: `render` as precedence over `children`.*

### Using component librairies

Here's an example with [Material UI](https://material-ui.com/api/typography/):

```jsx
import React from "react";
import { useLevel } from "react-headings";
import { Typography } from "@material-ui/core";

function MyHeading(props) {
  const { Component } = useLevel();

  return <Typography component={Component} {...props} />;
}
```

Leveraging `Component` and `level` from the context should make implementing other librairies pretty straightforward.

## Changelog

For a list of changes and releases, see the [changelog](https://github.com/alexnault/react-headings/releases).

## Contributing

Found a bug, have a question or looking to improve react-headings? Open an [issue](https://github.com/alexnault/react-headings/issues/new), start a [discussion](https://github.com/alexnault/react-headings/discussions/new) or submit a [PR](https://github.com/alexnault/react-headings/fork)!
