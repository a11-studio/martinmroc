"use client";

import { useEffect, useState } from "react";
import { formatTime, formatDate } from "@/lib/utils";

export default function MenuBar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="absolute top-0 left-0 right-0 h-7 flex items-center justify-between px-4 z-50 select-none"
      style={{
        background: "rgba(0,0,0,0.12)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      role="banner"
      aria-label="Menu bar"
    >
      {/* Left — Apple mark + app name */}
      <div className="flex items-center gap-4">
        <span
          className="text-white text-[15px] leading-none font-semibold opacity-90"
          aria-hidden="true"
        >
          
        </span>
        <span className="text-white text-[13px] font-semibold opacity-90 tracking-tight">
          Portfolio
        </span>
      </div>

      {/* Right — date + time */}
      {now && (
        <div className="flex items-center gap-3 text-white text-[13px] font-medium opacity-90 tabular-nums">
          <span>{formatDate(now)}</span>
          <span>{formatTime(now)}</span>
        </div>
      )}
    </div>
  );
}
