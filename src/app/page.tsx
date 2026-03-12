"use client";

import dynamic from "next/dynamic";

// Dynamically import to ensure no SSR for the interactive desktop
const RootScene = dynamic(() => import("@/components/RootScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#799cea] flex items-center justify-center" />
  ),
});

export default function Home() {
  return <RootScene />;
}
