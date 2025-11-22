# Security Best Practices

## 🔒 Environment Variables

### Local Development

**Voor Cloudflare Workers development gebruik `.dev.vars`:**
```bash
# .dev.vars (wordt automatisch geladen door wrangler)
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

**Of gebruik `.env`:**
```bash
# .env (voor andere tools)
DATABASE_URL="postgresql://..."
```

**⚠️ BELANGRIJK:**
- ✅ `.env` en `.dev.vars` staan in `.gitignore`
- ✅ Gebruik `.env.example` als template (zonder echte credentials)
- ❌ **NOOIT** echte credentials committen naar git
- ❌ **NOOIT** credentials in code hardcoden

### Production (Cloudflare)

**Gebruik Cloudflare Environment Variables:**

**Optie 1: Via Wrangler CLI (aanbevolen)**
```bash
# Set secret voor production
wrangler secret put DATABASE_URL --env production

# Set secret voor staging
wrangler secret put DATABASE_URL --env stage
```

**Optie 2: Via Cloudflare Dashboard**
1. Ga naar je Worker in Cloudflare Dashboard
2. Settings → Variables and Secrets
3. Voeg `DATABASE_URL` toe als **Secret** (encrypted)
4. Voeg `GOOGLE_CLIENT_ID` en `GOOGLE_CLIENT_SECRET` toe als Secrets

**⚠️ VERSCHIL:**
- **Secret** = Encrypted, voor gevoelige data (DATABASE_URL, API keys)
- **Environment Variable** = Plain text, voor niet-gevoelige data (VITE_BASE_HOST)

## 🔐 Waarom PostgreSQL Anders is dan D1

### D1 (Cloudflare)
```typescript
// ✅ Veilig: Cloudflare handelt auth intern af
env.DB.prepare("SELECT * FROM users").all()
```
- Geen credentials nodig
- Cloudflare handelt authenticatie af
- Database binding is veilig

### PostgreSQL (Supabase)
```typescript
// ⚠️ Bevat credentials in connection string!
env.DATABASE_URL
// "postgresql://user:PASSWORD@host/db"
```
- Connection string bevat username + password
- Moet als secret worden opgeslagen
- NOOIT in code of git committen

## ✅ Checklist voor Veiligheid

- [ ] `.env` staat in `.gitignore`
- [ ] `.dev.vars` staat in `.gitignore`
- [ ] `.env.example` is aangemaakt (zonder echte waarden)
- [ ] Production secrets zijn ingesteld via Cloudflare Dashboard
- [ ] Geen hardcoded credentials in code
- [ ] Database password is sterk en uniek

## 🚀 Setup voor Nieuwe Developer

```bash
# 1. Clone de repo
git clone <repo>

# 2. Installeer dependencies
pnpm install

# 3. Kopieer env example
cd apps/user-application
cp .env.example .dev.vars

# 4. Vul je credentials in .dev.vars
# (Vraag team voor credentials, of gebruik je eigen Supabase project)

# 5. Start dev server
pnpm run dev
```

## 📝 Deployment Checklist

**Voor Staging:**
```bash
wrangler secret put DATABASE_URL --env stage
wrangler secret put GOOGLE_CLIENT_ID --env stage
wrangler secret put GOOGLE_CLIENT_SECRET --env stage
wrangler deploy --env stage
```

**Voor Production:**
```bash
wrangler secret put DATABASE_URL --env production
wrangler secret put GOOGLE_CLIENT_ID --env production
wrangler secret put GOOGLE_CLIENT_SECRET --env production
wrangler deploy --env production
```

---

**Onthoud: Credentials zijn als huissleutels - deel ze nooit publiekelijk en bewaar ze veilig!** 🔐
