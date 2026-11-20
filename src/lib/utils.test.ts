import { describe, expect, it } from "vitest";
import { cn, getDistractors, pickRandom, shuffle } from "@/lib/utils";
import { seededRng } from "../../test/rng";

const items = Array.from({ length: 10 }, (_, i) => ({ id: `i${i}`, group: i % 3 }));

describe("shuffle", () => {
  it("returns a permutation and leaves the input untouched", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const copy = [...input];
    const out = shuffle(input, seededRng(1));
    expect(out).not.toBe(input);
    expect(input).toEqual(copy);
    expect([...out].sort()).toEqual(copy);
  });

  it("is deterministic for a given rng and handles empty / single arrays", () => {
    expect(shuffle([1, 2, 3, 4, 5], seededRng(7))).toEqual(shuffle([1, 2, 3, 4, 5], seededRng(7)));
    expect(shuffle([], seededRng(1))).toEqual([]);
    expect(shuffle(["a"], seededRng(1))).toEqual(["a"]);
  });

  it("can produce every ordering (no fixed positions)", () => {
    const rng = seededRng(42);
    const seen = new Set<string>();
    for (let i = 0; i < 300; i++) seen.add(shuffle([1, 2, 3], rng).join(""));
    expect(seen.size).toBe(6);
  });

  it("uses the last slot when rng returns values close to 1", () => {
    expect(shuffle([1, 2, 3], () => 0.999999)).toEqual([1, 2, 3]);
    expect(shuffle([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
  });
});

describe("pickRandom", () => {
  it("returns n distinct items from the array", () => {
    const out = pickRandom(items, 4, seededRng(3));
    expect(out).toHaveLength(4);
    expect(new Set(out).size).toBe(4);
    out.forEach((x) => expect(items).toContain(x));
  });

  it("returns every item when n exceeds the length, and nothing for n <= 0", () => {
    expect(pickRandom(items, 50, seededRng(3))).toHaveLength(items.length);
    expect(pickRandom(items, 0)).toEqual([]);
    expect(pickRandom(items, -2)).toEqual([]);
  });
});

describe("getDistractors", () => {
  it("never includes the correct item and has no duplicates", () => {
    for (let seed = 0; seed < 50; seed++) {
      const out = getDistractors(items, "i4", 3, { rng: seededRng(seed) });
      expect(out).toHaveLength(3);
      expect(out.map((x) => x.id)).not.toContain("i4");
      expect(new Set(out).size).toBe(3);
    }
  });

  it("applies the allow filter", () => {
    const out = getDistractors(items, "i0", 10, { allow: (x) => x.group !== 0 });
    expect(out.every((x) => x.group !== 0)).toBe(true);
    expect(out).toHaveLength(6);
  });

  it("returns fewer items when not enough candidates exist", () => {
    expect(getDistractors([{ id: "a" }, { id: "b" }], "a", 5)).toEqual([{ id: "b" }]);
    expect(getDistractors([{ id: "a" }], "a", 2)).toEqual([]);
  });
});

describe("cn", () => {
  it("joins truthy class names with single spaces", () => {
    expect(cn("a", undefined, "b", false, null, "", "c")).toBe("a b c");
    expect(cn()).toBe("");
  });
});
