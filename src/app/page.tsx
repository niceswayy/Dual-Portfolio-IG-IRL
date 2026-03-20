"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const seen = localStorage.getItem("braincells-intro-seen");
    router.replace(seen ? "/dashboard" : "/welcome");
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className="w-10 h-10 rounded-full animate-spin"
        style={{
          border: "3px solid var(--border)",
          borderTopColor: "var(--accent)",
        }}
      />
    </div>
  );
}
