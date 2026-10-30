import Link from "next/link";
import { PatientStories } from "@/components/home/PatientStories";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function StoriesPage() {
  return (
    <div className="space-y-6 pb-4">
      <PatientStories />
      <Link href="/home" className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}>Back to home</Link>
    </div>
  );
}
