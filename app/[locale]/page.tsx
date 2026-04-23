import { redirect } from "next/navigation";

// Le middleware gère /  → /{locale}
// Cette page gère /{locale} → /{locale}/setup
export default async function LocaleRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/setup`);
}
