"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Settings, Hash, Link } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_ICONS = [Settings, Hash, Link];

export function SetupGuide() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("setup.guide");

  const steps = [
    { icon: STEP_ICONS[0], title: t("step1Title"), description: t("step1Desc") },
    { icon: STEP_ICONS[1], title: t("step2Title"), description: t("step2Desc") },
    { icon: STEP_ICONS[2], title: t("step3Title"), description: t("step3Desc") },
  ];

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
      >
        <span>{t("toggle")}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary">
                <step.icon className="h-3.5 w-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
          <div className="rounded-md bg-muted/50 border border-border p-3 text-xs text-muted-foreground">
            {t("tip")}
          </div>
        </div>
      )}
    </div>
  );
}
