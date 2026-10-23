import { defineApp } from "convex/server";
import { v } from "convex/values";

export default defineApp({
  env: {
    CLERK_SECRET_KEY: v.string(),
    CLERK_JWT_ISSUER_DOMAIN: v.string(),
    CLERK_AUTHORIZED_PARTIES: v.optional(v.string()),
  },
});
