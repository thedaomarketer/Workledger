import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdatePasswordForm } from "./update-password-form";

export default function UpdatePasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Choose a new password</CardTitle>
        <CardDescription>Enter and confirm your new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdatePasswordForm />
      </CardContent>
    </Card>
  );
}
