import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getI18n } from "@/lib/i18n/server";
import { UpdatePasswordForm } from "./update-password-form";

export default async function UpdatePasswordPage() {
  const { m } = await getI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{m.auth.newPasswordTitle}</CardTitle>
        <CardDescription>{m.auth.newPasswordSubtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdatePasswordForm />
      </CardContent>
    </Card>
  );
}
