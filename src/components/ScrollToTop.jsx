"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const getHashId = (hash) => {
  const rawId = hash.slice(1);

  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
};

export default function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hash = typeof window !== 'undefined'
    ? searchParams.get("hash") || window.location.hash
    : searchParams.get("hash");

  useEffect(() => {
    if (!pathname) return;

    if (hash && typeof window !== 'undefined') {
      const id = getHashId(hash);
      const timer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return () => window.clearTimeout(timer);
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, hash]);

  return null;
}
