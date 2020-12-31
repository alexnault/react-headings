# React Headings

Never worry about using the wrong heading level (h1, h2, etc.) in complex React apps!

React-headings maintains the current level and prevents skipping levels no matter your component structure, as required by WCAG.

## Basic usage

```jsx
import { H, Level } from "react-heading";

function App() {
  return (
    <H>This is a h1</H>
    <Level>
      <H>This is a h2</H>
      <p>...</p>
      <H>This is a h2</H>
      <p>...</p>
      <Level>
        <H>This is a h3</H>
        <p>...</p>
      </Level>
    </Level>
    </>
  );
}
```

## Features

- Accessible
- Customizable
- Typed with TypeScript
- Works with all component libraries (Material UI, etc.)
- Fully tested
- Zero dependencies
<!-- - Tiny (less than x kb) -->

## Installation

```bash
npm install --save react-headings
```

## More examples

### Custom component

```jsx
import { H, Level } from "react-heading";
import { Typography } from '@material-ui/core';

function MyComponent() {
  return (
    <H>{(Component, level) => <Typography component={Component}>This is a h{level}</Typography>}</H>
  );
}
```

### `useLevel` hook

```jsx
import { useLevel } from "react-heading";

function MyComponent() {
  const level = useLevel();

  return (
    <div>Current level is {level}</div>
  );
}
```
