import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">Part of the platform roadmap</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clock className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold">Coming soon</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {description ?? "This section is under active development and will be available in an upcoming release."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}