import { betterAuth, object } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle";
import * as schema from "@/db/auth-schema";
import { createPrivateKey } from "crypto";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...schema },
  }),
  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      privateKey: { type: "string" },
      publicKey: { type: "string" },
      salt: { type: "string" },
      iv: { type: "string" },
    },
  },
});
