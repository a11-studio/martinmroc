"use client";

import dynamic from "next/dynamic";
import { MacBootChunkFallback } from "@/components/loading/MacBootLoader";

// Dynamically import to ensure no SSR for the interactive desktop
const RootScene = dynamic(() => import("@/components/RootScene"), {
  ssr: false,
  loading: () => <MacBootChunkFallback />,
});

export default function Home() {
  return <RootScene />;
}
