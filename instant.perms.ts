// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  attrs: { allow: { create: "false" } },
  $files: {
    allow: {
      view: "true",
      // TODO: Fix.
      create: "true",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: [
      "isOwner",
      "auth.ref('$user.portfolio.id') != [] && data.path.startsWith(auth.ref('$user.portfolio.id')[0] + '/')",
    ],
  },
  portfolios: {
    allow: {
      view: "true",
      create: "isOwner",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: ["isOwner", "auth.id in data.ref('$user.id')"],
  },
  contexts: {
    allow: {
      view: "true",
      create: "isOwner",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: ["isOwner", "auth.id in data.ref('portfolio.$user.id')"],
  },
} satisfies InstantRules;

export default rules;
