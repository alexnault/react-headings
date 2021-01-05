import React from "react";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type Heading = `h${HeadingLevel}`;

type HeadingContextValue = { level: HeadingLevel; Component: Heading };

const HeadingContext = React.createContext<HeadingContextValue>({
  level: 1,
  Component: "h1",
});

/**
 * Returns the current heading and level.
 */
export function useHeadings() {
  return React.useContext(HeadingContext);
}

type LevelProps = {
  children: React.ReactNode;
};

/**
 * Creates a new context 1 level down from current level.
 * Any H component rendered within this context will use its level.
 */
export function Level({ children }: LevelProps) {
  const { level } = useHeadings();

  const nextLevel = Math.min(level + 1, 6) as HeadingLevel;

  const value = {
    level: nextLevel,
    Component: `h${nextLevel}` as Heading,
  };

  return (
    <HeadingContext.Provider value={value}>{children}</HeadingContext.Provider>
  );
}

type HProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
> & {
  render?: (context: HeadingContextValue) => React.ReactElement;
};

/**
 * Renders a HTML heading (h1, h2, etc.) or a custom component according to the current level.
 */
export function H({ render, ...props }: HProps) {
  const context = useHeadings();

  if (render) {
    return render(context);
  }

  return <context.Component {...props} />;
}
