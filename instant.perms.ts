// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  attrs: { allow: { create: "false" } },
  $files: {
    allow: {
      view: "true",
      create: "isOwner",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: [
      "isOwner",
      "auth.ref('$user.portfolio.slug') != [] && data.path == ('resumes/' + auth.ref('$user.portfolio.slug')[0] + '.pdf')",
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
