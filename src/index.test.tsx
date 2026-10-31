import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { createPortal } from "react-dom";
import { afterEach, describe, expect, it } from "vitest";

import {
  H,
  Heading,
  HeadingOffset,
  HeadingReset,
  useHeadingLevel,
} from "./index";

afterEach(cleanup);

describe("Heading", () => {
  it("renders an h1 outside any provider (via the H alias)", () => {
    render(<H>Title</H>);

    expect(screen.getByRole("heading", { name: "Title" }).tagName).toBe("H1");
  });
});

describe("Heading props", () => {
  it("forwards native props and the ref", () => {
    const ref = createRef<HTMLHeadingElement>();

    render(
      <Heading ref={ref} id="title" className="big">
        Title
      </Heading>,
    );

    const heading = screen.getByRole("heading", { name: "Title" });
    expect(heading.id).toBe("title");
    expect(heading.className).toBe("big");
    expect(ref.current).toBe(heading);
  });
});

describe("Heading render prop", () => {
  it("receives element props and the computed level and tag", () => {
    const ref = createRef<HTMLHeadingElement>();

    render(
      <HeadingOffset>
        <Heading
          ref={ref}
          className="big"
          render={(props, { level, tag }) => {
            const Tag = tag;
            return <Tag {...props} data-level={level} />;
          }}
        >
          Custom
        </Heading>
      </HeadingOffset>,
    );

    const heading = screen.getByRole("heading", { name: "Custom" });
    expect(heading.tagName).toBe("H2");
    expect(heading.className).toBe("big");
    expect(heading.dataset.level).toBe("2");
    expect(ref.current).toBe(heading);
  });
});

describe("Heading clamping", () => {
  it("clamps levels above 6 to h6", () => {
    render(
      <HeadingOffset offset={8}>
        <Heading>Too deep</Heading>
      </HeadingOffset>,
    );

    expect(screen.getByRole("heading", { name: "Too deep" }).tagName).toBe(
      "H6",
    );
  });
});

describe("HeadingOffset", () => {
  it("renders headings inside one level deeper by default", () => {
    render(
      <>
        <Heading>Page</Heading>
        <HeadingOffset>
          <Heading>Chapter</Heading>
          <HeadingOffset>
            <Heading>Sub</Heading>
          </HeadingOffset>
        </HeadingOffset>
      </>,
    );

    expect(screen.getByRole("heading", { name: "Page" }).tagName).toBe("H1");
    expect(screen.getByRole("heading", { name: "Chapter" }).tagName).toBe("H2");
    expect(screen.getByRole("heading", { name: "Sub" }).tagName).toBe("H3");
  });

  it("renders headings inside `offset` levels deeper", () => {
    render(
      <HeadingOffset offset={2}>
        <Heading>Deep</Heading>
        <HeadingOffset offset={0}>
          <Heading>Same</Heading>
        </HeadingOffset>
      </HeadingOffset>,
    );

    expect(screen.getByRole("heading", { name: "Deep" }).tagName).toBe("H3");
    expect(screen.getByRole("heading", { name: "Same" }).tagName).toBe("H3");
  });
});

describe("HeadingReset", () => {
  it("discards ancestor offsets, then applies its own offset", () => {
    render(
      <HeadingOffset offset={3}>
        <HeadingReset>
          <Heading>Reset</Heading>
          <HeadingOffset>
            <Heading>Nested</Heading>
          </HeadingOffset>
        </HeadingReset>
        <HeadingReset offset={1}>
          <Heading>Reset with offset</Heading>
        </HeadingReset>
      </HeadingOffset>,
    );

    expect(screen.getByRole("heading", { name: "Reset" }).tagName).toBe("H1");
    expect(screen.getByRole("heading", { name: "Nested" }).tagName).toBe("H2");
    expect(
      screen.getByRole("heading", { name: "Reset with offset" }).tagName,
    ).toBe("H2");
  });
});

describe("portals", () => {
  it("inherit the level from the React tree", () => {
    render(
      <HeadingOffset>
        {createPortal(<Heading>Portaled</Heading>, document.body)}
      </HeadingOffset>,
    );

    expect(screen.getByRole("heading", { name: "Portaled" }).tagName).toBe(
      "H2",
    );
  });
});

describe("useHeadingLevel", () => {
  function Probe({ name }: { name: string }) {
    const { level, tag } = useHeadingLevel();
    return <output aria-label={name}>{`${level} ${tag}`}</output>;
  }

  it("returns the level and tag a Heading would render at this position", () => {
    render(
      <>
        <Probe name="root" />
        <HeadingOffset offset={2}>
          <Probe name="nested" />
        </HeadingOffset>
        <HeadingOffset offset={9}>
          <Probe name="clamped" />
        </HeadingOffset>
      </>,
    );

    expect(screen.getByLabelText("root").textContent).toBe("1 h1");
    expect(screen.getByLabelText("nested").textContent).toBe("3 h3");
    expect(screen.getByLabelText("clamped").textContent).toBe("6 h6");
  });
});

describe("invalid offsets", () => {
  it.each([
    [-1, "H2"],
    [1.5, "H3"],
    [NaN, "H2"],
    [Infinity, "H2"],
  ])("HeadingOffset treats %s like the native attribute", (offset, tagName) => {
    render(
      <HeadingOffset>
        <HeadingOffset offset={offset}>
          <Heading>Title</Heading>
        </HeadingOffset>
      </HeadingOffset>,
    );

    expect(screen.getByRole("heading", { name: "Title" }).tagName).toBe(
      tagName,
    );
  });

  it("HeadingReset normalizes its offset the same way", () => {
    render(
      <HeadingReset offset={1.5}>
        <Heading>Title</Heading>
      </HeadingReset>,
    );

    expect(screen.getByRole("heading", { name: "Title" }).tagName).toBe("H2");
  });
});
