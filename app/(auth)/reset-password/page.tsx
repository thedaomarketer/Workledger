import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
        <CardDescription>
          We&apos;ll email you a link to choose a new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
