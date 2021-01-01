import React from "react";
import { render } from "@testing-library/react";

import { H, Level, useLevel } from "./index";

describe("useLevel hook", () => {
  it("should be level 1 by default", () => {
    function MyComponent() {
      const level = useLevel();

      expect(level).toBe(1);

      return null;
    }

    render(<MyComponent />);
  });

  it("should be level 2 when 1 level down", () => {
    function MyComponent() {
      const level = useLevel();

      expect(level).toBe(2);

      return null;
    }

    render(
      <Level>
        <MyComponent />
      </Level>
    );
  });

  it("should be level 6 even if we are at level 7", () => {
    function MyComponent() {
      const level = useLevel();

      expect(level).toBe(6);

      return null;
    }

    render(
      <Level>
        <Level>
          <Level>
            <Level>
              <Level>
                <Level>
                  <MyComponent />
                </Level>
              </Level>
            </Level>
          </Level>
        </Level>
      </Level>
    );
  });
});

describe("H component", () => {
  it("should be level 1 by default", () => {
    const { getByText } = render(<H>My H1</H>);

    const headingEl = getByText("My H1");

    expect(headingEl.tagName).toBe("H1");
  });

  it("should be level 2 when 1 level down", () => {
    const { getByText } = render(
      <Level>
        <H>My H2</H>
      </Level>
    );

    const headingEl = getByText("My H2");

    expect(headingEl.tagName).toBe("H2");
  });

  it("should be level 6 even if we are at level 7", () => {
    const { getByText } = render(
      <Level>
        <Level>
          <Level>
            <Level>
              <Level>
                <Level>
                  <H>My H6</H>
                </Level>
              </Level>
            </Level>
          </Level>
        </Level>
      </Level>
    );

    const headingEl = getByText("My H6");

    expect(headingEl.tagName).toBe("H6");
  });

  it("should render custom component", () => {
    const { getByText } = render(
      <Level>
        <H>{(Component) => <Component>My H2</Component>}</H>
      </Level>
    );

    const headingEl = getByText("My H2");

    expect(headingEl.tagName).toBe("H2");
  });
});
