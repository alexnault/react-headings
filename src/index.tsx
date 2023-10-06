import React from "react";

type Level = 1 | 2 | 3 | 4 | 5 | 6;

type Heading = `h${Level}`;

type LevelContextValue = { level: Level; Component: Heading };

const LevelContext = React.createContext<LevelContextValue>({
  level: 1,
  Component: "h1",
});

/**
 * Returns the current heading and level.
 */
export function useLevel(): LevelContextValue {
  return React.useContext(LevelContext);
}

type HProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
> & {
  render?: (context: LevelContextValue) => React.ReactElement;
};

/**
 * Renders a dynamic HTML heading (h1, h2, etc.) or custom component according to the current level.
 */
export const H = React.forwardRef(function H(
  { render, ...props }: HProps,
  forwardedRef: React.ForwardedRef<HTMLHeadingElement>
): JSX.Element {
  const context = useLevel();

  if (render) {
    return render(context);
  }

  return <context.Component ref={forwardedRef} {...props} />;
});

type LevelProviderProps = {
  level?: Level;
  children?: React.ReactNode;
};

/**
 * TODO documentation
 */
export function LevelProvider({
  level = 1,
  children,
}: LevelProviderProps): JSX.Element {
  const value = {
    level,
    Component: `h${level}` as Heading,
  };

  return (
    <LevelContext.Provider value={value}>{children}</LevelContext.Provider>
  );
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
export function Section({ component, children }: SectionProps): JSX.Element {
  const { level } = useLevel();

  const nextLevel = Math.min(level + 1, 6) as Level;

  return (
    <>
      {component}
      <LevelProvider level={nextLevel}>{children}</LevelProvider>
    </>
  );
}
