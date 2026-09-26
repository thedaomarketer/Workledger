import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getI18n } from "@/lib/i18n/server";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const { m } = await getI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{m.auth.createTitle}</CardTitle>
        <CardDescription>{m.auth.createSubtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {m.auth.haveAccount}{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            {m.auth.signIn}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
