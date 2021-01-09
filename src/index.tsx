import React from "react";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type Heading = `h${HeadingLevel}`;

type LevelContextValue = { level: HeadingLevel; Component: Heading };

const LevelContext = React.createContext<LevelContextValue>({
  level: 1,
  Component: "h1",
});

/**
 * Returns the current heading and level.
 */
export function useLevel() {
  return React.useContext(LevelContext);
}

type LevelProps = {
  children: React.ReactNode;
};

/**
 * Creates a new context 1 level down from current level.
 * Any H component rendered within this context will use its level.
 */
export function Level({ children }: LevelProps) {
  const { level } = useLevel();

  const nextLevel = Math.min(level + 1, 6) as HeadingLevel;

  const value = {
    level: nextLevel,
    Component: `h${nextLevel}` as Heading,
  };

  return (
    <LevelContext.Provider value={value}>{children}</LevelContext.Provider>
  );
}

type HProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
> & {
  render?: (context: LevelContextValue) => React.ReactElement;
};

/**
 * Renders a HTML heading (h1, h2, etc.) or a custom component according to the current level.
 */
export function H({ render, ...props }: HProps) {
  const context = useLevel();

  if (render) {
    return render(context);
  }

  return <context.Component {...props} />;
}

type SectionProps = {
  component: React.ReactNode;
  children?: React.ReactNode;
};

/**
 * Renders `component` in the current level and `children` in the next level.
 * @param component A component containing a heading
 * @param children The children in the next level
 */
export function Section({ component, children }: SectionProps) {
  return (
    <>
      {component}
      <Level>{children}</Level>
    </>
  );
}
