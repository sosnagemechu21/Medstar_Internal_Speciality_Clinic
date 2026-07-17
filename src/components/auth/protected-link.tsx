"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

interface ProtectedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export function ProtectedLink({ href, children, className, onClick, id }: ProtectedLinkProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    onClick?.();
    if (loading) {
      e.preventDefault();
      return;
    }
    if (!isAuthenticated) {
      e.preventDefault();
      // Preserve the locale prefix (e.g. /en or /am) for the login redirect
      const localePart = pathname.split("/")[1] ?? "en";
      router.push(`/${localePart}/login?redirect=${encodeURIComponent(href)}`);
    }
  };

  return (
    <Link href={href} id={id} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
