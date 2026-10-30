import Link from "next/link";
import { ArrowRight, Play, ShieldCheck, Video } from "lucide-react";

const stories = [
  {
    title: "I started writing down what I noticed",
    summary: "Tracking symptoms helped prepare clearer questions for a consultation.",
    topic: "Recognizing symptoms",
  },
  {
    title: "Asking for help felt like progress",
    summary: "Finding reliable information made seeking professional guidance feel manageable.",
    topic: "Seeking support",
  },
  {
    title: "My experience is my own",
    summary: "Learning that PCOS experiences differ helped reduce unhelpful comparisons.",
    topic: "Personal reflection",
  },
];

export function PatientStories({ showAllLink = false }: { showAllLink?: boolean }) {
  return (
    <section className="space-y-8" aria-labelledby="patient-stories-title">
      <div className="grid gap-4 border-b border-[#eadde1] pb-6 md:grid-cols-[1fr_.8fr] md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9f2947]">Patient perspectives</p>
          <h2 id="patient-stories-title" className="mt-2 font-display text-3xl font-bold tracking-tight text-[#3d2029]">Real experiences, shared with care.</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-[#765761] md:justify-self-end">Short, consented reflections about recognizing symptoms, seeking support, and preparing for professional care. Personal experiences are not medical advice.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stories.map((story) => (
          <article key={story.title} className="group overflow-hidden rounded-2xl border border-[#eadde1] bg-white shadow-[0_12px_35px_rgba(61,32,41,0.06)]">
            <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#4d2734,#7f3c51)]" aria-label={`Video placeholder for ${story.title}`}>
              <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_32%),radial-gradient(circle_at_80%_80%,#e9a9b9_0,transparent_35%)]" />
              <span className="relative flex size-14 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-sm transition group-hover:scale-105 group-hover:bg-white/25">
                <Play className="ml-1 size-6 fill-current" aria-hidden />
              </span>
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm"><Video className="size-3" aria-hidden />Video coming soon</span>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9f2947]">{story.topic}</p>
              <h3 className="text-lg font-semibold leading-snug text-[#3d2029]">“{story.title}”</h3>
              <p className="text-sm leading-6 text-[#765761]">{story.summary}</p>
              <p className="flex items-center gap-1.5 border-t border-[#f0e5e8] pt-3 text-xs font-medium text-[#765761]"><ShieldCheck className="size-3.5 text-[#9f2947]" aria-hidden />Anonymous · consent required before publication</p>
            </div>
          </article>
        ))}
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border border-[#eadde1] bg-[#f7f0f2] p-5 text-sm leading-6 text-[#65444f] sm:flex-row sm:items-center sm:justify-between">
        <p className="flex max-w-3xl gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#9f2947]" aria-hidden /><span><strong className="text-[#3d2029]">Privacy before publication.</strong> Every submitted story requires informed consent and review to remove identifying health information. Videos may use face blurring when requested.</span></p>
        {showAllLink ? <Link href="/stories" className="inline-flex shrink-0 items-center gap-2 font-bold text-[#9f2947] hover:underline">View all stories <ArrowRight className="size-4" aria-hidden /></Link> : null}
      </div>
    </section>
  );
}
