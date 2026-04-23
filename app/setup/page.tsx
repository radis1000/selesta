import { redirect } from "next/navigation";

export default function SetupFallback() {
  redirect("/fr/setup");
}
