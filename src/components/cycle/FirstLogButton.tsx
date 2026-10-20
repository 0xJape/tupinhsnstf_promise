"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LastPeriodPrompt } from "@/components/cycle/LastPeriodPrompt";

export function FirstLogButton() {
  const [open, setOpen] = useState(false);
  return <><Button type="button" className="mt-4 min-h-11 w-full rounded-xl" onClick={() => setOpen(true)}>Choose latest period date<ArrowRight className="size-4" /></Button><LastPeriodPrompt open={open} onDismiss={() => setOpen(false)} /></>;
}
