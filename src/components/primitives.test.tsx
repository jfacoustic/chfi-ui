import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { CountryFlag } from "./CountryFlag";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { METRIC_OPTION_COUNT } from "../data/metric-labels";
import { REGIONS } from "../data/regions";
import { MetricPicker } from "./MetricPicker";
import { RegionFilter } from "./RegionFilter";
import { ScoreBadge } from "./ScoreBadge";
import { Spinner } from "./Spinner";
import { Tooltip } from "./Tooltip";
import { YearSlider } from "./YearSlider";

describe("Spinner", () => {
  it("renders with role status and label", () => {
    render(<Spinner label="Loading data" />);
    expect(screen.getByRole("status")).toHaveAccessibleName("Loading data");
  });
});

describe("LoadingState", () => {
  it("renders the message", () => {
    render(<LoadingState message="Fetching…" />);
    expect(screen.getByText("Fetching…")).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("renders message and triggers retry on click", async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="boom" onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("boom");
    await userEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("hides retry button when no handler is provided", () => {
    render(<ErrorState message="boom" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders the message", () => {
    render(<EmptyState message="No results" />);
    expect(screen.getByText("No results")).toBeInTheDocument();
  });
});

describe("Card", () => {
  it("renders children with provided className", () => {
    render(
      <Card className="extra" data-testid="card">
        hi
      </Card>,
    );
    const el = screen.getByTestId("card");
    expect(el).toHaveTextContent("hi");
    expect(el.className).toMatch(/extra/);
  });
});

describe("Badge", () => {
  it("renders with tone-specific classes", () => {
    render(<Badge tone="green">good</Badge>);
    const el = screen.getByText("good");
    expect(el.className).toMatch(/emerald/);
  });
});

describe("ScoreBadge", () => {
  it("renders the score with two decimals when present", () => {
    render(<ScoreBadge score={8.7} quartile={1} />);
    expect(screen.getByText("8.70")).toBeInTheDocument();
  });

  it("renders 'No data' when score is null", () => {
    render(<ScoreBadge score={null} quartile={null} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });
});

describe("CountryFlag", () => {
  it("renders the flag image for a known ISO3", () => {
    render(<CountryFlag iso="USA" />);
    const img = screen.getByRole("img", { name: /USA flag/i }) as HTMLImageElement;
    expect(img.src).toContain("flagcdn.com");
    expect(img.src).toContain("us.png");
  });

  it("falls back to a placeholder for an unknown ISO3", () => {
    render(<CountryFlag iso="XYZ" />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});

describe("Tooltip", () => {
  it("shows on focus and hides on blur", async () => {
    render(
      <Tooltip label="Hello">
        <button type="button">trigger</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    // Focus bubbles up to the wrapper span which owns onFocus/onBlur.
    fireEvent.focus(trigger);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Hello");
    fireEvent.blur(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});

describe("MetricPicker", () => {
  it("renders 15 options grouped into 3 sections", () => {
    render(<MetricPicker value="hf_score" onChange={() => {}} />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.querySelectorAll("optgroup").length).toBe(3);
    expect(select.querySelectorAll("option").length).toBe(METRIC_OPTION_COUNT);
    expect(METRIC_OPTION_COUNT).toBe(15);
  });

  it("fires onChange with the new metric key", async () => {
    const onChange = vi.fn();
    render(<MetricPicker value="hf_score" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "pf_score");
    expect(onChange).toHaveBeenCalledWith("pf_score");
  });
});

describe("RegionFilter", () => {
  it("renders 11 chips (10 regions + All)", () => {
    render(<RegionFilter value="all" onChange={() => {}} />);
    expect(screen.getAllByRole("button")).toHaveLength(REGIONS.length + 1);
  });

  it("toggles selection on click", async () => {
    const onChange = vi.fn();
    render(<RegionFilter value="all" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /North America/i }));
    expect(onChange).toHaveBeenCalledWith("North America");
  });

  it("clicking the active region clears back to 'all'", async () => {
    const onChange = vi.fn();
    render(<RegionFilter value="Western Europe" onChange={onChange} />);
    await userEvent.click(
      screen.getByRole("button", { name: /Western Europe/i }),
    );
    expect(onChange).toHaveBeenCalledWith("all");
  });
});

describe("YearSlider", () => {
  it("renders a labeled range input with the current year", () => {
    render(<YearSlider value={2010} onChange={() => {}} />);
    const input = screen.getByRole("slider") as HTMLInputElement;
    expect(input.value).toBe("2010");
    expect(screen.getByText("2010")).toBeInTheDocument();
  });

  it("calls onChange with the next year", () => {
    const onChange = vi.fn();
    render(<YearSlider value={2010} onChange={onChange} />);
    const input = screen.getByRole("slider") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2015" } });
    expect(onChange).toHaveBeenCalledWith(2015);
  });
});
