import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders welcome and site url", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /welcome to swayamkrushi website/i })
  ).toBeInTheDocument();
  expect(screen.getByText(/https:\/\/www\.swayamkrushi\.org/i)).toBeInTheDocument();
});
