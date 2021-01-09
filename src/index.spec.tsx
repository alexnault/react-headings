import React from "react";
import { render } from "@testing-library/react";

import { H, Level, Section, useHeadings } from "./index";

describe("useHeadings hook", () => {
  it("should be level 1 by default", () => {
    function MyComponent() {
      const { level, Component } = useHeadings();

      expect(level).toBe(1);
      expect(Component).toBe("h1");

      return null;
    }

    render(<MyComponent />);
  });

  it("should be level 2 when 1 level down", () => {
    function MyComponent() {
      const { level, Component } = useHeadings();

      expect(level).toBe(2);
      expect(Component).toBe("h2");

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
      const { level, Component } = useHeadings();

      expect(level).toBe(6);
      expect(Component).toBe("h6");

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
                  <H>My H6-2</H>
                </Level>
              </Level>
            </Level>
          </Level>
        </Level>
      </Level>
    );

    const headingEl = getByText("My H6-2");

    expect(headingEl.tagName).toBe("H6");
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

describe("Section component", () => {
  it("should be level 1 by default", () => {
    const { getByText } = render(<Section component={<H>My H1</H>} />);

    const headingEl = getByText("My H1");

    expect(headingEl.tagName).toBe("H1");
  });

  it("should be level 2 when 1 level down", () => {
    const { getByText } = render(
      <Section component={<H>My H1</H>}>
        <Section component={<H>My H2</H>}></Section>
      </Section>
    );

    const headingEl = getByText("My H2");

    expect(headingEl.tagName).toBe("H2");
  });

  it("should be level 6 when at level 7 or more", () => {
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
