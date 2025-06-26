// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  attrs: { allow: { create: "false" } },
  portfolios: {
    allow: {
      view: "true",
      create: "isOwner",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: ["isOwner", "auth.id in data.ref('$user.id')"],
  },
} satisfies InstantRules;

export default rules;
