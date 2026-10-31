// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

import { Heading, HeadingLevel } from "./index";

it("renders the computed tags on the server", () => {
  const html = renderToString(
    <>
      <Heading>Page</Heading>
      <HeadingLevel>
        <Heading>Chapter</Heading>
        <HeadingLevel level={1}>
          <Heading>Dialog</Heading>
        </HeadingLevel>
      </HeadingLevel>
    </>,
  );

  expect(html).toBe("<h1>Page</h1><h2>Chapter</h2><h1>Dialog</h1>");
});
