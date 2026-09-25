import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to your WorkLedger account.</CardDescription>
      </CardHeader>
      <CardContent>
        {params.registered && (
          <p className="mb-4 rounded-xl bg-success/10 px-3.5 py-2.5 text-sm text-success">
            Check your email to confirm your account, then sign in below.
          </p>
        )}
        <LoginForm redirectTo={params.redirectTo} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
