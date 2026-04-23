import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Intercepte toutes les routes sauf API, fichiers statiques, et _next
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
