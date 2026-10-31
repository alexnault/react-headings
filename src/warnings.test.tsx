import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Heading, Level } from "./index";

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
      <Level offset={6}>
        <Heading>Too deep</Heading>
      </Level>,
    );

    expect(warn).toHaveBeenCalledWith(
      "react-headings: Heading level 7 exceeds 6 and was clamped to h6.",
    );
  });

  it("does not warn at level 6", () => {
    render(
      <Level offset={5}>
        <Heading>Deepest</Heading>
      </Level>,
    );

    expect(warn).not.toHaveBeenCalled();
  });
});

describe("invalid value", () => {
  it("warns when Level receives an invalid offset", () => {
    render(<Level offset={1.5} />);

    expect(warn).toHaveBeenCalledWith(
      "react-headings: Level received invalid offset 1.5, treated as 1.",
    );
  });

  it("warns when Level receives an invalid level", () => {
    render(<Level level={-2} />);

    expect(warn).toHaveBeenCalledWith(
      "react-headings: Level received invalid level -2, treated as 1.",
    );
  });

  it("does not warn for valid values", () => {
    render(
      <>
        <Level offset={0} />
        <Level offset={3} />
        <Level level={2} />
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
        <Level>{children}</Level>
      </article>
    );
  }

  it("warns when a scope has deeper headings but none at its own level", async () => {
    render(
      <>
        <Heading>Page</Heading>
        <Level>
          <Level>
            <Heading>Too deep</Heading>
          </Level>
        </Level>
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
        <Level>
          <Card title="Chapter">
            <Card title="Sub" />
          </Card>
          <Card title="Other chapter" />
        </Level>
      </>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });

  it("warns when an offset above 1 skips levels", async () => {
    render(
      <>
        <Heading>Page</Heading>
        <Level offset={2}>
          <Heading>Skipped</Heading>
        </Level>
      </>,
    );
    await settle();

    expect(warn).toHaveBeenCalledWith(
      "react-headings: Skipped heading level 2: found a level 3 heading but no level 2 heading.",
    );
  });

  it("reports each gap once", async () => {
    render(
      <Level>
        <Heading>Chapter</Heading>
        <Level offset={2}>
          <Heading>Skipped</Heading>
        </Level>
      </Level>,
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
        <Level offset={0}>
          <Card title="Sub" />
        </Level>
      </Card>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });

  it("starts a fresh scope at a Level's own `level`", async () => {
    render(
      <Level offset={3}>
        <Level level={2}>
          <Card title="Dialog title">
            <Card title="Dialog part" />
          </Card>
        </Level>
      </Level>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });

  it("does not count headings under `level` toward the parent scope", async () => {
    render(
      <Card title="Page">
        <Level level={3}>
          <Card title="Dialog" />
        </Level>
      </Card>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });

  it("warns under `level` when its own level is skipped", async () => {
    render(
      <Level level={1}>
        <Level>
          <Card title="No h1" />
        </Level>
      </Level>,
    );
    await settle();

    expect(warn).toHaveBeenCalledWith(
      "react-headings: Skipped heading level 1: found a level 2 heading but no level 1 heading.",
    );
  });

  it("warns when the heading at a scope's level unmounts", async () => {
    function Chapter({ showTitle }: { showTitle: boolean }) {
      return (
        <Level>
          {showTitle && <Heading>Chapter</Heading>}
          <Level>
            <Card title="Sub" />
          </Level>
        </Level>
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
      <Level offset={-1}>
        <Level offset={8}>
          <Heading>Too deep</Heading>
        </Level>
        <Level offset={2}>
          <Heading>Skipped</Heading>
        </Level>
        <Level level={-1}>
          <Level>
            <Heading>Skipped in reset</Heading>
          </Level>
        </Level>
      </Level>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });
});
