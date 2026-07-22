"use client";

import { useState } from "react";
import { Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import PublishFlowDialog from "@/components/dashboard/PublishFlowDialog";
import type { SubscriptionPackage } from "@/lib/subscriptions";

type GoLiveButtonProps = {
  websiteId: string;
  websiteSlug: string;
  websiteName: string;
  packages: SubscriptionPackage[];
};

export default function GoLiveButton({
  websiteId,
  websiteSlug,
  websiteName,
  packages,
}: GoLiveButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="is-primary" onClick={() => setOpen(true)}>
        <Rocket size={15} /> Go Live
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <PublishFlowDialog
              open
              onClose={() => setOpen(false)}
              onComplete={async () => {
                router.refresh();
              }}
              websiteId={websiteId}
              websiteSlug={websiteSlug}
              websiteName={websiteName}
              packages={packages}
            />,
            document.body,
          )
        : null}
    </>
  );
}
