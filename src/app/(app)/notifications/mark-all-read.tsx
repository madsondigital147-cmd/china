"use client";

import { useToast } from "@/components/ui/toaster";
import { markNotificationsReadAction } from "@/app/actions/inbox";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkAllRead() {
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    const res = await markNotificationsReadAction();
    if (res.ok) {
      toast("All notifications marked as read.");
      router.refresh();
    } else {
      toast(res.error ?? "Failed.", "error");
    }
    setBusy(false);
  };

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={busy}>
      <CheckCheck className="h-4 w-4" aria-hidden />
      Mark all read
    </Button>
  );
}