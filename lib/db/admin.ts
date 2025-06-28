import schema from "@/instant.schema";
import { init } from "@instantdb/admin";

if (!process.env.NEXT_PUBLIC_INSTANT_APP_ID) {
  throw new Error("NEXT_PUBLIC_INSTANT_APP_ID is not defined in environment variables");
}

if (!process.env.INSTANT_APP_ADMIN_TOKEN) {
  throw new Error("INSTANT_APP_ADMIN_TOKEN is not defined in environment variables");
}

export const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID,
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN,
  schema,
});
