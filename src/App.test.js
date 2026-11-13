import { act, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

jest.useFakeTimers();

test("shows launch button first, then welcome after celebration", () => {
  render(<App />);

  const launch = screen.getByRole("button", { name: /launch website/i });
  expect(launch).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: /welcome to swayamkrushi website/i })
  ).not.toBeInTheDocument();

  fireEvent.click(launch);
  expect(document.querySelector(".celebrate")).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(2000);
  });

  expect(
    screen.getByRole("heading", { name: /welcome to swayamkrushi website/i })
  ).toBeInTheDocument();
  expect(screen.getByText("Swayamkrushi")).toBeInTheDocument();
  expect(screen.getByText(/www\.swayamkrushi\.org/i)).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /launch website/i })
  ).not.toBeInTheDocument();
});

test.each(["Enter", " "])("starts tour on %s key", (key) => {
  render(<App />);
  const launch = screen.getByRole("button", { name: /launch website/i });
  fireEvent.keyDown(launch, { key });
  expect(document.querySelector(".celebrate")).toBeInTheDocument();
  expect(document.querySelectorAll(".celebrate__piece").length).toBeGreaterThan(0);

  act(() => {
    jest.advanceTimersByTime(2000);
  });

  expect(
    screen.getByRole("heading", { name: /welcome to swayamkrushi website/i })
  ).toBeInTheDocument();
});

test("plays video after 10s on the site preview", () => {
  const { container } = render(<App />);

  fireEvent.click(screen.getByRole("button", { name: /launch website/i }));
  act(() => {
    jest.advanceTimersByTime(2000);
  });

  act(() => {
    jest.advanceTimersByTime(5000);
  });
  expect(screen.getByTitle("Swayamkrushi website")).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(10000);
  });

  const video = container.querySelector("video");
  expect(video).toBeInTheDocument();
  expect(video).toHaveAttribute("data-phase", "video");
  expect(video.className).toContain("player__video");
  expect(video.className).not.toContain("player__video--preload");
});
