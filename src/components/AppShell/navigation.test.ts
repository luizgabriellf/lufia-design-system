import { findActiveNavKey, type ShellNavGroup } from "./navigation";

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
