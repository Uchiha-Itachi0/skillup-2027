import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { profile } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skill-up 2027 · Anubhav Shukla",
  description: "Learning DSA, system design and AI engineering to pass interviews without AI help. Tracked in public.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="top">
          <div className="wrap">
            <Link href="/" className="brand">
              Skill-up <span>2027</span>
            </Link>
            <Nav />
          </div>
        </header>
        <main>
          <div className="wrap">{children}</div>
        </main>
        <footer>
          <div className="wrap">
            <span>{profile.name}, learning in public.</span>
            <nav aria-label="Profiles">
              <a href={profile.x}>X</a>
              <a href={profile.github}>GitHub</a>
              <a href={profile.linkedin}>LinkedIn</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
