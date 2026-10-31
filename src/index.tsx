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

type LevelProps = {
  level?: Level;
  children?: React.ReactNode;
};

/**
 * Renders `children` 1 level down, or at `level` when provided.
 * @param level The level to render `children` at
 * @param children The children to render
 */
function Level({ level: desiredLevel, children }: LevelProps): JSX.Element {
  const { level: currentLevel } = useLevel();

  const level = desiredLevel ?? (Math.min(currentLevel + 1, 6) as Level);

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
  level?: Level;
};

/**
 * Renders `component` in the current level and `children` in the next level.
 * @param component A component containing a heading
 * @param children The children in the next level
 * @param level A level to render `component` at instead of the current one (e.g. for dialogs and portals)
 */
export function Section({
  component,
  children,
  level,
}: SectionProps): JSX.Element {
  const content = (
    <>
      {component}
      <Level>{children}</Level>
    </>
  );

  return level ? <Level level={level}>{content}</Level> : content;
}
