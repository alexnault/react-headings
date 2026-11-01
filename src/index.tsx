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

type Tag = `h${Level}`;

export type HeadingProps = ComponentPropsWithoutRef<"h1"> & {
  render?: (
    props: ComponentPropsWithRef<"h1">,
    heading: { level: Level; tag: Tag },
  ) => ReactElement;
};

export type HeadingLevelProps = { children?: ReactNode } & (
  { offset?: number; level?: never } | { level: number; offset?: never }
);

// Unclamped, so dev checks can see levels above 6.
const LevelContext = createContext(1);

function isValidOffset(offset: number): boolean {
  return Number.isInteger(offset) && offset >= 0;
}

function isValidLevel(level: number | undefined): level is number {
  return Number.isInteger(level) && (level as number) >= 1;
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
 * Renders headings inside `offset` levels deeper (default 1), or at `level`
 * regardless of ancestors.
 */
export function HeadingLevel({
  offset = 1,
  level,
  children,
}: HeadingLevelProps) {
  const parentLevel = useContext(LevelContext);
  // Invalid values are ignored, as if not passed.
  const isReset = isValidLevel(level);
  const isOffsetValid = isValidOffset(offset);
  const innerLevel = isReset
    ? level
    : parentLevel + (isOffsetValid ? offset : 1);

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useInvalidPropWarning("offset", offset, isOffsetValid);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useInvalidPropWarning("level", level, isReset);

    // Always rendered, so toggling `offset` or `level` keeps children mounted.
    children = (
      <SkippedLevelScope
        firstLevel={isReset ? innerLevel : parentLevel + 1}
        isIsolated={isReset}
        isPassthrough={!isReset && offset === 0}
      >
        {children}
      </SkippedLevelScope>
    );
  }

  return (
    <LevelContext.Provider value={innerLevel}>{children}</LevelContext.Provider>
  );
}

/**
 * Returns the level and tag a `Heading` would render at this position.
 */
export function useHeadingLevel(): { level: Level; tag: Tag } {
  const level = Math.min(useContext(LevelContext), 6) as Level;
  return { level, tag: `h${level}` };
}

// Dev-only checks below. Every call site is guarded by a NODE_ENV check, so
// the production build drops them.

type ScopeRegistry = { register(level: number): () => void };

const ScopeContext = /* @__PURE__ */ createContext<ScopeRegistry | null>(null);

/**
 * Collects the heading levels rendered inside a HeadingLevel and warns if one between `firstLevel` and the deepest is missing. A
 * non-empty nested scope counts as a heading at its own `firstLevel` in its
 * parent, so each gap is reported by exactly one scope.
 */
function createScopeRegistry(
  firstLevel: number,
  parentRegistry: ScopeRegistry | null,
): ScopeRegistry {
  const headingLevels = new Map<object, number>();
  let unregisterFromParent: (() => void) | undefined;
  let isCheckScheduled = false;
  let hasWarned = false;

  function warnIfLevelSkipped() {
    isCheckScheduled = false;
    if (hasWarned || headingLevels.size === 0) return;

    const presentLevels = new Set(headingLevels.values());
    const deepestLevel = Math.max(...presentLevels);
    for (let level = firstLevel; level < deepestLevel; level++) {
      if (!presentLevels.has(level)) {
        hasWarned = true;
        console.warn(
          `react-headings: Skipped heading level ${level}: found a level ${deepestLevel} heading but no level ${level} heading.`,
        );
        return;
      }
    }
  }

  // Effects of a whole commit run before microtasks, so the check sees the
  // complete tree instead of whichever heading registered first.
  function scheduleCheck() {
    if (isCheckScheduled) return;
    isCheckScheduled = true;
    queueMicrotask(warnIfLevelSkipped);
  }

  return {
    register(level) {
      const token = {};
      headingLevels.set(token, level);
      if (headingLevels.size === 1) {
        unregisterFromParent = parentRegistry?.register(firstLevel);
      }
      scheduleCheck();

      return () => {
        headingLevels.delete(token);
        if (headingLevels.size === 0) {
          unregisterFromParent?.();
          unregisterFromParent = undefined;
        }
        scheduleCheck();
      };
    },
  };
}

function SkippedLevelScope({
  firstLevel,
  isIsolated,
  isPassthrough,
  children,
}: {
  firstLevel: number;
  isIsolated: boolean;
  isPassthrough: boolean;
  children: ReactNode;
}) {
  const parentRegistry = useContext(ScopeContext);
  const registry = useMemo(
    () =>
      isPassthrough
        ? parentRegistry
        : createScopeRegistry(firstLevel, isIsolated ? null : parentRegistry),
    [firstLevel, isIsolated, isPassthrough, parentRegistry],
  );

  return (
    <ScopeContext.Provider value={registry}>{children}</ScopeContext.Provider>
  );
}

function useHeadingChecks() {
  const level = useContext(LevelContext);
  const scopeRegistry = useContext(ScopeContext);

  useEffect(() => {
    if (level > 6) {
      console.warn(
        `react-headings: Heading level ${level} exceeds 6 and was clamped to h6.`,
      );
    }
  }, [level]);

  useEffect(() => scopeRegistry?.register(level), [scopeRegistry, level]);
}

function useInvalidPropWarning(
  prop: "offset" | "level",
  value: number | undefined,
  isValid: boolean,
) {
  useEffect(() => {
    // `null` means not passed, like `undefined`.
    if (value != null && !isValid) {
      console.warn(
        `react-headings: HeadingLevel received invalid ${prop} ${value}, ignored.`,
      );
    }
  }, [prop, value, isValid]);
}
