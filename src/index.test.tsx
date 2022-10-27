import React from "react";
import { render } from "@testing-library/react";

import { H, Section, useLevel } from "./index";

describe("useLevel hook", () => {
  it("should be level 1 by default", () => {
    function MyComponent() {
      const { level, Component } = useLevel();

      expect(level).toBe(1);
      expect(Component).toBe("h1");

      return null;
    }

    render(<MyComponent />);
  });

  it("should be level 2 when 1 level down", () => {
    function MyComponent() {
      const { level, Component } = useLevel();

      expect(level).toBe(2);
      expect(Component).toBe("h2");

      return null;
    }

    render(
      <Section component={<H>My H1</H>}>
        <MyComponent />
      </Section>
    );
  });

  it("should be level 6 when at level 7 or more", () => {
    function MyComponent() {
      const { level, Component } = useLevel();

      expect(level).toBe(6);
      expect(Component).toBe("h6");

      return null;
    }

    render(
      <Section component={<H>My H1</H>}>
        <Section component={<H>My H2</H>}>
          <Section component={<H>My H3</H>}>
            <Section component={<H>My H4</H>}>
              <Section component={<H>My H5</H>}>
                <Section component={<H>My H6</H>}>
                  <Section component={<H>My H6-2</H>}>
                    <MyComponent />
                  </Section>
                </Section>
              </Section>
            </Section>
          </Section>
        </Section>
      </Section>
    );
  });
});

describe("H component", () => {
  it("should be level 1 by default", () => {
    const { getByText } = render(<H>My H1</H>);

    const headingEl = getByText("My H1");

    expect(headingEl.tagName).toBe("H1");
  });

  it("should forward HTML heading props", () => {
    const { getByText } = render(<H className="myClass">My H1</H>);

    const headingEl = getByText("My H1");

    expect(headingEl.className).toBe("myClass");
  });

  it("should render a custom component", () => {
    const { getByText } = render(<H render={() => <span>My span</span>} />);

    const headingEl = getByText("My span");

    expect(headingEl.tagName).toBe("SPAN");
  });

  it("should render a custom component based on arguments", () => {
    const { getByText } = render(
      <Section component={<H>My H1</H>}>
        <Section
          component={
            <H
              render={({ Component, level }) => (
                <Component>My H{level}</Component>
              )}
            />
          }
        ></Section>
      </Section>
    );

    const headingEl = getByText("My H2");

    expect(headingEl.tagName).toBe("H2");
  });

  it("should forward ref", () => {
    const ref = React.createRef<HTMLHeadingElement>();
    const { container } = render(<H ref={ref}>Heading</H>);
    expect(ref.current).toBe(container.firstElementChild);
  });
});

describe("Section component", () => {
  it("should be level 1 in first section", () => {
    const { getByText } = render(<Section component={<H>My H1</H>}></Section>);

    const headingEl = getByText("My H1");

    expect(headingEl.tagName).toBe("H1");
  });

  it("should be level 2 in second section", () => {
    const { getByText } = render(
      <Section component={<H>My H1</H>}>
        <Section component={<H>My H2</H>}></Section>
      </Section>
    );

    const headingEl = getByText("My H2");

    expect(headingEl.tagName).toBe("H2");
  });

  it("should be level 6 in 7th section", () => {
    const { getByText } = render(
      <Section component={<H>My H1</H>}>
        <Section component={<H>My H2</H>}>
          <Section component={<H>My H3</H>}>
            <Section component={<H>My H4</H>}>
              <Section component={<H>My H5</H>}>
                <Section component={<H>My H6</H>}>
                  <Section component={<H>My H6-2</H>}></Section>
                </Section>
              </Section>
            </Section>
          </Section>
        </Section>
      </Section>
    );

    const headingEl = getByText("My H6-2");

    expect(headingEl.tagName).toBe("H6");
  });

  it("should render a heading and its content", () => {
    const { getByText } = render(
      <Section component={<H>My H1</H>}>
        <p>My content</p>
      </Section>
    );

    const headingEl = getByText("My H1");

    expect(headingEl.tagName).toBe("H1");

    const pEl = getByText("My content");

    expect(pEl.tagName).toBe("P");
  });
});
