import React from "react";
import { render } from "@testing-library/react";

import { H, Level, useHeadings } from "./index";

describe("useHeadings hook", () => {
  it("should be level 1 by default", () => {
    function MyComponent() {
      const { level } = useHeadings();

      expect(level).toBe(1);

      return null;
    }

    render(<MyComponent />);
  });

  it("should be level 2 when 1 level down", () => {
    function MyComponent() {
      const { level } = useHeadings();

      expect(level).toBe(2);

      return null;
    }

    render(
      <Level>
        <MyComponent />
      </Level>
    );
  });

  it("should be level 6 when at level 7 or more", () => {
    function MyComponent() {
      const { level } = useHeadings();

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

  it("should be level 6 when at level 7 or more", () => {
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

  it("should forward HTML heading props", () => {
    const { getByText } = render(<H className="myClass">My H1</H>);

    const headingEl = getByText("My H1");

    expect(headingEl.className).toBe("myClass");
  });

  it("should render a custom component", () => {
    const { getByText } = render(
      <Level>
        <H render={() => <span>My H2</span>} />
      </Level>
    );

    const headingEl = getByText("My H2");

    expect(headingEl.tagName).toBe("SPAN");
  });

  it("should render a custom component based on arguments", () => {
    const { getByText } = render(
      <Level>
        <H
          render={({ Component, level }) => <Component>My H{level}</Component>}
        />
      </Level>
    );

    const headingEl = getByText("My H2");

    expect(headingEl.tagName).toBe("H2");
  });
});
