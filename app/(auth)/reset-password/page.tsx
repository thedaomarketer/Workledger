import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getI18n } from "@/lib/i18n/server";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage() {
  const { m } = await getI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{m.auth.resetTitle}</CardTitle>
        <CardDescription>{m.auth.resetSubtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
