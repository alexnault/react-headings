import { act, cleanup, render } from "@testing-library/react";
import { lazy, Suspense } from "react";
import type { ComponentType, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Heading, HeadingLevel } from "./index";

function settle() {
  return vi.runAllTimersAsync();
}

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("overflow", () => {
  it("warns when a heading level exceeds 6", () => {
    render(
      <HeadingLevel offset={6}>
        <Heading>Too deep</Heading>
      </HeadingLevel>,
    );

    expect(warn).toHaveBeenCalledWith(
      "react-headings: Heading level 7 exceeds 6 and was clamped to h6.",
    );
  });

  it("does not warn at level 6", () => {
    render(
      <HeadingLevel offset={5}>
        <Heading>Deepest</Heading>
      </HeadingLevel>,
    );

    expect(warn).not.toHaveBeenCalled();
  });
});

describe("invalid value", () => {
  it("warns when HeadingLevel receives an invalid offset", () => {
    render(<HeadingLevel offset={1.5} />);

    expect(warn).toHaveBeenCalledWith(
      "react-headings: HeadingLevel received invalid offset 1.5, treated as 1.",
    );
  });

  it("warns when HeadingLevel receives an invalid level", () => {
    render(<HeadingLevel level={-2} />);

    expect(warn).toHaveBeenCalledWith(
      "react-headings: HeadingLevel received invalid level -2, treated as 1.",
    );
  });

  it("does not warn for valid values", () => {
    render(
      <>
        <HeadingLevel offset={0} />
        <HeadingLevel offset={3} />
        <HeadingLevel level={2} />
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
        <HeadingLevel>{children}</HeadingLevel>
      </article>
    );
  }

  it("warns when a scope has deeper headings but none at its own level", async () => {
    render(
      <>
        <Heading>Page</Heading>
        <HeadingLevel>
          <HeadingLevel>
            <Heading>Too deep</Heading>
          </HeadingLevel>
        </HeadingLevel>
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
        <HeadingLevel>
          <Card title="Chapter">
            <Card title="Sub" />
          </Card>
          <Card title="Other chapter" />
        </HeadingLevel>
      </>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });

  it("warns when an offset above 1 skips levels", async () => {
    render(
      <>
        <Heading>Page</Heading>
        <HeadingLevel offset={2}>
          <Heading>Skipped</Heading>
        </HeadingLevel>
      </>,
    );
    await settle();

    expect(warn).toHaveBeenCalledWith(
      "react-headings: Skipped heading level 2: found a level 3 heading but no level 2 heading.",
    );
  });

  it("reports each gap once", async () => {
    render(
      <HeadingLevel>
        <Heading>Chapter</Heading>
        <HeadingLevel offset={2}>
          <Heading>Skipped</Heading>
        </HeadingLevel>
      </HeadingLevel>,
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
        <HeadingLevel offset={0}>
          <Card title="Sub" />
        </HeadingLevel>
      </Card>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });

  it("starts a fresh scope at a HeadingLevel's own `level`", async () => {
    render(
      <HeadingLevel offset={3}>
        <HeadingLevel level={2}>
          <Card title="Dialog title">
            <Card title="Dialog part" />
          </Card>
        </HeadingLevel>
      </HeadingLevel>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });

  it("does not count headings under `level` toward the parent scope", async () => {
    render(
      <Card title="Page">
        <HeadingLevel level={3}>
          <Card title="Dialog" />
        </HeadingLevel>
      </Card>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });

  it("warns under `level` when its own level is skipped", async () => {
    render(
      <HeadingLevel level={1}>
        <HeadingLevel>
          <Card title="No h1" />
        </HeadingLevel>
      </HeadingLevel>,
    );
    await settle();

    expect(warn).toHaveBeenCalledWith(
      "react-headings: Skipped heading level 1: found a level 2 heading but no level 1 heading.",
    );
  });

  it("warns when the heading at a scope's level unmounts", async () => {
    function Chapter({ showTitle }: { showTitle: boolean }) {
      return (
        <HeadingLevel>
          {showTitle && <Heading>Chapter</Heading>}
          <HeadingLevel>
            <Card title="Sub" />
          </HeadingLevel>
        </HeadingLevel>
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

  it("warns at most once per scope", async () => {
    function Chapter({ sectionCount }: { sectionCount: number }) {
      return (
        <HeadingLevel>
          {Array.from({ length: sectionCount }, (_, index) => (
            <HeadingLevel key={index}>
              <Heading>Too deep</Heading>
            </HeadingLevel>
          ))}
        </HeadingLevel>
      );
    }

    const { rerender } = render(<Chapter sectionCount={1} />);
    await settle();
    rerender(<Chapter sectionCount={2} />);
    await settle();

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("counts headings that render in a later commit", async () => {
    let resolveTitle!: (titleModule: { default: ComponentType }) => void;
    const Title = lazy(
      () =>
        new Promise<{ default: ComponentType }>((resolve) => {
          resolveTitle = resolve;
        }),
    );

    render(
      <HeadingLevel>
        <Suspense fallback={null}>
          <Title />
        </Suspense>
        <HeadingLevel>
          <Heading>Sub</Heading>
        </HeadingLevel>
      </HeadingLevel>,
    );
    await act(async () => {
      resolveTitle({ default: () => <Heading>Title</Heading> });
    });
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });
});

describe("production", () => {
  it("does not warn", async () => {
    vi.stubEnv("NODE_ENV", "production");

    render(
      <HeadingLevel offset={-1}>
        <HeadingLevel offset={8}>
          <Heading>Too deep</Heading>
        </HeadingLevel>
        <HeadingLevel offset={2}>
          <Heading>Skipped</Heading>
        </HeadingLevel>
        <HeadingLevel level={-1}>
          <HeadingLevel>
            <Heading>Skipped in reset</Heading>
          </HeadingLevel>
        </HeadingLevel>
      </HeadingLevel>,
    );
    await settle();

    expect(warn).not.toHaveBeenCalled();
  });
});
