import NextAuth from "next-auth";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || account?.provider !== "google") return false;

      const isBootstrapAdmin =
        !!process.env.ADMIN_EMAIL &&
        user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          image: user.image,
          googleId: account.providerAccountId,
          ...(isBootstrapAdmin ? { role: "ADMIN" } : {}),
          student: { upsert: { create: {}, update: {} } },
        },
        create: {
          email: user.email,
          name: user.name,
          image: user.image,
          googleId: account.providerAccountId,
          role: isBootstrapAdmin ? "ADMIN" : "STUDENT",
          student: { create: {} },
        },
      });

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
        }
      }
      return session;
    },
  },
});
