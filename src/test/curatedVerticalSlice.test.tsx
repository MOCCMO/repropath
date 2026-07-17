import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppRoutes } from "../app/routes";
import { ProjectProvider } from "../state/ProjectProvider";
import { loadProject } from "../state/storage";

describe("curated first vertical slice", () => {
  it("moves from intake to map, gates evidence, and exposes the Passport gap", async () => {
    const user = userEvent.setup();
    render(
      <ProjectProvider>
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      </ProjectProvider>
    );

    await user.click(screen.getByRole("button", { name: /use curated demo/i }));
    expect(
      screen.getByRole("heading", { name: /define what counts as reproduced/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/not comparable/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("link", { name: /confirm minimal target/i }));
    const environment = screen.getByLabelText(/environment summary/i);
    expect(screen.getAllByText(/minimal target reproduced/i).length).toBeGreaterThan(0);

    await user.clear(environment);
    expect(screen.getAllByText(/^in progress$/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("link", { name: /preview passport/i }));
    expect(
      screen.getByRole("heading", { name: /reproduction passport/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Checkpoint 5: Run the minimal target (in progress)")
    ).toBeInTheDocument();
    expect(screen.getAllByText(/not comparable/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText("Verified seed modified by learner")
    ).toBeInTheDocument();
  });

  it("keeps an invalid numeric draft visible without crashing persistence", async () => {
    const user = userEvent.setup();
    render(
      <ProjectProvider>
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      </ProjectProvider>
    );

    await user.click(screen.getByRole("button", { name: /use curated demo/i }));
    await user.click(
      screen.getByRole("link", { name: /confirm minimal target/i })
    );

    const localResult = screen.getByLabelText("Local P@1");
    await user.clear(localResult);
    await user.type(localResult, "2");

    expect(localResult).toHaveAttribute("aria-invalid", "true");
    expect(localResult).toHaveAttribute(
      "aria-describedby",
      "local-result-hint local-result-error"
    );
    expect(
      screen.getByText("Local P@1 must be a finite number from 0 to 1.")
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /run evidence/i })).toBeInTheDocument();
    expect(screen.getAllByText(/^in progress$/i).length).toBeGreaterThan(0);

    await user.click(
      screen.getByRole("button", { name: /save evidence & view passport/i })
    );

    expect(
      screen.getByRole("heading", { name: /record the minimal fastText run/i })
    ).toBeInTheDocument();
    expect(
      loadProject()?.checkpoints["run-minimal-target"].evidence.localResult
    ).not.toBe(2);
  });
});
