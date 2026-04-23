"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWebhookStore } from "@/store/webhookStore";
import type { ValidateWebhookResponse } from "@/types/api";

type ValidationState = "idle" | "loading" | "success" | "error";

export function WebhookForm() {
  const router = useRouter();
  const t = useTranslations("setup.form");
  const { setWebhook } = useWebhookStore();
  const [url, setUrl] = useState("");
  const [state, setState] = useState<ValidationState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/webhook/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: url.trim() }),
      });
      const data: ValidateWebhookResponse = await res.json();

      if (data.valid && data.webhookId && data.webhookToken) {
        setWebhook(url.trim(), data.webhookId, data.webhookToken);
        setState("success");
        setTimeout(() => router.push("/drive"), 800);
      } else {
        setState("error");
        setErrorMsg(data.error || t("errors.invalidFormat"));
      }
    } catch {
      setState("error");
      setErrorMsg(t("errors.serverError"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="webhook-url">{t("label")}</Label>
        <div className="relative">
          <Input
            id="webhook-url"
            type="url"
            placeholder={t("placeholder")}
            value={url}
            onChange={(e) => { setUrl(e.target.value); if (state !== "idle") setState("idle"); }}
            className="pr-10"
            disabled={state === "loading" || state === "success"}
            autoFocus
          />
          {state === "loading" && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
          {state === "success" && <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-emerald-400" />}
          {state === "error" && <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-destructive" />}
        </div>
        {state === "error" && (
          <p className="text-xs text-destructive flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3" />{errorMsg}
          </p>
        )}
        {state === "success" && (
          <p className="text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3" />{t("successMessage")}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={!url.trim() || state === "loading" || state === "success"}>
        {state === "loading" ? (<><Loader2 className="animate-spin" />{t("submitting")}</>)
          : state === "success" ? (<><CheckCircle />{t("connected")}</>)
          : t("submit")}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        {t("privacy")}{" "}
        <a
          href="https://support.discord.com/hc/fr/articles/228383668"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-0.5"
        >
          {t("helpLink")}<ExternalLink className="h-3 w-3" />
        </a>
      </p>
    </form>
  );
}
