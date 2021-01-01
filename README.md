# React Headings ![npm](https://img.shields.io/npm/v/react-headings?style=flat-square) ![size](https://img.shields.io/bundlephobia/minzip/react-headings?style=flat-square)

> Never worry about using the wrong heading level (`h1`, `h2`, etc.) in complex React apps!

React-headings dynamically maintains the current heading level and prevents skipping levels no matter your component structure, as required by WCAG.

## Basic usage

```jsx
import React from "react";
import { H, Level } from "react-heading";

function App() {
  return (
    <>
      <H>My heading (hx)</H>
      <Level>
        <H>My subheading (hx+1)</H>
        <p>...</p>
        <H>My subheading (hx+1)</H>
        <Level>
          <H>My subsubheading (hx+2)</H>
          <p>...</p>
          <MyComponent />
        </Level>
      </Level>
    </>
  );
}

function MyComponent() {
  return (
    <>
      <H>My heading (hy)</H>
      <Level>
        <H>My subheading (hy+1)</H>
        <p>...</p>
      </Level>
    </>
  )
}
```

## Features

- Simple API
- Focus on developer experience
- Accessible
- Flexible (no component lock-in)
- Typed with TypeScript
- Works with component libraries (Material UI, etc.)
- Fully tested
- Zero dependencies
- Tiny (~400b minified + gzipped)
- Semver compliant

## Installation

```bash
npm install react-headings --save
```

## More examples

### Custom component

```jsx
import React from "react";
import { H, Level } from "react-heading";
import { Typography } from "@material-ui/core";

function MyComponent() {
  return (
    <H>
      {(Component, level) => (
        <Typography component={Component}>This is a h{level}</Typography>
      )}
    </H>
  );
}

```

### `useLevel` hook

```jsx
import React from "react";
import { useLevel } from "react-heading";

function MyComponent() {
  const level = useLevel();

  return <div>Current level is {level}</div>;
}
```
