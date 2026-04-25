import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { YearSliderControls } from "./YearSliderControls";

describe("YearSliderControls", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("advances the year while playing", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <YearSliderControls value={2010} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /play/i }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onChange).toHaveBeenCalledWith(2011);

    rerender(<YearSliderControls value={2011} onChange={onChange} />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onChange).toHaveBeenCalledWith(2012);
  });

  it("wraps from 2023 back to 2000", () => {
    const onChange = vi.fn();
    render(<YearSliderControls value={2023} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /play/i }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onChange).toHaveBeenCalledWith(2000);
  });

  it("pauses on manual slider input", () => {
    const onChange = vi.fn();
    render(<YearSliderControls value={2010} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /play/i }));
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();

    fireEvent.change(screen.getByRole("slider"), { target: { value: "2015" } });
    expect(onChange).toHaveBeenCalledWith(2015);
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });

  it("stops calling onChange after pause", () => {
    const onChange = vi.fn();
    render(<YearSliderControls value={2010} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /play/i }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    onChange.mockClear();
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
