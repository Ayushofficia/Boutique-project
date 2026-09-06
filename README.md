# The Art of Lifestyle — Arti Boutique

Real production-ready website: Next.js frontend + Supabase (database + photo storage) + Vercel hosting.
Ye same design/features hain jo Claude ke andar test kiya tha, bas ab data real database mein save hota hai aur koi bhi domain pe live ja sakta hai.

## Kya-kya hai isme

- Public website: Home, Collection (catalog by category), Alterations, Contact
- Staff/Owner login (PIN-based) → Management console:
  - New Bill (billing, measurements, print — customer copy + boutique copy)
  - Orders (order summary, status update, search, delete)
  - Catalog (categories + SKUs, photo **upload** seedha device se, add/edit/delete)
  - Alterations (services + pricing, add/edit/delete)
  - Enquiries (website ke contact-form leads)
  - Site Settings (shop name, owner name, address, phone, hero photo, staff PIN — sab yahin se badlein)

---

## 1. Supabase setup (database + photo storage) — 10 minute

1. https://supabase.com pe free account banayein → **New project**.
2. Project ban jaane ke baad, left sidebar mein **SQL Editor** kholein.
3. Is repo ki `supabase/schema.sql` file ka pura content copy karke paste karein aur **Run** dabayein.
   - Isse saari tables ban jaayengi, aur demo catalog (Blouse/Suit/Lehenga/Kurta/Bridal) seed ho jaayega.
4. Left sidebar mein **Storage** kholein → **New bucket** → naam `photos` rakhein → **Public bucket** ON karein → Create.
   - Ye bucket hi hai jahan Management tab se upload ki gayi photos save hongi.
5. Left sidebar mein **Project Settings → API** kholein. Yahan se 3 cheezein copy karein:
   - `Project URL`
   - `anon public` key
   - `service_role` key (⚠️ ye secret hai, kisi ke saath share mat karein)

---

## 2. Local par chala ke test karein (optional, par recommended)

```bash
npm install
cp .env.example .env.local
```

`.env.local` file kholein aur apni Supabase values daal dein:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STAFF_JWT_SECRET=koi-bhi-lamba-random-string-daal-dein
SUPABASE_STORAGE_BUCKET=photos
```

Phir:
```bash
npm run dev
```
Browser mein `http://localhost:3000` kholein.

---

## 3. Live deploy karein (Vercel) — free

1. Is poore folder ko GitHub pe ek naye repository mein push karein (ya seedha Vercel CLI se bhi deploy ho sakta hai).
2. https://vercel.com pe account banayein (GitHub se sign in karein) → **Add New Project** → apna repo select karein.
3. Deploy karne se pehle **Environment Variables** section mein wahi 5 values daal dein jo upar `.env.local` mein daali thi.
4. **Deploy** dabayein — 2 minute mein website live ho jaayegi (jaise `your-project.vercel.app`).

## 4. Apna khud ka domain jodna

1. Domain kahin se bhi kharidein (GoDaddy, Namecheap, BigRock, etc.) — jaise `theartoflifestyle.com`.
2. Vercel project ke **Settings → Domains** mein jaake apna domain add karein.
3. Vercel jo DNS records dikhayega, wahi apne domain provider ke DNS settings mein add kar dein.
4. Kuch ghanton mein domain live ho jaayega, HTTPS bhi automatic mil jaata hai.

---

## Staff PIN aur security

- Default staff PIN **1234** hai. Website live hone ke turant baad, Site Settings mein jaake ise turant badal dein.
- PIN sabke liye common hai (owner + employees) — chhoti boutique ke liye ye kaafi hai, lekin agar aage chal ke har employee ka apna alag login chahiye (taaki pata chale kisne kaunsa bill banaya), wo ek upgrade hai jo baad mein add kiya ja sakta hai.
- `service_role` key sirf server (API routes) ke andar use hoti hai, browser mein kabhi nahi jaati — isliye database seedha bahar se access nahi ho sakta.

## Photos

- Management tab mein "Upload" button se seedha apne phone/computer se photo upload kar sakte hain — wo Supabase Storage mein save hoti hai aur turant live ho jaati hai.
- Chahe to image URL bhi paste kar sakte hain (jaise Google Drive ka public link).

## Aage kya add ho sakta hai (optional upgrades)

- Razorpay/UPI se online advance payment lena
- WhatsApp order-confirmation message automatically bhejna
- Har employee ka apna alag login
- SMS/WhatsApp se customer ko "aapka order ready hai" reminder
