import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import { prisma } from "./builder";

const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    return {
      prisma,
    };
  },
  maskedErrors: process.env.NODE_ENV === "production",
  graphqlEndpoint: "/graphql",
});

const server = createServer(yoga);

server.listen(4000, "0.0.0.0", () => {
  /** local only */
  console.log("playground running on http://0.0.0.0:4000/graphql");
});
