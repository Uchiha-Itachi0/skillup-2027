import type { Metadata } from "next";
import JournalList from "@/components/JournalList";
import { journal } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Journal · Skill-up 2027" };

export default function JournalPage() {
  return (
    <>
      <h1>What clicked.</h1>
      <p className="lede">
        One note each time something makes sense, written in my own words. Writing it down is how I check I really
        understood it.
      </p>
      <section>
        <JournalList entries={journal} />
      </section>
    </>
  );
}
