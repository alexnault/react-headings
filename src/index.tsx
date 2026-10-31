"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
} from "react";
import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ReactElement,
  ReactNode,
} from "react";

type Level = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingState = { level: Level; tag: `h${Level}` };

export type HeadingProps = ComponentPropsWithoutRef<"h1"> & {
  render?: (
    props: ComponentPropsWithRef<"h1">,
    state: HeadingState,
  ) => ReactElement;
};

export type HeadingOffsetProps = { offset?: number; children?: ReactNode };

export type HeadingResetProps = HeadingOffsetProps;

// Unclamped, so dev checks can see levels above 6.
const LevelContext = createContext(1);

function normalizeOffset(offset: number): number {
  return Number.isFinite(offset) && offset > 0 ? Math.floor(offset) : 0;
}

/**
 * Renders an `h1`–`h6` according to the current level.
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading({ render, ...props }, ref) {
    const { level, tag } = useHeadingLevel();

    if (process.env.NODE_ENV !== "production") {
      // The condition is constant per build, so hook order is stable.
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useHeadingChecks();
    }

    if (render) {
      // Handing the ref to `render` is the point; it is not read here.
      // eslint-disable-next-line react-hooks/refs
      return render({ ...props, ref }, { level, tag });
    }

    const Tag = tag;
    return <Tag ref={ref} {...props} />;
  },
);

Heading.displayName = "Heading";

export { Heading as H };

/**
 * Renders headings inside `offset` levels deeper (default 1).
 */
export function HeadingOffset({ offset = 1, children }: HeadingOffsetProps) {
  const parentLevel = useContext(LevelContext);
  const normalized = normalizeOffset(offset);
  const level = parentLevel + normalized;

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useInvalidOffsetWarning("HeadingOffset", offset, normalized);

    if (normalized > 0) {
      children = (
        <SkippedLevelScope start={parentLevel + 1}>
          {children}
        </SkippedLevelScope>
      );
    }
  }

  return (
    <LevelContext.Provider value={level}>{children}</LevelContext.Provider>
  );
}

/**
 * Discards ancestor offsets, then renders headings inside `offset` levels
 * deeper than h1 (default 0).
 */
export function HeadingReset({ offset = 0, children }: HeadingResetProps) {
  const normalized = normalizeOffset(offset);
  const level = 1 + normalized;

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useInvalidOffsetWarning("HeadingReset", offset, normalized);

    children = (
      <SkippedLevelScope start={level} isolated>
        {children}
      </SkippedLevelScope>
    );
  }

  return (
    <LevelContext.Provider value={level}>{children}</LevelContext.Provider>
  );
}

/**
 * Returns the level and tag a `Heading` would render at this position.
 */
export function useHeadingLevel(): HeadingState {
  const level = Math.min(useContext(LevelContext), 6) as Level;
  return { level, tag: `h${level}` };
}

// Dev-only checks below. Every call site is guarded by a NODE_ENV check, so
// the production build drops them.

type ScopeRegistry = { register(level: number): () => void };

const ScopeContext = /* @__PURE__ */ createContext<ScopeRegistry | null>(null);

/**
 * Collects the heading levels rendered inside a HeadingOffset or HeadingReset
 * and warns if one between `start` and the deepest is missing. A non-empty
 * nested scope counts as a heading at its own `start` in its parent, so each
 * gap is reported by exactly one scope.
 */
function createScopeRegistry(
  start: number,
  parent: ScopeRegistry | null,
): ScopeRegistry {
  const levels = new Map<object, number>();
  let unregisterFromParent: (() => void) | undefined;
  let checkScheduled = false;
  let warned = false;

  function check() {
    checkScheduled = false;
    if (warned || levels.size === 0) return;

    const present = new Set(levels.values());
    const deepest = Math.max(...present);
    for (let level = start; level < deepest; level++) {
      if (!present.has(level)) {
        warned = true;
        console.warn(
          `react-headings: Skipped heading level ${level}: found a level ${deepest} heading but no level ${level} heading.`,
        );
        return;
      }
    }
  }

  // Effects of a whole commit run before microtasks, so the check sees the
  // complete tree instead of whichever heading registered first.
  function scheduleCheck() {
    if (checkScheduled) return;
    checkScheduled = true;
    queueMicrotask(check);
  }

  return {
    register(level) {
      const token = {};
      levels.set(token, level);
      if (levels.size === 1) {
        unregisterFromParent = parent?.register(start);
      }
      scheduleCheck();

      return () => {
        levels.delete(token);
        if (levels.size === 0) {
          unregisterFromParent?.();
          unregisterFromParent = undefined;
        }
        scheduleCheck();
      };
    },
  };
}

function SkippedLevelScope({
  start,
  isolated = false,
  children,
}: {
  start: number;
  isolated?: boolean;
  children: ReactNode;
}) {
  const parent = useContext(ScopeContext);
  const registry = useMemo(
    () => createScopeRegistry(start, isolated ? null : parent),
    [start, isolated, parent],
  );

  return (
    <ScopeContext.Provider value={registry}>{children}</ScopeContext.Provider>
  );
}

function useHeadingChecks() {
  const level = useContext(LevelContext);
  const scope = useContext(ScopeContext);

  useEffect(() => {
    if (level > 6) {
      console.warn(
        `react-headings: Heading level ${level} exceeds 6 and was clamped to h6.`,
      );
    }
  }, [level]);

  useEffect(() => scope?.register(level), [scope, level]);
}

function useInvalidOffsetWarning(
  component: "HeadingOffset" | "HeadingReset",
  offset: number,
  normalized: number,
) {
  useEffect(() => {
    if (offset !== normalized) {
      console.warn(
        `react-headings: ${component} received invalid offset ${offset}, treated as ${normalized}.`,
      );
    }
  }, [component, offset, normalized]);
}
