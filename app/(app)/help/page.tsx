import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FAQS = [
  {
    q: "How is overtime calculated?",
    a: "Set an overtime threshold (hours per week) on a job, or as your default in Settings. Once your paid hours for that job pass the threshold in a workweek, the extra time is calculated as overtime at that job's overtime rate.",
  },
  {
    q: "What's the difference between paid and unpaid breaks?",
    a: "Unpaid breaks are subtracted from your shift's paid time. Paid breaks are recorded for your records but don't reduce your paid time.",
  },
  {
    q: "Can I edit a shift after clocking out?",
    a: "Yes — open Time, find the shift in your history, and select the pencil icon. Every edit is recorded in an audit log.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Every table is protected by Row Level Security so only you can read or write your own records, and attachments are stored privately with short-lived signed URLs.",
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Help</h1>
      <div className="space-y-4">
        {FAQS.map((faq) => (
          <Card key={faq.q}>
            <CardHeader>
              <CardTitle className="text-base">{faq.q}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{faq.a}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
