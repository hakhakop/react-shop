"use client";

import { useState } from "react";
import { CreditCard, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import PublishFlowDialog from "@/components/dashboard/PublishFlowDialog";
import type { SubscriptionPackage } from "@/lib/subscriptions";

type GoLiveButtonProps = {
  websiteId: string;
  websiteSlug: string;
  websiteName: string;
  packages: SubscriptionPackage[];
  isLive?: boolean;
  activePackageId?: string;
  activeDomain?: string;
};

export default function GoLiveButton({
  websiteId,
  websiteSlug,
  websiteName,
  packages,
  isLive = false,
  activePackageId,
  activeDomain,
}: GoLiveButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="is-primary" onClick={() => setOpen(true)}>
        {isLive ? <CreditCard size={15} /> : <Rocket size={15} />}
        {isLive ? "Manage Plan" : "Go Live"}
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
              initialPackageId={activePackageId}
              initialDomain={activeDomain}
            />,
            document.body,
          )
        : null}
    </>
  );
}
