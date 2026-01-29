import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL ?? "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>()]
});
