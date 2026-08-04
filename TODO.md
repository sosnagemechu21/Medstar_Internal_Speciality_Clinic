# MedStar Clinic — Deploy Readiness Fixes

## Task List

### Fix Seed Doctor Login
- [ ] Generate real bcrypt hashes for doctor accounts in `prisma/seed.ts` so `doctor1@medstar.com` and `doctor2@medstar.com` can log in

### Enforce Real Type Safety
- [ ] Remove `typescript.ignoreBuildErrors: true` from `next.config.ts` so Vercel build validates types

### Fix Invalid Dependency Version
- [ ] Fix `eslint-config-next` version typo `^16.2.10i` → `^16.2.12` in `package.json`

### Clean Up Workspace Root Warning
- [ ] Remove stray `C:/Users/Beza/package-lock.json` duplicate lockfile

### Verify
- [ ] Rebuild with type validation enabled and confirm clean build
