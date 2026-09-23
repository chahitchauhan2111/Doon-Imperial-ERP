# Doon Imperial Residential School ERP

School ERP built with Next.js 14 (App Router), Prisma and Neon PostgreSQL, with three separate portals:

| Portal | URL | Signs in with | What it does |
|---|---|---|---|
| **Admin** | `/admin` | school email | Students & teachers (with photos), attendance, exams & results, fees, student wallet, hostel, leave approvals, notices |
| **Teacher** | `/teacher` | Employee ID or email | Dashboard with profile, take attendance, marks entry, class list with student profiles, leave approvals for own class, notices, own profile/photo |
| **Student** | `/student` | Admission No. or email | Dashboard with profile & photo, attendance history, results, fee statement, wallet, apply for leave/outing, notices, own profile/photo |

Access is enforced in `middleware.ts` (route level) and again inside every page and server action (`requireRole`).

## Setup

```bash
npm install
cp .env.example .env        # set DATABASE_URL (Neon) and AUTH_SECRET
npx prisma db push          # creates/updates tables
npm run db:seed             # demo data
npm run dev                 # http://localhost:3000
```

If you are upgrading an existing database, `prisma db push` may ask for `--accept-data-loss` because it adds a unique
index on the new `User.teacherId` column. The column starts empty, so no data is lost. The exact SQL is in `prisma/upgrade.sql`.

### Demo accounts (after seeding)
- Admin: `admin@doonimperial.com` / `Admin@12345`
- Teacher: `EMP-101` / `Teacher@123` (class teacher of VIII-A)
- Student: `DIS-2026-001` / `Student@123`

**Change all demo passwords before real use.**

### School email domain
Every student and staff login email must end in `@doonimperial.com`; the admin forms and server actions reject anything else.
The domain is set in `SCHOOL_DOMAIN` in `lib/format.ts`. Running the seed also renames any old `@doonimperial.edu.in` accounts.

## Design
- Theme taken from the school crest: maroon `#7a1a28`, antique gold `#c49a45`, warm ivory background.
- Fonts: Playfair Display (headings) and Inter (interface), loaded via `next/font`.
- Tokens and components live in `app/globals.css`. Layouts adapt to phones (the sidebar becomes a slide-in menu).

## Profile photos
Photos are resized in the browser to a 360×360 JPEG (~30–60 KB) and stored in the `photo` column of `Student`/`Teacher`.
They are served from `/api/photo/{student|teacher}/{id}`. Students can only load their own photo and staff photos.
Admins upload photos from a student's or teacher's **Edit** page; students and teachers can change their own from **My Profile**.

## Project layout
```
app/
  login/                 login page with Student / Teacher / Admin tabs
  admin/ teacher/ student/   one folder per portal (each has its own layout + sidebar)
  actions/               server actions (admin, academic, student, account)
  api/auth/login         sign-in endpoint
  api/photo/[kind]/[id]  profile photo endpoint
components/              AppShell/Frame (sidebar + topbar), ProfileCard, AttendanceSheet, MarksSheet, forms…
lib/                     auth/session, prisma client, data helpers, formatting
prisma/schema.prisma     database schema
```

## Still to do before production
- Rate limiting on the login endpoint, and a password-reset flow by email
- Online fee payment (payment gateway)
- Timetable module, parent portal, document uploads
- Regular database backups (Neon branching / point-in-time restore)
