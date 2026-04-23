# SplitCord — Lessons Learned

## Architecture

### Prisma 7 — Adapter SQLite obligatoire
**Pattern identifié** : Prisma 7 nécessite un driver adapter pour SQLite local. `new PrismaClient()` sans argument génère une erreur `accelerateUrl missing`. Il faut installer `@prisma/adapter-better-sqlite3` + `better-sqlite3`.

**Règle** :
```ts
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });
```

**Import** : Utiliser `@/app/generated/prisma/client` (avec `/client` — pas de barrel index dans le dossier généré).

---

### Discord Webhook — Download sans bot token
**Pattern identifié** : Pour récupérer les messages envoyés par un webhook, utiliser `GET /webhooks/{id}/{token}/messages/{messageId}`. Cela ne nécessite pas de bot token, juste le webhook URL d'origine.

**Règle** : Stocker `webhookId` et `webhookToken` dans la table `File` pour permettre le téléchargement ultérieur.

---

### Discord CDN URLs — Expiration
**Pattern identifié** : Les URLs d'attachements Discord expirent. Ne jamais stocker les CDN URLs en DB. Toujours re-fetcher le message pour obtenir une URL fraîche au moment du téléchargement.

**Règle** : Stocker `messageId`, pas l'URL CDN. Fetcher l'URL à la demande.

---

### Next.js 15 App Router — Body size
**Pattern identifié** : `api.bodyParser` dans `next.config.ts` ne s'applique qu'au Pages Router. L'App Router lit le body via `req.formData()` sans limite explicite au niveau framework.

**Règle** : Pour les uploads chunked, envoyer chaque chunk séparément (< 7.5MB) plutôt qu'un fichier entier. Le FormData est streamé nativement.

---

### Rate Limiting Discord
**Pattern identifié** : Discord webhooks tolèrent ~5 req/s. Attendre 1000ms entre chaque envoi de chunk est safe et évite les 429.

**Règle** : Le rate limiting se fait côté client (hook useUpload) avec `await sleep(1000)`, pas côté serveur.

---

### Zustand + Next.js RSC
**Pattern identifié** : Les stores Zustand ne peuvent être utilisés que dans des composants client (`"use client"`). Les pages Drive doivent être des Client Components si elles lisent un store.

**Règle** : Ajouter `"use client"` à toute page/composant qui utilise un store Zustand.

---

### Next.js 16 — turbopack.root non disponible via `experimental.turbo`
**Pattern identifié** : La config `experimental.turbo` n'existe pas dans le type `ExperimentalConfig` de Next.js 16. La propriété `turbopack.root` est documentée mais le type TypeScript ne l'expose pas encore. Le warning workspace root vient d'un `package-lock.json` parent — supprimer le lock parent est la seule vraie solution.

**Règle** : Ne pas chercher à configurer `turbopack.root` dans `next.config.ts` — ça casse le type-check. Le warning est cosmétique, il n'impacte pas le build.

---

### Discord CDN — Preview images via proxy Next.js
**Pattern identifié** : On ne peut pas utiliser les URLs CDN Discord directement dans `<img src>` car elles expirent (~30 min). La solution correcte est une route `/api/files/[id]/preview` qui re-fetch le message Discord (URL fraîche), proxy l'image, et retourne `Cache-Control: max-age=1800`.

**Règle** : Ne jamais stocker les CDN URLs Discord. Toujours passer par un proxy server-side qui re-fetche le messageId à la demande.

---

### create-next-app — Nom du projet
**Pattern identifié** : `create-next-app` refuse les noms avec des majuscules (contrainte npm). Créer dans un sous-dossier puis déplacer les fichiers.

**Règle** : Utiliser `npx create-next-app@latest splitcord-app` puis `Move-Item` pour remonter dans le dossier parent.
