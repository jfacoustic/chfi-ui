import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScoreCards } from "./ScoreCards";

describe("ScoreCards", () => {
  it("renders three score cards with formatted scores", () => {
    render(
      <ScoreCards
        year={2023}
        hf={{ score: 8.7, rank: 17, quartile: 1 }}
        pf={{ score: 8.85, rank: 25 }}
        ef={{ score: 8.56, rank: 5 }}
      />,
    );
    // HF score appears in both the headline number and the ScoreBadge,
    // so we just assert at least one and check the unique siblings.
    expect(screen.getAllByText("8.70").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("8.85")).toBeInTheDocument();
    expect(screen.getByText("8.56")).toBeInTheDocument();
    expect(screen.getByText(/Rank 17/i)).toBeInTheDocument();
  });

  it("shows '—' for null scores and omits rank when null", () => {
    render(
      <ScoreCards
        year={2010}
        hf={{ score: null, rank: null, quartile: null }}
        pf={{ score: null, rank: null }}
        ef={{ score: null, rank: null }}
      />,
    );
    // Three cards plus the badge fallback all show "—" or "No data"
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText(/Rank /i)).toBeNull();
  });
});
