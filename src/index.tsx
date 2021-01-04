import React from "react";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type Heading = `h${HeadingLevel}`;

const LevelContext = React.createContext<HeadingLevel>(1);

export function useLevel() {
  return React.useContext(LevelContext);
}

type LevelProps = {
  children: React.ReactNode;
};

export function Level({ children }: LevelProps) {
  const level = useLevel();

  const nextLevel = Math.min(level + 1, 6) as HeadingLevel;

  return (
    <LevelContext.Provider value={nextLevel}>{children}</LevelContext.Provider>
  );
}

type HProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
> & {
  render?: ({
    Component,
    level,
  }: {
    Component: Heading;
    level: HeadingLevel;
  }) => React.ReactElement;
};

export function H({ render, ...props }: HProps) {
  const level = useLevel();

  const Component = `h${level}` as Heading;

  if (render) {
    return render({ Component, level });
  }

  return <Component {...props} />;
}
