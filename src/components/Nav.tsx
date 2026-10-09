"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/dsa", label: "DSA" },
  { href: "/ai", label: "AI" },
  { href: "/journal", label: "Journal" },
  { href: "/plan", label: "Plan" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Sections">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
