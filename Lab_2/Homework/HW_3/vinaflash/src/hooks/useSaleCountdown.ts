"use client";

import { useEffect, useState } from "react";
import { createAntiDriftTimer } from "@/engine/antiDriftTimer";
import {
  getSaleStatus,
  type SaleStatus,
  type SaleWindow,
} from "@/engine/saleSchedule";

export function useSaleCountdown({ startsAt, endsAt }: SaleWindow): SaleStatus {
  const [status, setStatus] = useState(() =>
    getSaleStatus({ startsAt, endsAt }),
  );

  useEffect(() => {
    let cancel = () => {};
    const run = () => {
      const now = Date.now();
      const target = now < startsAt ? startsAt : endsAt;
      cancel = createAntiDriftTimer(Math.max(0, target - now), (remaining) => {
        setStatus(getSaleStatus({ startsAt, endsAt }));
        // Sale just opened: switch to counting down to the end
        if (remaining === 0 && target === startsAt) run();
      });
    };
    run();
    return () => cancel();
  }, [startsAt, endsAt]);

  return status;
}
