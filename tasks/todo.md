# SplitCord — Tasks

## Phase 1 : Foundation ✅
- [x] Bootstrap Next.js 15 avec Tailwind v4, TypeScript
- [x] Types TypeScript (radis.ts, discord.ts, api.ts)
- [x] Prisma schema (File, Chunk) + migration SQLite initiale
- [x] Lib core : chunker, checksum, discord/webhook, discord/messages, rateLimit, format
- [x] Stores Zustand : uploadStore, downloadStore, webhookStore (persist)
- [x] API Routes : validate, chunk, complete, files, download, delete
- [x] Hooks : useUpload, useDownload, useFiles
- [x] Setup page : WebhookForm + SetupGuide
- [x] Drive UI : Sidebar, Toolbar, FileGrid, FileList, FileCard, FileRow, UploadModal, DeleteDialog, DownloadProgress, EmptyState
- [x] Root layout + page redirect

## Phase 2 : Améliorations futures
- [ ] Pagination / scroll infini pour la liste de fichiers
- [ ] Tri par nom, taille, date
- [ ] Support dossiers (arborescence)
- [ ] Preview inline pour images
- [ ] Vérification checksum SHA256 côté client post-download
- [ ] Multi-webhook (plusieurs Discords)
- [ ] Export manifeste .radis exportable
- [ ] PWA (offline support)
- [ ] i18n (8 langues)
- [ ] Drag & drop pour réorganiser

## Phase 3 : Performance
- [ ] Streaming chunked download avec progress granulaire
- [ ] Upload concurrent (plusieurs fichiers en parallèle)
- [ ] Cache des URLs d'attachements Discord (30 min de validité)
