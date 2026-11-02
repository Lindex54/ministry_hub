"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function RequireAuth({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-sidebar">
        <Loader2 className="size-6 animate-spin text-sidebar-foreground/60" />
      </div>
    );
  }

  return children;
}
