"use client";

import { useSyncExternalStore } from "react";

// Huidige tijd (new Date()) mag onder cacheComponents niet tijdens prerender gelezen
// worden — ook niet in een Client Component zonder Suspense. useSyncExternalStore geeft
// tijdens prerender de servervariant (null) en op de client het echte jaartal, zonder
// setState in een effect en dus zonder cascading render.
const leegAbonnement = () => () => {};

export function CurrentYear() {
  const year = useSyncExternalStore(
    leegAbonnement,
    () => new Date().getFullYear(),
    () => null,
  );
  return <>{year}</>;
}
