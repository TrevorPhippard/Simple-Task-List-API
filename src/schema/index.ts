import { builder } from "../builder";

builder.queryType({});
builder.mutationType({});

import "./task";

export const schema = builder.toSchema();
