import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Heading, HeadingOffset, HeadingReset } from "./index";

function settle() {
  return new Promise((resolve) => setTimeout(resolve));
}

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("overflow", () => {
  it("warns when a heading level exceeds 6", () => {
    render(
      <HeadingOffset offset={6}>
        <Heading>Too deep</Heading>
      </HeadingOffset>,
    );

    expect(warn).toHaveBeenCalledWith(
      "react-headings: Heading level 7 exceeds 6 and was clamped to h6.",
    );
  });

  it("does not warn at level 6", () => {
    render(
      <HeadingOffset offset={5}>
        <Heading>Deepest</Heading>
      </HeadingOffset>,
    );

    expect(warn).not.toHaveBeenCalled();
  });
});

describe("invalid offset", () => {
  it("warns when HeadingOffset receives an invalid offset", () => {
    render(<HeadingOffset offset={1.5} />);

    expect(warn).toHaveBeenCalledWith(
      "react-headings: HeadingOffset received invalid offset 1.5, treated as 1.",
    );
  });

  it("warns when HeadingReset receives an invalid offset", () => {
    render(<HeadingReset offset={-2} />);

    expect(warn).toHaveBeenCalledWith(
      "react-headings: HeadingReset received invalid offset -2, treated as 0.",
    );
  });

  it("does not warn for valid offsets", () => {
    render(
      <>
        <HeadingOffset offset={0} />
        <HeadingOffset offset={3} />
        <HeadingReset offset={1} />
      </>,
    );

    expect(warn).not.toHaveBeenCalled();
  });
});

describe("skipped level", () => {
  function Card({ title, children }: { title: string; children?: ReactNode }) {
    return (
      <article>
        <Heading>{title}</Heading>
        <HeadingOffset>{children}</HeadingOffset>
      </article>
    );
  }

  it("warns when a scope has deeper headings but none at its own level", async () => {
    render(
      <>
        <Heading>Page</Heading>
        <HeadingOffset>
          <HeadingOffset>
            <Heading>Too deep</Heading>
          </HeadingOffset>
        </HeadingOffset>
      </>,
    );
    await settle();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      "react-headings: Skipped heading level 2: found a level 3 heading but no level 2 heading.",
    );
  });

  it("does not warn for a complete outline", async () => {
    render(
      <>
        <Heading>Page</Heading>
        <HeadingOffset>
          <Card title="Chapter">
            <Card title="Sub" />
          </Card>
          <Card title="Other chapter" />
        </HeadingOffset>
      </>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });

  it("warns when an offset above 1 skips levels", async () => {
    render(
      <>
        <Heading>Page</Heading>
        <HeadingOffset offset={2}>
          <Heading>Skipped</Heading>
        </HeadingOffset>
      </>,
    );
    await settle();

    expect(warn).toHaveBeenCalledWith(
      "react-headings: Skipped heading level 2: found a level 3 heading but no level 2 heading.",
    );
  });

  it("reports each gap once", async () => {
    render(
      <HeadingOffset>
        <Heading>Chapter</Heading>
        <HeadingOffset offset={2}>
          <Heading>Skipped</Heading>
        </HeadingOffset>
      </HeadingOffset>,
    );
    await settle();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      "react-headings: Skipped heading level 3: found a level 4 heading but no level 3 heading.",
    );
  });

  it("does not treat offset 0 as a scope", async () => {
    render(
      <Card title="Chapter">
        <HeadingOffset offset={0}>
          <Card title="Sub" />
        </HeadingOffset>
      </Card>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });

  it("starts a fresh scope at a HeadingReset's own level", async () => {
    render(
      <HeadingOffset offset={3}>
        <HeadingReset offset={1}>
          <Card title="Dialog title">
            <Card title="Dialog part" />
          </Card>
        </HeadingReset>
      </HeadingOffset>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });

  it("does not count a HeadingReset's headings toward its parent scope", async () => {
    render(
      <Card title="Page">
        <HeadingReset offset={2}>
          <Card title="Dialog" />
        </HeadingReset>
      </Card>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });

  it("warns inside a HeadingReset that skips its own level", async () => {
    render(
      <HeadingReset>
        <HeadingOffset>
          <Card title="No h1" />
        </HeadingOffset>
      </HeadingReset>,
    );
    await settle();

    expect(warn).toHaveBeenCalledWith(
      "react-headings: Skipped heading level 1: found a level 2 heading but no level 1 heading.",
    );
  });

  it("warns when the heading at a scope's level unmounts", async () => {
    function Chapter({ showTitle }: { showTitle: boolean }) {
      return (
        <HeadingOffset>
          {showTitle && <Heading>Chapter</Heading>}
          <HeadingOffset>
            <Card title="Sub" />
          </HeadingOffset>
        </HeadingOffset>
      );
    }

    const { rerender } = render(<Chapter showTitle />);
    await settle();
    expect(warn).not.toHaveBeenCalled();

    rerender(<Chapter showTitle={false} />);
    await settle();

    expect(warn).toHaveBeenCalledWith(
      "react-headings: Skipped heading level 2: found a level 3 heading but no level 2 heading.",
    );
  });
});

describe("production", () => {
  it("does not warn", async () => {
    vi.stubEnv("NODE_ENV", "production");

    render(
      <HeadingOffset offset={-1}>
        <HeadingOffset offset={8}>
          <Heading>Too deep</Heading>
        </HeadingOffset>
        <HeadingOffset offset={2}>
          <Heading>Skipped</Heading>
        </HeadingOffset>
        <HeadingReset offset={-1}>
          <HeadingOffset>
            <Heading>Skipped in reset</Heading>
          </HeadingOffset>
        </HeadingReset>
      </HeadingOffset>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });
});
