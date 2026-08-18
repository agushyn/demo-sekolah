# Product Requirements Document (PRD)
# Website Portal Sekolah

**Versi:** 1.0  
**Tanggal:** 15 Agustus 2026  
**Framework:** Laravel 13  
**Frontend:** React + Inertia.js + Tailwind CSS  
**UI Style:** Bento UI  
**Database:** MySQL/MariaDB  
**Authentication:** Laravel Authentication  
**Authorization:** Role & Permission Based Access Control

---

# 1. Ringkasan Produk

Website Portal Sekolah adalah platform digital terpadu yang digunakan sebagai pusat informasi sekolah sekaligus media pembelajaran dan komunikasi antara:

- Sekolah
- Admin
- Guru
- Siswa
- Orang Tua/Wali
- Pengunjung umum

Website terdiri dari dua bagian utama:

1. **Public Website**
   - Berita sekolah
   - Informasi sekolah
   - Kalender akademik
   - Informasi pendaftaran
   - Kontak sekolah
   - Informasi guru/staf
   - Profil sekolah

2. **Authenticated Portal**
   - Dashboard siswa
   - Ruang kelas virtual
   - Materi pembelajaran
   - Tugas
   - Forum diskusi
   - Kalender pribadi
   - Profil pengguna

Admin memiliki dashboard khusus untuk mengelola seluruh konten dan aktivitas platform.

---

# 2. Tujuan Produk

## 2.1 Tujuan Utama

Membangun website sekolah modern yang:

- Menjadi pusat informasi resmi sekolah.
- Memudahkan siswa mendapatkan materi dan tugas.
- Memudahkan guru mengelola pembelajaran.
- Memudahkan orang tua mengetahui informasi sekolah.
- Menyediakan sistem registrasi siswa secara online.
- Menyediakan komunikasi melalui forum.
- Memudahkan admin mengelola seluruh konten website.

## 2.2 Tujuan Bisnis

Website diharapkan dapat:

- Mengurangi ketergantungan terhadap informasi melalui WhatsApp.
- Meningkatkan transparansi informasi sekolah.
- Meningkatkan engagement siswa dan guru.
- Mempermudah proses administrasi pendaftaran.
- Meningkatkan citra profesional sekolah.

---

# 3. Target Pengguna

## 3.1 Pengunjung

Pengunjung yang belum login.

Akses:

- Beranda
- Profil sekolah
- Berita
- Kalender akademik
- Informasi pendaftaran
- Kontak
- Guru & staf
- FAQ

---

## 3.2 Siswa

Siswa yang telah memiliki akun.

Akses:

- Dashboard
- Ruang kelas virtual
- Materi
- Tugas
- Pengumpulan tugas
- Forum
- Kalender akademik
- Profil

---

## 3.3 Guru

Guru yang telah memiliki akun.

Akses:

- Dashboard guru
- Kelas yang diajar
- Materi
- Tugas
- Penilaian
- Forum kelas
- Kalender
- Profil

---

## 3.4 Orang Tua/Wali

Orang tua dapat diberikan akun apabila sekolah mengaktifkan fitur tersebut.

Akses:

- Informasi siswa
- Kalender
- Pengumuman
- Informasi akademik
- Kontak sekolah

---

## 3.5 Admin

Admin mempunyai akses penuh untuk:

- Mengelola pengguna
- Mengelola berita
- Mengelola halaman informasi
- Mengelola kalender
- Mengelola pendaftaran
- Mengelola guru
- Mengelola kelas
- Mengelola mata pelajaran
- Mengelola materi
- Mengelola tugas
- Moderasi forum
- Website settings

---

# 4. Teknologi

## Backend

- Laravel 13
- PHP 8.3+
- Laravel Eloquent ORM
- Laravel Validation
- Laravel Policies
- Laravel Notifications
- Laravel Scheduler
- Laravel Storage

## Frontend

- React
- Inertia.js
- Tailwind CSS
- Lucide Icons
- Responsive Design

## Database

- MySQL 8+
- MariaDB 10.6+

## Authentication

Menggunakan Laravel Authentication dengan:

- Login
- Logout
- Register
- Forgot Password
- Reset Password
- Email Verification
- Role-based authorization

---

# 5. Konsep UI / UX

## 5.1 Bento UI

Website wajib menggunakan konsep **Bento UI**.

Karakteristik:

- Card-based layout
- Rounded corners
- Responsive grid
- Modular information blocks
- Soft shadows
- Clear hierarchy
- Banyak whitespace
- Modern dashboard
- Minimalis
- Mobile friendly

Contoh layout:

```text
┌───────────────────────┬──────────────────┐
│                       │                  │
│     HERO SEKOLAH      │   QUICK INFO     │
│                       │                  │
├──────────────┬────────┴─────────┬────────┤
│   BERITA     │   KALENDER       │ AGENDA │
│              │                  │        │
├──────────────┴──────────┬───────┴────────┤
│                         │                │
│      PROGRAM SEKOLAH    │   STATISTIK    │
│                         │                │
└─────────────────────────┴────────────────┘
```

---

# 6. Public Website

## 6.1 Homepage

Homepage menjadi halaman utama website.

Komponen:

### Header

- Logo sekolah
- Nama sekolah
- Navigation
- Berita
- Akademik
- Kelas Virtual
- Pendaftaran
- Kontak
- Login

Mobile:

- Hamburger menu
- Logo
- Login button

---

## 6.2 Hero Section

Menampilkan:

- Nama sekolah
- Slogan
- Deskripsi singkat
- Foto/banner sekolah
- CTA "Daftar Sekarang"
- CTA "Pelajari Lebih Lanjut"

Hero dapat menggunakan Bento layout.

---

# 7. Portal Berita

## 7.1 Tujuan

Memberikan informasi terbaru mengenai:

- Kegiatan sekolah
- Prestasi siswa
- Prestasi guru
- Pengumuman
- Event
- Kegiatan ekstrakurikuler
- Informasi akademik

## 7.2 Halaman Berita

Route:

```text
/berita
```

Fitur:

- List berita
- Search
- Filter kategori
- Pagination
- Featured news
- Berita terbaru

---

## 7.3 Detail Berita

Route:

```text
/berita/{slug}
```

Informasi:

- Judul
- Thumbnail
- Isi berita
- Penulis
- Tanggal
- Kategori
- Related news

---

## 7.4 Admin Berita

Admin dapat:

- Create
- Read
- Update
- Delete
- Publish
- Draft
- Schedule publication

Field:

```text
title
slug
excerpt
content
thumbnail
category
author_id
status
published_at
created_at
updated_at
```

---

# 8. Kalender Akademik

## 8.1 Tujuan

Memberikan informasi:

- Tahun ajaran
- Hari efektif sekolah
- Ujian
- UTS
- UAS
- Libur
- Pembagian rapor
- Kegiatan sekolah
- Event
- Agenda guru

Route:

```text
/kalender
```

---

## 8.2 Fitur

Calendar view:

- Month
- Week
- List

Event memiliki:

```text
title
description
start_date
end_date
start_time
end_time
category
location
is_public
```

Kategori:

- Akademik
- Ujian
- Libur
- Kegiatan
- Rapat
- Event

---

# 9. Ruang Kelas Virtual

## 9.1 Tujuan

Ruang kelas virtual menjadi tempat pembelajaran online.

Siswa dapat:

- Melihat kelas
- Melihat materi
- Download materi
- Melihat tugas
- Mengumpulkan tugas
- Melihat deadline
- Mengikuti forum kelas

Guru dapat:

- Membuat kelas
- Upload materi
- Membuat tugas
- Melihat pengumpulan
- Memberikan nilai
- Memberikan feedback

---

# 10. Struktur Virtual Classroom

```text
Ruang Kelas
│
├── Kelas
│   ├── Matematika
│   ├── Bahasa Indonesia
│   ├── Bahasa Inggris
│   └── IPA
│
├── Materi
│
├── Tugas
│
├── Pengumpulan
│
└── Diskusi
```

---

# 11. Materi Pembelajaran

Guru dapat membuat materi:

- Judul
- Deskripsi
- Text content
- PDF
- DOC/DOCX
- PPT/PPTX
- Video
- Link eksternal

Database:

```text
lessons
- id
- class_id
- teacher_id
- title
- description
- content
- file_path
- video_url
- published_at
- created_at
- updated_at
```

---

# 12. Tugas

Guru dapat membuat tugas.

Field:

```text
assignments
- id
- class_id
- teacher_id
- title
- description
- attachment
- due_date
- max_score
- status
- created_at
- updated_at
```

Siswa dapat:

- Membuka tugas
- Upload jawaban
- Mengedit jawaban sebelum deadline
- Melihat status
- Melihat nilai
- Melihat feedback

---

# 13. Forum Diskusi

## 13.1 Tujuan

Forum digunakan sebagai media komunikasi:

- Guru ↔ Siswa
- Siswa ↔ Siswa
- Diskusi mata pelajaran
- Diskusi tugas
- Diskusi umum

---

## 13.2 Fitur Forum

User dapat:

- Membuat thread
- Membalas thread
- Edit posting
- Delete posting milik sendiri
- Like/react
- Report

Guru/Admin dapat:

- Pin thread
- Lock thread
- Delete thread
- Moderasi komentar

---

## 13.3 Struktur

```text
Forum
│
├── General
├── Matematika
├── Bahasa Indonesia
├── IPA
├── Bahasa Inggris
└── Kegiatan Sekolah
```

---

# 14. Informasi Kontak

Route:

```text
/kontak
```

Informasi:

- Alamat sekolah
- Nomor telepon
- WhatsApp
- Email
- Website
- Jam pelayanan
- Google Maps
- Kontak administrasi
- Kontak kepala sekolah
- Kontak guru

---

# 15. Halaman Guru & Staf

Route:

```text
/guru
```

Menampilkan:

- Foto
- Nama
- Jabatan
- Mata pelajaran
- Email
- Kontak jika diizinkan

Admin dapat mengatur apakah informasi kontak guru ditampilkan secara publik.

---

# 16. Sistem Registrasi Siswa

Website menyediakan halaman:

```text
/pendaftaran
```

Tetapi halaman tersebut **hanya tersedia jika admin mengaktifkan pendaftaran**.

---

## 16.1 Setting Pendaftaran

Admin memiliki toggle:

```text
Pendaftaran Online
[ ON / OFF ]
```

Jika:

```text
ON
```

maka menu:

```text
Pendaftaran
```

muncul di website.

Jika:

```text
OFF
```

maka:

- Menu disembunyikan
- Halaman pendaftaran tidak dapat diakses
- API pendaftaran ditolak

---

# 17. Form Pendaftaran

Field dapat disesuaikan melalui admin.

Minimal:

### Data Siswa

- Nama lengkap
- NIK
- NISN
- Tempat lahir
- Tanggal lahir
- Jenis kelamin
- Alamat
- Provinsi
- Kabupaten
- Kecamatan
- Kelurahan
- No HP
- Email

### Data Orang Tua

- Nama ayah
- Nama ibu
- No HP orang tua
- Pekerjaan
- Alamat

### Dokumen

- Kartu keluarga
- Akta kelahiran
- Ijazah
- Pas foto
- Dokumen tambahan

---

# 18. Status Pendaftaran

Status:

```text
Pending
Review
Accepted
Rejected
```

Admin dapat mengubah status.

Sistem menyimpan:

```text
registration_number
status
admin_notes
reviewed_by
reviewed_at
```

---

# 19. Dashboard Admin Pendaftaran

Admin dapat melihat:

```text
Total Pendaftar
Pending
Sedang Review
Diterima
Ditolak
```

Tersedia:

- Search
- Filter
- Detail pendaftar
- Download dokumen
- Export Excel
- Print
- Change status
- Catatan admin

---

# 20. Dashboard Admin

Route:

```text
/admin
```

Dashboard menggunakan Bento UI.

Contoh:

```text
┌──────────────────────┬──────────────────────┐
│ TOTAL SISWA          │ TOTAL GURU           │
│ 1.245                │ 84                   │
├──────────────┬───────┴──────────────┬───────┤
│ BERITA       │ PENDAFTAR            │ EVENT │
│ 128          │ 56                   │ 12    │
├──────────────┴──────────────────────┴───────┤
│                                             │
│             AKTIVITAS TERBARU               │
│                                             │
├───────────────────────────┬─────────────────┤
│ PENDAFTARAN TERBARU       │ AGENDA          │
│                           │                 │
└───────────────────────────┴─────────────────┘
```

---

# 21. Modul Admin

Sidebar:

```text
Dashboard

Website
├── Profil Sekolah
├── Berita
├── Pengumuman
├── Halaman
├── Banner
└── FAQ

Akademik
├── Tahun Ajaran
├── Kalender
├── Kelas
├── Mata Pelajaran
├── Guru
└── Siswa

Pembelajaran
├── Ruang Kelas
├── Materi
├── Tugas
└── Pengumpulan

Forum
├── Thread
├── Komentar
└── Moderasi

Pendaftaran
├── Pengaturan
├── Pendaftar
└── Laporan

Kontak
├── Informasi Sekolah
├── Guru & Staff
└── Kontak

Pengguna
├── Admin
├── Guru
├── Siswa
└── Orang Tua

Settings
├── General
├── SEO
├── Social Media
├── Email
└── Pendaftaran
```

---

# 22. Manajemen Pengguna

Role:

```text
super_admin
admin
teacher
student
parent
```

Admin dapat:

- Create user
- Edit user
- Disable user
- Reset password
- Assign role
- Assign class

---

# 23. Database Design

Minimal tabel:

```text
users

roles
permissions

students
teachers
parents

academic_years
classes
subjects

class_students
class_teachers

news
news_categories

pages

academic_events

lessons
lesson_files

assignments
assignment_submissions

forum_categories
forum_threads
forum_posts
forum_reports

registrations
registration_documents

school_contacts

settings

notifications

activity_logs
```

---

# 24. Relasi Utama

```text
User
│
├── Student
│      └── Class
│
├── Teacher
│      └── Classes
│
└── Parent
       └── Students


Class
│
├── Students
├── Teachers
├── Subjects
├── Lessons
├── Assignments
└── Forum Threads
```

---

# 25. Settings System

Settings harus dibuat dinamis sehingga admin tidak perlu mengubah kode.

Contoh:

```text
school_name
school_logo
school_favicon
school_address
school_phone
school_email
school_whatsapp

registration_enabled
registration_start
registration_end

maintenance_mode

facebook_url
instagram_url
youtube_url
tiktok_url

google_maps_url

default_meta_title
default_meta_description
```

---

# 26. Admin Website Settings

Admin dapat mengatur:

### General

- Nama sekolah
- Logo
- Favicon
- Deskripsi
- Alamat
- Telepon
- Email

### Registration

```text
Aktifkan Pendaftaran
[ ON ]

Tanggal Mulai
Tanggal Selesai
```

### Social Media

- Facebook
- Instagram
- YouTube
- TikTok

### SEO

- Meta title
- Meta description
- Open Graph image

---

# 27. Notification System

Sistem notifikasi digunakan untuk:

- Tugas baru
- Deadline tugas
- Pengumuman
- Berita baru
- Status pendaftaran
- Forum reply
- Nilai tugas

Notification dapat muncul melalui:

```text
Database notification
Email
```

---

# 28. Search

Global search dapat mencari:

- Berita
- Pengumuman
- Materi
- Guru
- Forum
- Halaman website

Search tersedia di:

```text
Desktop
Mobile
Admin Dashboard
Student Dashboard
```

---

# 29. SEO

Public website harus SEO-friendly.

Implementasi:

- SEO title
- Meta description
- Open Graph
- Twitter Card
- Canonical URL
- Sitemap
- Robots.txt
- Schema.org
- SEO-friendly slug

Contoh:

```text
/berita/prestasi-siswa-dalam-olimpiade-nasional
```

---

# 30. Security

Wajib menerapkan:

- CSRF protection
- XSS protection
- SQL injection protection
- Rate limiting
- Authorization policy
- Role-based access
- Secure file upload
- MIME validation
- Maximum upload size
- Password hashing
- Email verification
- Session security

Dokumen pendaftaran hanya boleh diakses oleh:

```text
Admin
Super Admin
```

---

# 31. File Storage

Dokumen disimpan menggunakan Laravel Storage.

Contoh:

```text
storage/app/private/registrations/
storage/app/private/assignments/
storage/app/public/news/
storage/app/public/lessons/
```

Dokumen sensitif tidak boleh langsung berada pada public storage.

---

# 32. Responsive Design

Website wajib mendukung:

- Desktop
- Laptop
- Tablet
- Mobile

Breakpoint menggunakan Tailwind CSS.

Mobile navigation harus menggunakan drawer/menu.

---

# 33. Accessibility

Website harus memperhatikan:

- Semantic HTML
- Keyboard navigation
- Alt text
- Form label
- Focus state
- Kontras warna
- Accessible buttons
- Screen reader friendly

---

# 34. Public Routes

```text
/
 /profil
 /berita
 /berita/{slug}
 /kalender
 /guru
 /kontak
 /pendaftaran
 /faq
 /login
 /register
 /forgot-password
```

---

# 35. Student Routes

```text
/dashboard
/kelas
/kelas/{class}
/materi
/materi/{lesson}
/tugas
/tugas/{assignment}
/forum
/forum/{thread}
/kalender
/profile
```

---

# 36. Teacher Routes

```text
/guru/dashboard
/guru/kelas
/guru/kelas/{class}
/guru/materi
/guru/tugas
/guru/pengumpulan
/guru/forum
```

---

# 37. Admin Routes

```text
/admin
/admin/news
/admin/news/create
/admin/news/{id}/edit

/admin/calendar
/admin/teachers
/admin/students
/admin/classes
/admin/subjects

/admin/lessons
/admin/assignments

/admin/forum

/admin/registrations
/admin/registrations/{id}

/admin/settings
/admin/settings/registration
/admin/settings/general
/admin/settings/seo
```

---

# 38. Middleware

Minimal middleware:

```text
auth
verified
role
admin
teacher
student
parent
```

Contoh:

```php
Route::middleware(['auth', 'role:admin'])
```

---

# 39. Admin Permission

Permission granular:

```text
view_dashboard

view_news
create_news
edit_news
delete_news
publish_news

view_students
create_students
edit_students
delete_students

view_teachers
create_teachers
edit_teachers

view_registrations
review_registrations
approve_registrations
reject_registrations

manage_calendar

manage_classes
manage_subjects

manage_lessons
manage_assignments

moderate_forum

manage_settings
```

---

# 40. Activity Log

Admin activity harus dicatat.

Contoh:

```text
Admin Agus membuat berita baru
Admin mengubah status pendaftar
Guru membuat tugas baru
Admin mengaktifkan pendaftaran
Admin menghapus komentar forum
```

Data:

```text
user_id
action
module
record_id
description
ip_address
user_agent
created_at
```

---

# 41. Dashboard Statistics

Admin dashboard menampilkan:

- Jumlah siswa
- Jumlah guru
- Jumlah kelas
- Jumlah berita
- Jumlah pendaftar
- Pendaftar pending
- Tugas aktif
- Forum activity

Gunakan Bento cards.

---

# 42. UX Pendaftaran

Flow:

```text
Pengunjung
    ↓
Klik Pendaftaran
    ↓
Form Pendaftaran
    ↓
Validasi
    ↓
Upload Dokumen
    ↓
Submit
    ↓
Nomor Pendaftaran
    ↓
Status Pending
    ↓
Admin Review
    ↓
Accepted / Rejected
```

Setelah submit:

```text
Pendaftaran berhasil dikirim.

Nomor Pendaftaran:
REG-2026-000123

Status:
MENUNGGU VERIFIKASI
```

---

# 43. Admin Registration Workflow

```text
Pendaftar Baru
      ↓
Admin membuka detail
      ↓
Verifikasi data
      ↓
Verifikasi dokumen
      ↓
Review
      ↓
┌───────────────┐
│               │
▼               ▼
Accepted      Rejected
```

Admin wajib dapat memberikan catatan ketika menolak.

---

# 44. Email Notification

Jika email tersedia:

### Pendaftaran diterima

```text
Pendaftaran Anda telah diterima.
```

### Pendaftaran ditolak

```text
Pendaftaran Anda belum dapat diterima.
Silakan periksa catatan berikut...
```

### Tugas baru

```text
Guru telah memberikan tugas baru.
```

---

# 45. Admin Content Management

Admin harus dapat mengelola konten tanpa menyentuh kode.

CMS sederhana:

```text
Pages
News
Announcements
FAQ
Banners
School Information
Contacts
```

Editor konten harus mendukung:

- Heading
- Paragraph
- Bold
- Italic
- Link
- Image
- List
- Table

---

# 46. Homepage Dynamic Content

Homepage tidak boleh hard-coded sepenuhnya.

Admin dapat menentukan:

- Hero banner
- Featured news
- Latest news
- Upcoming events
- School statistics
- CTA
- Information cards

---

# 47. Performance

Target:

- Lighthouse Performance > 85
- Lazy loading image
- Optimized image
- Pagination
- Database indexing
- Eager loading
- Cache settings
- Cache public content
- Queue email notification

---

# 48. Database Indexing

Index wajib untuk:

```text
users.email
news.slug
news.status
news.published_at

academic_events.start_date

registrations.registration_number
registrations.status

assignments.due_date

forum_threads.created_at
```

---

# 49. Backup

Admin menyediakan informasi backup database.

Disarankan:

```text
Daily database backup
Weekly full backup
```

Backup tidak boleh dapat diakses secara publik.

---

# 50. Seed Data

Seeder harus menyediakan data demo:

### Roles

```text
Super Admin
Admin
Teacher
Student
Parent
```

### Sample

- 1 admin
- 3 guru
- 10 siswa
- 3 kelas
- 5 mata pelajaran
- 5 berita
- 10 kalender akademik
- 3 forum
- 3 materi
- 3 tugas

---

# 51. UI Components

Komponen reusable:

```text
Button
Input
Select
Textarea
Modal
Drawer
Dropdown
Badge
Avatar
Card
BentoCard
Table
Pagination
Tabs
Toast
Alert
FileUpload
DatePicker
Calendar
EmptyState
LoadingState
ConfirmDialog
```

---

# 52. Bento Dashboard Components

Gunakan komponen:

```text
StatCard
NewsCard
EventCard
QuickActionCard
UserCard
ClassCard
AssignmentCard
ActivityCard
AnnouncementCard
```

Semua menggunakan desain konsisten.

---

# 53. Warna UI

Gunakan warna yang dapat dikonfigurasi melalui Tailwind.

Default:

```text
Primary
Secondary
Background
Surface
Border
Text
Muted
Success
Warning
Danger
```

Warna utama dapat disesuaikan dengan identitas sekolah.

---

# 54. Dark Mode

Opsional tetapi direkomendasikan.

Admin dan user dapat memilih:

```text
Light
Dark
System
```

---

# 55. Acceptance Criteria

## Portal Berita

- [ ] Admin dapat membuat berita.
- [ ] Admin dapat mengedit berita.
- [ ] Admin dapat menghapus berita.
- [ ] Admin dapat publish berita.
- [ ] Pengunjung dapat melihat berita.
- [ ] Berita memiliki SEO-friendly slug.

## Kalender

- [ ] Admin dapat membuat event.
- [ ] Pengunjung dapat melihat kalender.
- [ ] Siswa dapat melihat kalender.
- [ ] Kalender responsive.

## Virtual Classroom

- [ ] Guru dapat membuat kelas.
- [ ] Guru dapat upload materi.
- [ ] Siswa dapat melihat materi.
- [ ] Guru dapat membuat tugas.
- [ ] Siswa dapat mengirim tugas.
- [ ] Guru dapat memberikan nilai.

## Forum

- [ ] User dapat membuat thread.
- [ ] User dapat membalas.
- [ ] Guru dapat memoderasi.
- [ ] Admin dapat menghapus konten.

## Pendaftaran

- [ ] Admin dapat mengaktifkan pendaftaran.
- [ ] Admin dapat menonaktifkan pendaftaran.
- [ ] Form tidak dapat digunakan ketika disabled.
- [ ] User dapat mengisi formulir.
- [ ] User dapat upload dokumen.
- [ ] Sistem menghasilkan nomor pendaftaran.
- [ ] Admin dapat melihat pendaftar.
- [ ] Admin dapat menerima pendaftar.
- [ ] Admin dapat menolak pendaftar.
- [ ] Admin dapat memberikan catatan.

## Admin

- [ ] Dashboard tersedia.
- [ ] CRUD berita tersedia.
- [ ] CRUD kalender tersedia.
- [ ] CRUD guru tersedia.
- [ ] CRUD siswa tersedia.
- [ ] CRUD kelas tersedia.
- [ ] CRUD materi tersedia.
- [ ] CRUD tugas tersedia.
- [ ] Manajemen pendaftaran tersedia.
- [ ] Website settings tersedia.

---

# 56. Tahapan Development

## Phase 1 — Foundation

- Laravel 13
- React
- Inertia
- Tailwind
- Authentication
- Database
- Roles
- Permissions
- Admin layout
- Public layout

## Phase 2 — Public Website

- Homepage
- Profil
- Berita
- Kalender
- Guru
- Kontak
- FAQ

## Phase 3 — CMS Admin

- Berita
- Pages
- Banner
- FAQ
- Settings

## Phase 4 — Registration

- Registration settings
- Registration form
- Document upload
- Admin registration dashboard
- Status workflow
- Notification

## Phase 5 — Virtual Classroom

- Classes
- Subjects
- Lessons
- Assignments
- Submission
- Grading

## Phase 6 — Forum

- Categories
- Threads
- Posts
- Moderation
- Reports

## Phase 7 — Optimization

- SEO
- Security
- Cache
- Performance
- Backup
- Activity logs
- Testing

---

# 57. Testing

Automated testing minimal:

```text
Feature Tests
Unit Tests
Authorization Tests
Registration Tests
Upload Tests
Admin Tests
```

Test scenario penting:

```text
Admin disabled registration
→ registration page inaccessible

Admin enabled registration
→ registration page accessible

Student cannot access admin

Teacher cannot access admin settings

Student cannot edit teacher material

User cannot access private registration documents
```

---

# 58. Definition of Done

Fitur dianggap selesai apabila:

- Backend selesai.
- Migration selesai.
- Model & relationship selesai.
- Controller/service selesai.
- Validation selesai.
- Authorization selesai.
- UI selesai.
- Responsive selesai.
- Error handling selesai.
- Loading state tersedia.
- Empty state tersedia.
- Test tersedia.
- Tidak terdapat route unauthorized yang dapat diakses user.

---

# 59. Prinsip Arsitektur

Gunakan struktur Laravel yang maintainable.

Direkomendasikan:

```text
app/
├── Actions/
├── Http/
│   ├── Controllers/
│   ├── Requests/
│   └── Middleware/
├── Models/
├── Policies/
├── Services/
├── Notifications/
└── Support/

resources/
├── js/
│   ├── Components/
│   ├── Layouts/
│   ├── Pages/
│   │   ├── Public/
│   │   ├── Admin/
│   │   ├── Student/
│   │   └── Teacher/
│   └── Hooks/
└── css/

database/
├── migrations/
├── seeders/
└── factories/
```

Hindari menempatkan seluruh business logic di Controller.

Gunakan:

```text
Form Request
Service / Action
Policy
Model
Resource
```

sesuai kebutuhan.

---

# 60. Hasil Akhir

Produk akhir harus menjadi sebuah **School Management & Learning Portal** modern yang memiliki:

```text
PUBLIC WEBSITE
│
├── Homepage
├── Profil
├── Berita
├── Kalender
├── Guru & Staff
├── Pendaftaran
├── FAQ
└── Kontak

AUTHENTICATED PORTAL
│
├── Student Dashboard
├── Teacher Dashboard
├── Virtual Classroom
├── Materi
├── Tugas
├── Forum
└── Kalender

ADMIN
│
├── Dashboard
├── CMS
├── Berita
├── Akademik
├── Guru
├── Siswa
├── Kelas
├── Virtual Classroom
├── Forum Moderation
├── Pendaftaran
├── User Management
└── Settings
```

Prioritas utama adalah **kemudahan penggunaan, keamanan data siswa, responsive design, Bento UI yang modern, serta sistem admin yang memungkinkan seluruh konten website dikelola tanpa mengubah kode program.**