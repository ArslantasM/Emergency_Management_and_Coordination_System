import NextAuth, { DefaultSession } from "next-auth";
import { UserRole } from "./user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      regions?: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    regions?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    regions?: string[];
  }
} 