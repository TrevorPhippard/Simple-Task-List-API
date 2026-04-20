import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";

import SchemaBuilder from "@pothos/core";

// Plugins (required side-effect imports)
import "@pothos/plugin-validation";
import "@pothos/plugin-relay";

// Plugins
import ValidationPlugin from "@pothos/plugin-validation";
import PrismaPlugin from "@pothos/plugin-prisma";
import RelayPlugin from "@pothos/plugin-relay";

import type PrismaTypes from "./lib/pothos-prisma-types";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in your environment variables.");
}

const prisma = new PrismaClient();

export interface Context {
  /**
    https://pothos-graphql.dev/docs/plugins/prisma/setup

    It is strongly recommended NOT to put your prisma client into Context.
    This will result in slower type-checking and a laggy developer experience in VSCode.
    See this issue for more details.

    @todo at some point I will find how to not do this, I am new to this library
   */
  prisma: PrismaClient;
}

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: Context;
  Scalars: {
    DateTime: { Input: Date; Output: Date };
  };
  DefaultFieldNullability: false;
  ValidationPlugin: true;
  RelayPlugin: true;
}>({
  plugins: [PrismaPlugin, ValidationPlugin, RelayPlugin],

  defaultFieldNullability: false,

  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
    exposeDescriptions: true,
    filterConnectionTotalCount: true,
  },

  relay: {
    nodeTypeOptions: {
      name: "RelayNode",
      description: "A node in the graph",
    },
    pageInfoTypeOptions: {
      name: "RelayPageInfo",
      description: "Pagination information",
    },
  },

  validation: {
    validationError: (failure) => {
      return new Error(JSON.stringify(failure.issues));
    },
  },
});

builder.scalarType("DateTime", {
  serialize: (n) => n.toISOString(),
  parseValue: (n) => new Date(n as string),
});

export { prisma };
