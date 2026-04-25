import { render, screen } from "@testing-library/react";
import { act } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { asIso3 } from "../data/types";
import { useAppStore } from "../store/useAppStore";
import { useUrlSync } from "./useUrlSync";

function ProbeLocation() {
  const loc = useLocation();
  return <div data-testid="loc">{loc.pathname + loc.search}</div>;
}

function HomeProbe() {
  useUrlSync({ year: true, metric: true, region: true });
  return <ProbeLocation />;
}

function CompareProbe() {
  useUrlSync({ year: true, iso: true });
  return <ProbeLocation />;
}

function renderAt(path: string, element: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={element} />
        <Route path="/compare" element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("useUrlSync", () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });

  afterEach(() => {
    useAppStore.getState().reset();
  });

  it("hydrates store from URL on mount", () => {
    renderAt("/?year=2010&metric=pf_score&region=Western%20Europe", <HomeProbe />);
    const s = useAppStore.getState();
    expect(s.year).toBe(2010);
    expect(s.metric).toBe("pf_score");
    expect(s.region).toBe("Western Europe");
  });

  it("ignores invalid year, metric, region", () => {
    renderAt("/?year=9999&metric=bogus&region=Atlantis", <HomeProbe />);
    const s = useAppStore.getState();
    expect(s.year).toBe(2023);
    expect(s.metric).toBe("hf_score");
    expect(s.region).toBe("all");
  });

  it("writes store changes back to the URL", async () => {
    renderAt("/", <HomeProbe />);
    act(() => {
      useAppStore.getState().setYear(2015);
      useAppStore.getState().setMetric("ef_score");
    });
    const loc = await screen.findByTestId("loc");
    expect(loc.textContent).toContain("year=2015");
    expect(loc.textContent).toContain("metric=ef_score");
  });

  it("filters invalid iso codes from comparedIsos", () => {
    renderAt("/compare?iso=USA,CAN,FOO,GBR", <CompareProbe />);
    expect(useAppStore.getState().comparedIsos).toEqual(["USA", "CAN", "GBR"]);
  });

  it("compare route caps at 5 isos", () => {
    renderAt(
      "/compare?iso=USA,CAN,DEU,FRA,GBR,ITA,JPN",
      <CompareProbe />,
    );
    expect(useAppStore.getState().comparedIsos).toHaveLength(5);
  });

  it("only syncs requested params: home doesn't touch comparedIsos", () => {
    useAppStore.getState().setComparedFromList([asIso3("USA"), asIso3("CAN")]);
    renderAt("/?year=2010", <HomeProbe />);
    expect(useAppStore.getState().comparedIsos).toEqual(["USA", "CAN"]);
  });
});
