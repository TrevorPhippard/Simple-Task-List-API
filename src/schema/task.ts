import { builder } from "../builder";
import { z } from "zod";

export const addTaskSchema = z.object({
  title: z.string().min(1).max(255),
});

export const toggleTaskSchema = z.object({
  id: z.string().min(1),
});

export const deleteTaskSchema = z.object({
  id: z.string().min(1),
});

builder.prismaObject("Task", {
  fields: (t: any) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    completed: t.exposeBoolean("completed"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
  }),
});

builder.queryField("task", (t) =>
  t.prismaField({
    type: "Task",
    nullable: true,

    args: {
      id: t.arg.string({ required: true }),
    },

    resolve: async (query, _parent, args, ctx) => {
      return ctx.prisma.task.findUnique({
        ...query,
        where: {
          id: args.id,
        },
      });
    },
  })
);

builder.queryField("tasks", (t) =>
  t.prismaField({
    type: ["Task"],
    nullable: false,

    resolve: async (query, _parent, _args, ctx) => {
      return ctx.prisma.task.findMany({
        ...query,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

builder.queryField("tasksByCursor", (t) =>
  t.prismaConnection({
    type: "Task",
    cursor: "id",

    resolve: async (query, _parent, args, ctx) => {
      return ctx.prisma.task.findMany({
        ...query,
        orderBy: { createdAt: "desc" },
      });
    },
  })
);

builder.mutationField("addTask", (t) =>
  t.prismaField({
    type: "Task",

    args: {
      title: t.arg.string({
        required: true,
        validate: addTaskSchema.shape.title,
      }),
    },

    resolve: async (query, _root, args, ctx) => {
      return ctx.prisma.task.create({
        ...query,
        data: {
          title: args.title,
        },
      });
    },
  })
);

builder.mutationField("toggleTask", (t) =>
  t.prismaField({
    type: "Task",
    nullable: true,

    args: {
      id: t.arg.string({
        required: true,
        validate: toggleTaskSchema.shape.id,
      }),
    },

    resolve: async (query, _parent, args, ctx) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: args.id },
      });

      if (!task) return null;

      return ctx.prisma.task.update({
        ...query,
        where: { id: args.id },
        data: {
          completed: !task.completed,
        },
      });
    },
  })
);

builder.mutationField("deleteTask", (t) =>
  t.prismaField({
    type: "Task",

    args: {
      id: t.arg.string({
        required: true,
        validate: deleteTaskSchema.shape.id,
      }),
    },

    resolve: async (query, _root, args, ctx) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: args.id },
      });

      if (!task) {
        throw new Error("Task not found.");
      }

      return ctx.prisma.task.delete({
        ...query,
        where: { id: args.id },
      });
    },
  })
);
