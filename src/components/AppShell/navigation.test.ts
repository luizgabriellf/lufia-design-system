import {
  SHELL_COUNT_CAP,
  findActiveNavKey,
  formatShellCount,
  parseShellState,
  serializeShellState,
  type ShellNavGroup,
} from "./navigation";

const groups: ShellNavGroup[] = [
  {
    key: "main",
    items: [
      { key: "home", label: "Home", href: "/" },
      { key: "settings", label: "Settings", href: "/settings" },
      { key: "billing", label: "Billing", href: "/settings/billing" },
      { key: "reports", label: "Reports", href: "/reports", exact: true },
      { key: "off", label: "Off", href: "/off", disabled: true },
      { key: "action", label: "Action" },
    ],
  },
];

describe("findActiveNavKey", () => {
  it("matches the equal path", () => {
    expect(findActiveNavKey(groups, "/settings")).toBe("settings");
  });

  it("matches pages under an item, and the most specific item wins", () => {
    expect(findActiveNavKey(groups, "/settings/profile")).toBe("settings");
    expect(findActiveNavKey(groups, "/settings/billing/invoices")).toBe("billing");
  });

  it("does not treat a shared prefix as a parent", () => {
    expect(findActiveNavKey(groups, "/settingsx")).toBeUndefined();
  });

  it("matches the root only exactly", () => {
    expect(findActiveNavKey(groups, "/")).toBe("home");
    expect(findActiveNavKey(groups, "/elsewhere")).toBeUndefined();
  });

  it("respects exact", () => {
    expect(findActiveNavKey(groups, "/reports")).toBe("reports");
    expect(findActiveNavKey(groups, "/reports/2024")).toBeUndefined();
  });

  it("ignores query strings, hashes and trailing slashes on both sides", () => {
    expect(findActiveNavKey(groups, "/settings/?tab=1#x")).toBe("settings");
  });

  it("skips disabled items and items without an href", () => {
    expect(findActiveNavKey(groups, "/off")).toBeUndefined();
  });

  it("has no current item without a path", () => {
    expect(findActiveNavKey(groups, undefined)).toBeUndefined();
  });

  it("lets a matcher take over", () => {
    expect(findActiveNavKey(groups, "/settings", (item) => item.key === "action")).toBe("action");
  });
});

describe("findActiveNavKey with match and sub-items", () => {
  const nested: ShellNavGroup[] = [
    {
      key: "main",
      items: [
        {
          key: "admin",
          label: "Admin",
          href: "/admin",
          items: [
            { key: "users", label: "Users", href: "/admin?section=users", match: "query" },
            { key: "audit", label: "Audit", href: "/admin?section=audit&view=log", match: "query" },
            {
              key: "deep",
              label: "Deep",
              href: "/admin/deep",
              items: [{ key: "ignored", label: "x", href: "/x" }],
            },
          ],
        },
        { key: "exact", label: "Exact", href: "/exact", match: "exact" },
        { key: "custom", label: "Custom", href: "/c", match: (current) => current.startsWith("/c?") },
      ],
    },
  ];

  it("matches a query item only when its parameters are in currentPath", () => {
    expect(findActiveNavKey(nested, "/admin?section=users")).toBe("users");
    expect(findActiveNavKey(nested, "/admin?page=2&section=users#top")).toBe("users");
    expect(findActiveNavKey(nested, "/admin?section=audit")).toBe("admin");
    expect(findActiveNavKey(nested, "/admin?view=log&section=audit")).toBe("audit");
    expect(findActiveNavKey(nested, "/admin")).toBe("admin");
    expect(findActiveNavKey(nested, "/admin/other?section=users")).toBe("admin");
  });

  it("finds sub-items by path, one level deep only", () => {
    expect(findActiveNavKey(nested, "/admin/deep/more")).toBe("deep");
    expect(findActiveNavKey(nested, "/x")).toBeUndefined();
  });

  it("treats match exact like exact", () => {
    expect(findActiveNavKey(nested, "/exact")).toBe("exact");
    expect(findActiveNavKey(nested, "/exact/child")).toBeUndefined();
  });

  it("hands the full currentPath to a match function, which beats the other matches", () => {
    expect(findActiveNavKey(nested, "/c?x=1")).toBe("custom");
    expect(findActiveNavKey(nested, "/c")).toBeUndefined();
  });

  it("asks isActive about a sub-item before the item that holds it", () => {
    expect(findActiveNavKey(nested, undefined, (item) => item.href?.startsWith("/admin") ?? false)).toBe(
      "users",
    );
  });
});

describe("formatShellCount", () => {
  it("hides nothing-to-show values", () => {
    for (const value of [undefined, 0, -3, 0.4, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(formatShellCount(value)).toBeUndefined();
    }
  });

  it("shows the number up to the cap and the cap with a plus above it", () => {
    expect(formatShellCount(1)).toBe("1");
    expect(formatShellCount(SHELL_COUNT_CAP)).toBe("99");
    expect(formatShellCount(SHELL_COUNT_CAP + 1)).toBe("99+");
    expect(formatShellCount(10, 9)).toBe("9+");
    expect(formatShellCount(9, 9)).toBe("9");
  });
});

describe("shell state cookie value", () => {
  it("round-trips the rail and the open groups", () => {
    const raw = serializeShellState({ collapsed: true, openGroups: ["insights", "a&b,c"] });
    expect(parseShellState(raw)).toEqual({ collapsed: true, openGroups: ["insights", "a&b,c"] });
  });

  it("tells an empty choice from no choice", () => {
    expect(parseShellState(serializeShellState({ collapsed: false, openGroups: [] }))).toEqual({
      collapsed: false,
      openGroups: [],
    });
    expect(parseShellState(serializeShellState({ collapsed: false, openGroups: undefined }))).toEqual({
      collapsed: false,
      openGroups: undefined,
    });
  });

  it("gives the defaults for a missing or malformed value", () => {
    for (const raw of [undefined, null, "", "garbage", "%E0%A4%A"]) {
      expect(parseShellState(raw)).toEqual({ collapsed: false, openGroups: undefined });
    }
  });

  it("writes only cookie-safe characters", () => {
    expect(serializeShellState({ collapsed: true, openGroups: ["a b;c"] })).not.toMatch(/[\s;,"\\]/);
  });
});
