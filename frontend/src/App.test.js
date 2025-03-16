import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import App from "./App";

test("renders the Todo List component", () => {
  render(<App />);

  // Check if the heading is in the document
  const heading = screen.getByText(/todo list/i);
  expect(heading).toBeInTheDocument();
});

const mock = new MockAdapter(axios);

test("loads and displays tasks", async () => {
  // Mock API response
  mock.onGet("http://localhost:8000/tasks").reply(200, [
    { id: 1, name: "Task 1", status: "new" },
    { id: 2, name: "Task 2", status: "completed" },
  ]);

  render(<App />);

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText("Task 1")).toBeInTheDocument(); // Pending Task
    expect(screen.getByText("Task 2")).toBeInTheDocument(); // Completed Task
  });
});

test("adds a new task", async () => {
  mock.onPost("http://127.0.0.1:8000/tasks").reply(200, {
    id: 3,
    name: "New Task",
    status: "new",
  });

  render(<App />);

  // Type into the input
  const input = screen.getByPlaceholderText("Enter Task");
  fireEvent.change(input, { target: { value: "New Task" } });

  // Click the submit button
  const button = screen.getByText("Submit");
  fireEvent.click(button);

  // Wait for the new task to appear
  await waitFor(() => {
    expect(screen.getByText("New Task")).toBeInTheDocument();
  });
});

test("toggles task status", async () => {
  mock
    .onGet("http://localhost:8000/tasks")
    .reply(200, [{ id: 1, name: "Task 1", status: "new" }]);

  mock.onPut("http://localhost:8000/tasks").reply(200, {
    id: 1,
    name: "Task 1",
    status: "completed",
  });

  render(<App />);

  // Wait for task to appear
  await waitFor(() => {
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  // Click to toggle status
  fireEvent.click(screen.getByText("Task 1"));

  // Wait for status change
  await waitFor(() => {
    expect(screen.getByText("Task 1")).toBeInTheDocument(); // Task moved to "Completed"
  });
});

test("displays pending and completed task lists", async () => {
  mock.onGet("http://localhost:8000/tasks").reply(200, [
    { id: 1, name: "Task 1", status: "new" },
    { id: 2, name: "Task 2", status: "completed" },
  ]);

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText("Pending Tasks")).toBeInTheDocument();
    expect(screen.getByText("Completed Tasks")).toBeInTheDocument();
  });
});

test("shows error on failed task loading", async () => {
  mock.onGet("http://localhost:8000/tasks").reply(500);

  render(<App />);

  // Wait for error to appear
  await waitFor(() => {
    expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument();
  });
});
