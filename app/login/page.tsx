import { auth } from "@/auth";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginPage() {
  const session = await auth();

  // Only redirect an existing session when the corresponding database user
  // still exists. This prevents stale Auth.js cookies from causing a
  // /login <-> /dashboard redirect loop.
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="logo">P</div>
        <h1>Welcome to PlacementCRM</h1>
        <p>Sign in securely with your Google account.</p>

        <GoogleSignInButton />

        <small>
          Your account will be created automatically the first time you sign in.
        </small>

        <Link href="/" className="back">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
