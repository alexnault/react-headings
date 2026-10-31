// @vitest-environment node
import { execFileSync, execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

function resolveWith(conditions: string[]) {
  const url = execFileSync(
    "node",
    [
      ...conditions.map((condition) => `--conditions=${condition}`),
      "--input-type=module",
      "-e",
      "console.log(import.meta.resolve('react-headings'))",
    ],
    { encoding: "utf8" }
  );
  return new URL(url.trim()).pathname.split("/").slice(-2).join("/");
}

beforeAll(() => {
  execSync("npm run build", { stdio: "ignore" });
}, 60_000);

describe("built package", () => {
  it("starts both builds with the use client directive", () => {
    expect(read("dist/index.js").startsWith('"use client";')).toBe(true);
    expect(read("dist/index.development.js").startsWith('"use client";')).toBe(
      true
    );
  });

  it("keeps dev warnings out of the production build only", () => {
    expect(read("dist/index.js")).not.toContain("react-headings:");
    expect(read("dist/index.development.js")).toContain("react-headings:");
  });

  it("resolves the development build only under the development condition", () => {
    expect(resolveWith([])).toBe("dist/index.js");
    expect(resolveWith(["development"])).toBe("dist/index.development.js");
  });
});
