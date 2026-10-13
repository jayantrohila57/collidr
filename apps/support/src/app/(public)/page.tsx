import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportHomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-semibold text-3xl tracking-tight">Support</h1>
        <p className="max-w-2xl text-muted-foreground text-sm">
          Search the help center, open a support ticket, or read our legal
          policies.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Help center</CardTitle>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/help" />}>Browse FAQ</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tickets</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button render={<Link href="/tickets" />}>My tickets</Button>
            <Button variant="outline" render={<Link href="/tickets/new" />}>
              New ticket
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Legal</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" render={<Link href="/legal/terms" />}>
              Terms & policies
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
