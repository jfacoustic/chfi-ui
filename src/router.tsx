import { Outlet, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import Compare from "./pages/Compare";
import Countries from "./pages/Countries";
import CountryDetail from "./pages/CountryDetail";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<ShellLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/countries" element={<Countries />} />
        <Route path="/country/:iso" element={<CountryDetail />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
