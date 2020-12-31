import React from "react";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type Heading = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

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

type HProps = {
  children:
    | React.ReactNode
    | ((Component: Heading, level: HeadingLevel) => React.ReactElement);
};

export function H({ children }: HProps) {
  const level = useLevel();

  const Component = `h${level}` as Heading;

  if (typeof children === "function") {
    return children(Component, level);
  }

  return <Component>{children}</Component>;
}
