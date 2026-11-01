import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { createPortal } from "react-dom";
import { afterEach, describe, expect, it } from "vitest";

import { H, Heading, HeadingLevel, useHeadingLevel } from "./index";

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
      <HeadingLevel>
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
      </HeadingLevel>,
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
      <HeadingLevel offset={8}>
        <Heading>Too deep</Heading>
      </HeadingLevel>,
    );

    expect(screen.getByRole("heading", { name: "Too deep" }).tagName).toBe(
      "H6",
    );
  });
});

describe("HeadingLevel", () => {
  it("renders headings inside one level deeper by default", () => {
    render(
      <>
        <Heading>Page</Heading>
        <HeadingLevel>
          <Heading>Chapter</Heading>
          <HeadingLevel>
            <Heading>Sub</Heading>
          </HeadingLevel>
        </HeadingLevel>
      </>,
    );

    expect(screen.getByRole("heading", { name: "Page" }).tagName).toBe("H1");
    expect(screen.getByRole("heading", { name: "Chapter" }).tagName).toBe("H2");
    expect(screen.getByRole("heading", { name: "Sub" }).tagName).toBe("H3");
  });

  it("renders headings inside `offset` levels deeper", () => {
    render(
      <HeadingLevel offset={2}>
        <Heading>Deep</Heading>
        <HeadingLevel offset={0}>
          <Heading>Same</Heading>
        </HeadingLevel>
      </HeadingLevel>,
    );

    expect(screen.getByRole("heading", { name: "Deep" }).tagName).toBe("H3");
    expect(screen.getByRole("heading", { name: "Same" }).tagName).toBe("H3");
  });
});

describe("HeadingLevel with level", () => {
  it("renders headings inside at `level`, ignoring ancestors", () => {
    render(
      <HeadingLevel offset={3}>
        <HeadingLevel level={1}>
          <Heading>Reset</Heading>
          <HeadingLevel>
            <Heading>Nested</Heading>
          </HeadingLevel>
        </HeadingLevel>
        <HeadingLevel level={2}>
          <Heading>Reset to 2</Heading>
        </HeadingLevel>
      </HeadingLevel>,
    );

    expect(screen.getByRole("heading", { name: "Reset" }).tagName).toBe("H1");
    expect(screen.getByRole("heading", { name: "Nested" }).tagName).toBe("H2");
    expect(screen.getByRole("heading", { name: "Reset to 2" }).tagName).toBe(
      "H2",
    );
  });

  it("cannot be combined with `offset`", () => {
    // @ts-expect-error `offset` and `level` are mutually exclusive.
    void (<HeadingLevel offset={1} level={1} />);
  });
});

describe("conditional nesting", () => {
  it("keeps children mounted when `offset` toggles", () => {
    function Chapter({ isNested }: { isNested: boolean }) {
      return (
        <HeadingLevel offset={isNested ? 1 : 0}>
          <Heading>Title</Heading>
          <input aria-label="Notes" />
        </HeadingLevel>
      );
    }

    const { rerender } = render(<Chapter isNested={false} />);
    const input = screen.getByRole("textbox", { name: "Notes" });
    rerender(<Chapter isNested />);

    expect(screen.getByRole("textbox", { name: "Notes" })).toBe(input);
    expect(screen.getByRole("heading", { name: "Title" }).tagName).toBe("H2");
  });
});

describe("portals", () => {
  it("inherit the level from the React tree", () => {
    render(
      <HeadingLevel>
        {createPortal(<Heading>Portaled</Heading>, document.body)}
      </HeadingLevel>,
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
        <HeadingLevel offset={2}>
          <Probe name="nested" />
        </HeadingLevel>
        <HeadingLevel offset={9}>
          <Probe name="clamped" />
        </HeadingLevel>
      </>,
    );

    expect(screen.getByLabelText("root").textContent).toBe("1 h1");
    expect(screen.getByLabelText("nested").textContent).toBe("3 h3");
    expect(screen.getByLabelText("clamped").textContent).toBe("6 h6");
  });
});

describe("invalid values", () => {
  it.each([-1, 2.5, NaN, Infinity, null])(
    "HeadingLevel ignores offset %s",
    (offset) => {
      render(
        <HeadingLevel>
          <HeadingLevel offset={offset as number}>
            <Heading>Title</Heading>
          </HeadingLevel>
        </HeadingLevel>,
      );

      expect(screen.getByRole("heading", { name: "Title" }).tagName).toBe("H3");
    },
  );

  it.each([0, 2.5, NaN, Infinity, null])(
    "HeadingLevel ignores level %s",
    (level) => {
      render(
        <HeadingLevel>
          <HeadingLevel level={level as number}>
            <Heading>Title</Heading>
          </HeadingLevel>
        </HeadingLevel>,
      );

      expect(screen.getByRole("heading", { name: "Title" }).tagName).toBe("H3");
    },
  );
});
