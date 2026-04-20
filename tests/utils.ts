// tests/utils.ts
import { graphql } from "graphql";
import { schema } from "../src/schema"; // Your generated Pothos schema
import { PrismaClient } from "@prisma/client";
// Use this import instead:
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";

export type TestContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const createMockContext = (): TestContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
};

export async function executeTestQuery(
  query: string,
  variables: Record<string, any> = {},
  contextValue: TestContext
) {
  return graphql({
    schema,
    source: query,
    variableValues: variables,
    contextValue,
  });
}
