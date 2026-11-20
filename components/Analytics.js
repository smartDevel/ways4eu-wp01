"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    if (typeof window.ga !== "function") return;
    const query = searchParams.toString();
    window.ga("set", "page", query ? `${pathname}?${query}` : pathname);
    window.ga("send", "pageview");
  }, [pathname, searchParams]);

  return null;
}
