import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppRoutes } from "../app/routes";
import { checkpointPath, paths } from "../app/paths";
import { checkpointDefinitions } from "../domain/checkpointDefinitions";
import { ProjectProvider } from "../state/ProjectProvider";
import { loadProject, saveProject } from "../state/storage";
import { verifiedFullProtocolProjectFixture } from "./fixtures/projects";

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-probe">{location.pathname}</output>;
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

function seedProject() {
  const project = verifiedFullProtocolProjectFixture();
  expect(saveProject(project)).toBe(true);
  return project;
}

describe("full protocol workspace", () => {
  it.each(checkpointDefinitions)(
    "renders direct route for checkpoint $order: $id",
    (definition) => {
      seedProject();
      renderRoute(checkpointPath(definition.id));

      expect(
        screen.getByRole("heading", { name: definition.title, level: 1 })
      ).toBeInTheDocument();
      expect(screen.getByText(`Checkpoint ${definition.order} of 7`)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /preview passport/i })).toBeInTheDocument();
    }
  );

  it("renders a clear recovery state for an unknown checkpoint ID", () => {
    seedProject();
    renderRoute("/projects/fasttext-bag-of-tricks/checkpoints/not-a-checkpoint");

    expect(
      screen.getByRole("heading", { name: "Checkpoint not found" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Return to checkpoint 5" })
    ).toHaveAttribute("href", paths.checkpoint);
  });

  it("keeps a locked route stable and links the earliest incomplete prerequisite", async () => {
    const project = verifiedFullProtocolProjectFixture();
    project.checkpoints["run-minimal-target"].evidence.trainingCommand = "";
    expect(saveProject(project)).toBe(true);
    const lockedPath = checkpointPath("record-gaps");
    renderRoute(lockedPath);

    expect(
      screen.getByRole("heading", { name: "Record gaps is locked" })
    ).toBeInTheDocument();
    expect(screen.getByText("Checkpoint 5: Run the minimal target")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to first incomplete checkpoint" })
    ).toHaveAttribute("href", checkpointPath("run-minimal-target"));

    await waitFor(() =>
      expect(screen.getByTestId("location-probe")).toHaveTextContent(lockedPath)
    );
  });

  it("disables Continue while checkpoint evidence is incomplete", () => {
    const project = verifiedFullProtocolProjectFixture();
    project.checkpoints["run-minimal-target"].evidence.environment = "";
    expect(saveProject(project)).toBe(true);
    renderRoute(checkpointPath("run-minimal-target"));

    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    expect(
      screen.getByText("Verify this checkpoint before continuing.")
    ).toBeInTheDocument();
  });

  it("recomputes checkpoint 6 after checkpoint 5 evidence changes", async () => {
    const user = userEvent.setup();
    seedProject();
    renderRoute(checkpointPath("run-minimal-target"));

    const localResult = screen.getByLabelText("Local P@1");
    await user.clear(localResult);
    await user.type(localResult, "0.75");
    await user.click(
      screen.getByRole("link", {
        name: /Compare resultsStatus: Verified/i
      })
    );

    expect(screen.getByText("0.75")).toBeInTheDocument();
    expect(screen.queryByText("75.0%")).not.toBeInTheDocument();
    expect(
      screen.getByText("Curated seed modified by learner")
    ).toBeInTheDocument();
  });

  it("persists checkpoint 7 learner notes", async () => {
    const user = userEvent.setup();
    seedProject();
    renderRoute(checkpointPath("record-gaps"));

    const notes = screen.getByLabelText("Notes");
    await user.type(notes, "Learner follow-up is still needed.");

    await waitFor(() =>
      expect(
        loadProject()?.checkpoints["record-gaps"].evidence.learnerNotes
      ).toBe("Learner follow-up is still needed.")
    );
  });

  it("validates and persists learner-created gaps", async () => {
    const user = userEvent.setup();
    seedProject();
    renderRoute(checkpointPath("record-gaps"));

    await user.click(screen.getByRole("button", { name: "Add gap" }));
    expect(screen.getByText("Description is required.")).toBeInTheDocument();
    expect(screen.getByText("Impact on claim is required.")).toBeInTheDocument();
    expect(screen.getByText("Status is required.")).toBeInTheDocument();

    await user.type(
      screen.getByLabelText("Description"),
      "Tokenizer behavior has not been checked."
    );
    await user.type(
      screen.getByLabelText("Impact on claim"),
      "This limits claims about preprocessing equivalence."
    );
    await user.selectOptions(screen.getByLabelText("Status"), "unresolved");
    await user.click(screen.getByRole("button", { name: "Add gap" }));

    const learnerGap = await screen.findByText(
      "Tokenizer behavior has not been checked."
    );
    expect(learnerGap).toBeInTheDocument();
    expect(screen.getByText("Learner-entered evidence")).toBeInTheDocument();
    await waitFor(() => {
      const gaps = loadProject()?.checkpoints["record-gaps"].evidence.gaps;
      expect(gaps?.some((gap) =>
        gap.description === "Tokenizer behavior has not been checked." &&
        gap.impactOnClaim === "This limits claims about preprocessing equivalence." &&
        gap.status === "unresolved" &&
        gap.provenance === "learner_entered"
      )).toBe(true);
    });
  });

  it("keeps Passport preview accessible with incomplete checkpoints", async () => {
    const user = userEvent.setup();
    const project = verifiedFullProtocolProjectFixture();
    project.checkpoints["run-minimal-target"].evidence.logExcerpt = "";
    expect(saveProject(project)).toBe(true);
    renderRoute(checkpointPath("run-minimal-target"));

    await user.click(screen.getByRole("link", { name: /preview passport/i }));

    expect(
      screen.getByRole("heading", { name: "Reproduction Passport" })
    ).toBeInTheDocument();
    const missingSection = screen.getByRole("heading", {
      name: "Missing evidence"
    }).parentElement!;
    expect(
      within(missingSection).getByText(
        "Checkpoint 5: Run the minimal target"
      )
    ).toBeInTheDocument();
    expect(within(missingSection).getByText("In progress")).toBeInTheDocument();
  });

  it("exposes textual status labels and supports keyboard checkpoint navigation", async () => {
    const user = userEvent.setup();
    seedProject();
    renderRoute(checkpointPath("run-minimal-target"));

    const firstCheckpoint = screen.getByRole("link", {
      name: "Understand the taskStatus: Verified"
    });
    expect(firstCheckpoint).toHaveTextContent("Status: Verified");

    for (let index = 0; index < 12 && document.activeElement !== firstCheckpoint; index += 1) {
      await user.tab();
    }
    expect(firstCheckpoint).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("location-probe")).toHaveTextContent(
      checkpointPath("understand-task")
    );
  });
});
