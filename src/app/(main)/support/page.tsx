import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeBuoy } from "lucide-react";

export default function SupportPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support</CardTitle>
        <CardDescription>Get help and submit support tickets.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center p-16 border-2 border-dashed rounded-lg">
          <LifeBuoy className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Support Center Coming Soon</h3>
          <p className="text-muted-foreground mt-2">Our support portal will be available here shortly.</p>
        </div>
      </CardContent>
    </Card>
  );
}
