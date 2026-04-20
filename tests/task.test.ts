// tests/task.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createMockContext, executeTestQuery, TestContext } from "./utils";

describe("Task Resolvers", () => {
  let mockCtx: TestContext;

  beforeEach(() => {
    mockCtx = createMockContext();
  });

  it("should fetch a single task by ID", async () => {
    const mockTask = {
      id: "1",
      title: "Test Task",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock the Prisma call
    mockCtx.prisma.task.findUnique.mockResolvedValue(mockTask);

    const query = `
      query GetTask($id: String!) {
        task(id: $id) {
          id
          title
          completed
        }
      }
    `;

    const result = await executeTestQuery(query, { id: "1" }, mockCtx);

    expect(result.errors).toBeUndefined();
    expect(result.data?.task).toEqual({
      id: "1",
      title: "Test Task",
      completed: false,
    });

    // Verify Prisma was called with correct args
    expect(mockCtx.prisma.task.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "1" } })
    );
  });

  it("should add a new task and validate input", async () => {
    const mockTask = {
      id: "2",
      title: "New Task",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCtx.prisma.task.create.mockResolvedValue(mockTask);

    const mutation = `
      mutation AddTask($title: String!) {
        addTask(title: $title) {
          id
          title
        }
      }
    `;

    const result = await executeTestQuery(
      mutation,
      { title: "New Task" },
      mockCtx
    );

    expect(result.errors).toBeUndefined();
    expect(result.data?.addTask.title).toBe("New Task");
  });

  it("should return an error if title is empty (Zod Validation)", async () => {
    const mutation = `
      mutation AddTask($title: String!) {
        addTask(title: $title) {
          id
        }
      }
    `;

    // Empty string should trigger Zod min(1) validation
    const result = await executeTestQuery(
      mutation,
      { title: "it does!" },
      mockCtx
    );

    expect(result.errors).toBeDefined();
    // Pothos-Zod usually throws a validation error message
    expect(result.errors![0].message).toContain(
      "String must contain at least 1 character"
    );
  });

  it("should toggle a task status", async () => {
    const existingTask = { id: "1", completed: false };

    // 1. Mock findUnique to find the task
    mockCtx.prisma.task.findUnique.mockResolvedValue(existingTask as any);
    // 2. Mock update to return the toggled task
    mockCtx.prisma.task.update.mockResolvedValue({
      ...existingTask,
      completed: true,
    } as any);

    const mutation = `
    mutation Toggle($id: String!) {
      toggleTask(id: $id) {
        completed
      }
    }
  `;

    const result = await executeTestQuery(mutation, { id: "1" }, mockCtx);

    expect(result.data?.toggleTask.completed).toBe(true);
    expect(mockCtx.prisma.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { completed: true },
      })
    );
  });
});
