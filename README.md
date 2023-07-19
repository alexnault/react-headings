![React Headings Logo](https://github.com/alexnault/react-headings/raw/master/assets/react-headings.png)

# React Headings

<p>
  <a aria-label="Build check" href="https://github.com/alexnault/react-headings/actions">
    <img alt="" src="https://img.shields.io/github/actions/workflow/status/alexnault/react-headings/ci-and-publish.yml?branch=master&style=for-the-badge">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/react-headings">
    <img alt="" src="https://img.shields.io/npm/v/react-headings?style=for-the-badge">
  </a>
  <a aria-label="Size" href="https://bundlephobia.com/package/react-headings">
    <img alt="" src="https://img.shields.io/bundlephobia/minzip/react-headings?style=for-the-badge">
  </a>
  <a aria-label="Monthly downloads" href="https://www.npmjs.com/package/react-headings">
    <img alt="" src="https://img.shields.io/npm/dm/react-headings?style=for-the-badge">
  </a>
</p>

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
- [API](#api)
- [Changelog](#changelog)
- [Contributing](#contributing)

## Demos

- [Minimal](https://codesandbox.io/s/react-headings-minimal-4temt?file=/src/Demo.js)
- [Custom component](https://codesandbox.io/s/react-headings-custom-component-l4bjb?file=/src/Demo.js)
- [Advanced structure](https://codesandbox.io/s/react-headings-advanced-structure-uxk4p?file=/src/Demo.js)

## Highlights

- Improves SEO and accessibility
- Supports server-side rendering
- Under 1 kB minified & gzipped
- Typed with TypeScript
- Fully tested
- Works with any CSS solutions (Tailwind, CSS-in-JS, etc.)
- Plays nicely with component libraries (Material UI, etc.)
- Follows [semantic versioning](https://semver.org/)

## Installation

```bash
npm install react-headings
```

## Examples

### Basic usage

```jsx
import React from "react";
import { H, Section } from "react-headings";

function App() {
  return (
    <Section component={<H>My hx</H>}>
      <div>...</div>
      <div>...</div>
      <div>...</div>
      <Section component={<H>My hx+1</H>}>
        <div>...</div>
        <div>...</div>
        <div>...</div>
      </Section>
    </Section>
  );
}
```

### Advanced structure

Child components inherit the current level of their parent:

```jsx
import React from "react";
import { H, Section } from "react-headings";

function ParentComponent() {
  return (
    <Section component={<H>My hx</H>}>
      <Section component={<H>My hx+1</H>}>
        <Section component={<H>My hx+2</H>}>
          <ChildComponent />
        </Section>
      </Section>
    </Section>
  );
}

function ChildComponent() {
  return (
    <Section component={<H>My hy</H>}>
      {/* The following heading would be a <h5> in the current context */}
      <Section component={<H>My hy+1</H>}>
        <p>...</p>
      </Section>
    </Section>
  );
}
```

### Styling

A heading can be styled like any ordinary `<hx>` element since it accepts all the same props:

```jsx
import React from "react";
import { H, Section } from "react-headings";

function App() {
  return (
    <Section component={<H className="my-class">My hx</H>}>
      ...
    </Section>
  );
}
```

### Custom heading

A heading can be as complex as we want:

```jsx
import React from "react";
import { H, Section } from "react-headings";
import MyIcon from "./MyIcon";

function App() {
  return (
    <Section
      component={
        <div className="my-div">
          <MyIcon className="my-icon" />
          <H className="my-heading">My hx</H>
        </div>
      }
    >
      <div>...</div>
      <div>...</div>
      <div>...</div>
    </Section>
  );
}
```

### Using component libraries

Leveraging `Component` and `level` from the context allows the use of component libraries.
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

## API

### `<H>` component

Renders a `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>` or `<h6>` depending on the current level.

#### Props

| Name       | Type       | Required | Description                                                     |
| ---------- | ---------- | -------- | --------------------------------------------------------------- |
| `render`   | `function` | No       | Override with a custom heading. Has precedence over `children`. |
| `children` | `node`     | No       | The content of the heading. Usually the title.                  |

Any other props will be passed to the heading element.

#### Example

```jsx
import React from "react";
import { H } from "react-headings";

function Example1() {
  return <H>This is my title</H>;
}

function Example2() {
  return (
    <H render={({ level, Component }) => <Component>My h{level}</Component>} />
  );
}
```

### `<Section>` component

Creates a new section (a heading and its level).

#### Props

| Name        | Type   | Required | Description                                                                     |
| ----------- | ------ | -------- | ------------------------------------------------------------------------------- |
| `component` | `node` | Yes      | The heading component. Can be anything but best used in combination with `<H>`. |
| `children`  | `node` | No       | The content of the new level.                                                   |

#### Example

```jsx
import React from "react";
import { Section, H } from "react-headings";

function Example1() {
  return (
    <Section component={<H>This is my title</H>}>
      This is my content
    </Section>
  );
}

function Example2() {
  return (
    <Section
      component={
        <div>
          <div>
            <H>This is my title</H>
          </div>
        </div>
      }
    >
      This is my content
    </Section>
  );
}
```

### `useLevel` hook

Returns an object containing the current `level` and current `Component`.

#### Arguments

None

#### Returns

| Name        | Type                                                     | Description                           |
| ----------- | -------------------------------------------------------- | ------------------------------------- |
| `level`     | `1` \| `2` \| `3` \| `4` \| `5` \| `6`                   | The current level.                    |
| `Component` | `"h1"` \| `"h2"` \| `"h3"` \| `"h4"` \| `"h5"` \| `"h6"` | The current component. Same as level. |

#### Example

```jsx
import React from "react";
import { useLevel } from "react-headings";

function Example(props) {
  const { level, Component } = useLevel();

  return <Component {...props}>This is a h{level}</Component>;
}
```

## Changelog

For a list of changes and releases, see the [changelog](https://github.com/alexnault/react-headings/releases).

## Contributing

Found a bug, have a question or looking to improve react-headings? Open an [issue](https://github.com/alexnault/react-headings/issues/new), start a [discussion](https://github.com/alexnault/react-headings/discussions/new) or submit a [PR](https://github.com/alexnault/react-headings/fork)!
