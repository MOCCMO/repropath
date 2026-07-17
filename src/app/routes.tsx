import { Navigate, Route, Routes } from "react-router-dom";
import { CheckpointWorkspacePage } from "../features/checkpoints/CheckpointWorkspacePage";
import { IntakePage } from "../features/intake/IntakePage";
import { PassportPage } from "../features/passport/PassportPage";
import { ReproductionMapPage } from "../features/reproduction-map/ReproductionMapPage";
import { paths } from "./paths";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<IntakePage />} />
      <Route path={paths.map} element={<ReproductionMapPage />} />
      <Route
        path={paths.checkpointRoute}
        element={<CheckpointWorkspacePage />}
      />
      <Route path={paths.passport} element={<PassportPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
