import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useHotkey } from "./useHotkey";

describe("useHotkey", () => {
  it("invokes the handler when the key is pressed", () => {
    const handler = vi.fn();
    renderHook(() => useHotkey(handler, { key: "k" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }));
    expect(handler).toHaveBeenCalled();
  });

  it("requires meta/ctrl when meta=true", () => {
    const handler = vi.fn();
    renderHook(() => useHotkey(handler, { key: "k", meta: true }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }));
    expect(handler).not.toHaveBeenCalled();
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true }),
    );
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("removes the listener on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useHotkey(handler, { key: "k" }));
    unmount();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores keypresses when disabled", () => {
    const handler = vi.fn();
    renderHook(() => useHotkey(handler, { key: "k", disabled: true }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }));
    expect(handler).not.toHaveBeenCalled();
  });
});
