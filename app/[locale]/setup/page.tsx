import { getTranslations } from "next-intl/server";
import { Zap, Shield, Cloud } from "lucide-react";
import { WebhookForm } from "@/components/setup/WebhookForm";
import { SetupGuide } from "@/components/setup/SetupGuide";

export default async function SetupPage() {
  const t = await getTranslations("setup");

  const features = [
    { icon: Cloud, title: t("features.storage.title"), description: t("features.storage.description") },
    { icon: Zap, title: t("features.chunking.title"), description: t("features.chunking.description") },
    { icon: Shield, title: t("features.manifest.title"), description: t("features.manifest.description") },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left — branding */}
        <div className="space-y-8">
          <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="SplitCord" className="w-10 h-10 rounded-xl object-cover" />
            <span className="text-2xl font-bold tracking-tight">{t("brand")}</span>
          </div>
            <h1 className="text-3xl font-bold leading-tight">
              {t("headline").split("Discord").map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <span className="text-primary">Discord</span>
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </h1>
            <p className="text-muted-foreground leading-relaxed">{t("subheadline")}</p>
          </div>

          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center mt-0.5">
                  <f.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="w-full space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{t("form.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("form.subtitle")}</p>
            </div>
            <WebhookForm />
          </div>
          <SetupGuide />
        </div>
      </div>
    </div>
  );
}
