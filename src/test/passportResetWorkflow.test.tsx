import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppErrorBoundary } from "../app/AppErrorBoundary";
import { checkpointPath, paths } from "../app/paths";
import { AppRoutes } from "../app/routes";
import { deriveCheckpointStatuses } from "../domain/fullProtocolRules";
import { generatePassport, passportV2Schema } from "../domain/passportGenerator";
import { ProjectProvider } from "../state/ProjectProvider";
import { createFullProtocolProjectFromDemo } from "../state/projectReducer";
import { loadProject, saveProject } from "../state/storage";
import {
  demoFixture,
  fixedTimestamp,
  verifiedFullProtocolProjectFixture
} from "./fixtures/projects";

function LocationProbe() {
  return <output data-testid="location-probe">{useLocation().pathname}</output>;
}

function renderRoute(path: string) {
  return render(
    <ProjectProvider>
      <MemoryRouter initialEntries={[path]}>
        <LocationProbe />
        <AppRoutes />
      </MemoryRouter>
    </ProjectProvider>
  );
}

function modifiedProject() {
  const project = verifiedFullProtocolProjectFixture();
  project.updatedAt = "2026-07-17T08:05:00.000Z";
  project.checkpoints["run-minimal-target"].evidence.localResult = 0.5;
  project.checkpoints["run-minimal-target"].evidence.provenance =
    "verified_seed_modified_by_learner";
  project.checkpoints["compare-results"].evidence.localResult = 0.5;
  project.checkpoints["compare-results"].evidence.provenance =
    "verified_seed_modified_by_learner";
  project.checkpoints["record-gaps"].evidence.learnerNotes = "Learner note";
  project.checkpoints["record-gaps"].evidence.gaps.push({
    id: "learner-gap",
    description: "Learner-created gap",
    impactOnClaim: "Limits an additional claim.",
    status: "unresolved",
    provenance: "learner_entered",
    sources: []
  });
  project.checkpoints["record-gaps"].evidence.provenance =
    "verified_seed_modified_by_learner";
  return project;
}

afterEach(() => vi.restoreAllMocks());

describe("curated reset and release recovery", () => {
  it("requires confirmation and leaves the project unchanged when cancelled", async () => {
    const user = userEvent.setup();
    const project = modifiedProject();
    expect(saveProject(project)).toBe(true);
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderRoute(checkpointPath("run-minimal-target"));

    await user.click(screen.getByRole("button", { name: "Reset curated demo" }));

    expect(window.confirm).toHaveBeenCalledOnce();
    expect(loadProject()).toEqual(project);
  });

  it("restores the exact reviewed seed and keeps the current route valid", async () => {
    const user = userEvent.setup();
    expect(saveProject(modifiedProject())).toBe(true);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const route = checkpointPath("run-minimal-target");
    renderRoute(route);

    await user.click(screen.getByRole("button", { name: "Reset curated demo" }));

    await waitFor(() => {
      const reset = loadProject();
      expect(reset).not.toBeNull();
      expect(reset).toEqual(
        createFullProtocolProjectFromDemo(demoFixture, reset!.createdAt)
      );
    });
    const reset = loadProject()!;
    expect(reset.checkpoints["run-minimal-target"].evidence.localResult).toBe(
      0.875
    );
    expect(
      Object.values(reset.checkpoints).every(
        (checkpoint) => checkpoint.evidence.provenance === "verified_demo_run"
      )
    ).toBe(true);
    expect(Object.values(deriveCheckpointStatuses(reset))).toEqual(
      Array(7).fill("verified")
    );
    expect(screen.getByTestId("location-probe")).toHaveTextContent(route);
    expect(
      screen.getByText("Curated demo reset to the reviewed seven-checkpoint seed.")
    ).toBeInTheDocument();
  });

  it("removes learner additions without clearing unrelated storage", async () => {
    const user = userEvent.setup();
    expect(saveProject(modifiedProject())).toBe(true);
    localStorage.setItem("unrelated-preference", "keep-me");
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderRoute(checkpointPath("record-gaps"));

    await user.click(screen.getByRole("button", { name: "Reset curated demo" }));

    await waitFor(() => {
      const reset = loadProject();
      expect(reset?.checkpoints["record-gaps"].evidence.learnerNotes).toBe("");
      expect(
        reset?.checkpoints["record-gaps"].evidence.gaps.map(({ id }) => id)
      ).toEqual(["ag-news-benchmark-gap"]);
    });
    expect(localStorage.getItem("unrelated-preference")).toBe("keep-me");
  });

  it("exports a valid Passport v2 after reset", async () => {
    const user = userEvent.setup();
    expect(saveProject(modifiedProject())).toBe(true);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const createObjectUrl = vi.fn(() => "blob:passport");
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectUrl
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn()
    });
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    renderRoute(paths.passport);

    await user.click(screen.getByRole("button", { name: "Reset curated demo" }));
    await waitFor(() => expect(loadProject()?.updatedAt).not.toBe(fixedTimestamp));
    const passport = generatePassport(demoFixture, loadProject()!, fixedTimestamp);
    expect(passportV2Schema.safeParse(passport).success).toBe(true);

    await user.click(screen.getByRole("button", { name: "Download JSON" }));
    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(anchorClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a visible message when browser persistence fails", async () => {
    expect(saveProject(verifiedFullProtocolProjectFixture())).toBe(true);
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    renderRoute(paths.passport);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not save to browser storage/i
    );
  });

  it("shows only the persistence error when a confirmed reset cannot be saved", async () => {
    const user = userEvent.setup();
    expect(saveProject(modifiedProject())).toBe(true);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderRoute(checkpointPath("run-minimal-target"));
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    await user.click(screen.getByRole("button", { name: "Reset curated demo" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not save to browser storage/i
    );
    expect(
      screen.queryByText(
        "Curated demo reset to the reviewed seven-checkpoint seed."
      )
    ).not.toBeInTheDocument();
  });

  it("shows a visible message when an export fails", async () => {
    const user = userEvent.setup();
    expect(saveProject(verifiedFullProtocolProjectFixture())).toBe(true);
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => {
        throw new Error("download unavailable");
      })
    });
    renderRoute(paths.passport);

    await user.click(screen.getByRole("button", { name: "Download JSON" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/JSON export failed/i);
  });

  it("renders a recovery screen for unexpected workspace errors", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    function BrokenWorkspace(): never {
      throw new Error("render failed");
    }

    render(
      <AppErrorBoundary>
        <BrokenWorkspace />
      </AppErrorBoundary>
    );

    expect(
      screen.getByRole("heading", {
        name: "ReproPath could not load this workspace."
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload ReproPath" })).toBeInTheDocument();
  });
});
