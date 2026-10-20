"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { handleRouteChange } from "@/lib/flash";

/** Clears one-time messages once the person navigates away from the page that showed them. */
export function FlashRouteWatcher() {
  const pathname = usePathname();
  useEffect(() => {
    handleRouteChange(pathname);
  }, [pathname]);
  return null;
}
