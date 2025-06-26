// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
    portfolios: i.entity({
      slug: i.string().unique(),
      name: i.string(),
      about: i.string(),
    }),
    contexts: i.entity({
      name: i.string(),
      value: i.string(),
    }),
  },
  links: {
    profileUser: {
      forward: {
        on: "portfolios",
        has: "one",
        label: "$user",
        onDelete: "cascade",
      },
      reverse: { on: "$users", has: "one", label: "portfolio" },
    },
    contextsPortfolio: {
      forward: { on: "contexts", has: "one", label: "portfolio", onDelete: "cascade" },
      reverse: { on: "portfolios", has: "many", label: "contexts" },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
