import schema from "@/instant.schema";
import { init } from "@instantdb/react";

if (!process.env.NEXT_PUBLIC_INSTANT_APP_ID) {
  throw new Error("NEXT_PUBLIC_INSTANT_APP_ID is not defined in environment variables");
}

export const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID,
  schema,
});
