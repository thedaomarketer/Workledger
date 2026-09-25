"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Opens a dialog automatically when the current URL's `new` query param
 * matches `paramValue` -- the quick-create shortcuts in
 * `components/app-shell/create-menu.tsx` deep-link to a page this way
 * instead of duplicating that page's create form. The param is stripped
 * from the URL right after, so a later back-navigation to the same address
 * doesn't reopen the dialog.
 */
export function useAutoOpen(paramValue: string): [boolean, (open: boolean) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shouldAutoOpen = searchParams.get("new") === paramValue;
  const [open, setOpen] = useState(shouldAutoOpen);

  useEffect(() => {
    if (shouldAutoOpen) {
      router.replace(pathname, { scroll: false });
    }
    // Consume the param exactly once, on mount -- not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [open, setOpen];
}
