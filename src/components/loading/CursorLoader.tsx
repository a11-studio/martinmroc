"use client";

import { useEffect } from "react";

export default function CursorLoader() {
  useEffect(() => {
    document.body.style.cursor = "progress";
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  return null;
}
