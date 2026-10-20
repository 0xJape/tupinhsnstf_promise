import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { savePeriodLog } from "@/app/(app)/cycle/actions";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{
    date?: string | string[];
    error?: string | string[];
  }>;
};

const today = format(new Date(), "yyyy-MM-dd");

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeDate(value: string | undefined) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : today;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const selectedDate = safeDate(first(params.date));
  const error = first(params.error);

  return (
    <div className="space-y-5">
      <Link
        href="/cycle"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2 w-fit text-muted-foreground",
        )}
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </Link>

      <header className="space-y-1">
        <p className="text-sm font-medium text-primary">Cycle log</p>
        <h1 className="text-2xl font-semibold tracking-tight">Log period</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Start date is day 1 of bleeding. Duration helps phase estimates.
        </p>
      </header>

      {error ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <form
        action={savePeriodLog}
        className="surface-card space-y-4 rounded-3xl p-4"
      >
        <div className="space-y-2">
          <Label htmlFor="start_date">Period start date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            required
            defaultValue={selectedDate}
            max={today}
            className="min-h-11 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration_days">How many days did it last?</Label>
          <Input
            id="duration_days"
            name="duration_days"
            type="number"
            min={1}
            max={14}
            placeholder="e.g. 5"
            className="min-h-11 rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            Optional. If still bleeding, leave blank or put days so far.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="flow">Flow</Label>
            <select
              id="flow"
              name="flow"
              defaultValue=""
              className="flex min-h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Not set</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pain_level">Pain (0–10)</Label>
            <Input
              id="pain_level"
              name="pain_level"
              type="number"
              min={0}
              max={10}
              placeholder="0"
              className="min-h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Mood, symptoms, medication, or anything useful."
            className="rounded-xl"
          />
        </div>

        <SubmitButton pendingLabel="Saving…" size="lg" className="min-h-12 w-full rounded-xl">
          Save period log
        </SubmitButton>
      </form>
    </div>
  );
}
