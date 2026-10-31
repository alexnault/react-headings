// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

import { Heading, HeadingOffset, HeadingReset } from "./index";

it("renders the computed tags on the server", () => {
  const html = renderToString(
    <>
      <Heading>Page</Heading>
      <HeadingOffset>
        <Heading>Chapter</Heading>
        <HeadingReset>
          <Heading>Dialog</Heading>
        </HeadingReset>
      </HeadingOffset>
    </>
  );

  expect(html).toBe("<h1>Page</h1><h2>Chapter</h2><h1>Dialog</h1>");
});
