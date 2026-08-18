<?php

use App\Http\Controllers\Admin\AdminAttendanceController;
use App\Http\Controllers\Admin\AdminCalendarController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminForumController;
use App\Http\Controllers\Admin\AdminNewsController;
use App\Http\Controllers\Admin\AdminParentController;
use App\Http\Controllers\Admin\AdminRegistrationController;
use App\Http\Controllers\Admin\AdminSchoolStaffController;
use App\Http\Controllers\Admin\AdminSettingController;
use App\Http\Controllers\Admin\AdminStudentController;
use App\Http\Controllers\Admin\HeroSlideController;
use App\Http\Controllers\Api\AttendanceSyncApiController;
use App\Http\Controllers\Attendance\AttendanceKioskController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Forum\ForumController;
use App\Http\Controllers\HealthCheckController;
use App\Http\Controllers\Parent\ParentDashboardController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\Student\StudentAssignmentController;
use App\Http\Controllers\Student\StudentClassController;
use App\Http\Controllers\Student\StudentDashboardController;
use App\Http\Controllers\Student\StudentLessonController;
use App\Http\Controllers\Teacher\TeacherAssignmentController;
use App\Http\Controllers\Teacher\TeacherCalendarController;
use App\Http\Controllers\Teacher\TeacherClassController;
use App\Http\Controllers\Teacher\TeacherDashboardController;
use App\Http\Controllers\Teacher\TeacherLessonController;
use App\Http\Controllers\Teacher\TeacherSubmissionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| RFID Attendance Kiosk & Sync API Routes (Local Kiosk & Supabase Sync)
|--------------------------------------------------------------------------
*/
Route::get('/attendance', [AttendanceKioskController::class, 'kiosk'])->name('attendance.kiosk');
Route::get('/attendance/kiosk', [AttendanceKioskController::class, 'kiosk']);
Route::post('/attendance/scan', [AttendanceKioskController::class, 'scan'])->name('attendance.scan');
Route::get('/attendance/status', [AttendanceKioskController::class, 'status'])->name('attendance.status');
Route::get('/attendance/dashboard', [AttendanceKioskController::class, 'dashboard'])->name('attendance.dashboard');
Route::get('/attendance/settings', [AttendanceKioskController::class, 'settings'])->name('attendance.settings');
Route::post('/attendance/settings', [AttendanceKioskController::class, 'updateSettings'])->name('attendance.settings.update');
Route::post('/attendance/test-supabase', [AttendanceKioskController::class, 'testSupabase'])->name('attendance.test-supabase');
Route::post('/attendance/sync-students', [AttendanceKioskController::class, 'syncStudents'])->name('attendance.sync-students');
Route::post('/attendance/retry-sync', [AttendanceKioskController::class, 'retrySync'])->name('attendance.retry-sync');

// API Endpoints for external/local Kiosks
Route::post('/api/attendance/scan', [AttendanceKioskController::class, 'scan']);
Route::get('/api/attendance/students', [AttendanceSyncApiController::class, 'students']);
Route::get('/api/sync/students', [AttendanceSyncApiController::class, 'students']);

/*
|--------------------------------------------------------------------------
| Public Routes, Health Check & SEO Sitemap
|--------------------------------------------------------------------------
*/
Route::get('/health', HealthCheckController::class)->name('health');
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap.xml');
Route::get('/', [PublicController::class, 'home'])->name('home');
Route::get('/profil', [PublicController::class, 'profile'])->name('public.profile');
Route::get('/berita', [PublicController::class, 'news'])->name('public.news');
Route::get('/berita/{slug}', [PublicController::class, 'newsDetail'])->name('public.news.detail');
Route::get('/kalender', [PublicController::class, 'calendar'])->name('public.calendar');
Route::get('/guru', [PublicController::class, 'teachers'])->name('public.teachers');
Route::get('/guru-staf', [PublicController::class, 'teachers'])->name('public.staff');
Route::get('/guru-staf/{slug}', [PublicController::class, 'staffDetail'])->name('public.staff.detail');
Route::get('/guru/{slug}', [PublicController::class, 'staffDetail'])->where('slug', '^(?!dashboard|kalender|kelas|materi|tugas|pengumpulan).*$')->name('public.teachers.detail');
Route::get('/kontak', [PublicController::class, 'contact'])->name('public.contact');
Route::get('/faq', [PublicController::class, 'faq'])->name('public.faq');

// Pendaftaran Siswa Baru (PPDB Online)
Route::get('/pendaftaran', [RegistrationController::class, 'index'])->name('public.registration');
Route::post('/pendaftaran', [RegistrationController::class, 'store'])->name('public.registration.store');
Route::get('/pendaftaran/sukses/{registrationNumber}', [RegistrationController::class, 'success'])->name('public.registration.success');

/*
|--------------------------------------------------------------------------
| Guest Authentication Routes
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);

    Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');

    Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('password.store');
});

/*
|--------------------------------------------------------------------------
| Authenticated Common Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/verify-email', EmailVerificationPromptController::class)->name('verification.notice');
    Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
});

/*
|--------------------------------------------------------------------------
| Admin & Super Admin Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:super_admin,admin'])->group(function () {
    Route::get('/admin', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // CMS Hero Slider
    Route::get('/admin/hero-slides', [HeroSlideController::class, 'index'])->name('admin.hero-slides.index');
    Route::get('/admin/hero-slides/create', [HeroSlideController::class, 'create'])->name('admin.hero-slides.create');
    Route::post('/admin/hero-slides', [HeroSlideController::class, 'store'])->name('admin.hero-slides.store');
    Route::get('/admin/hero-slides/{heroSlide}/edit', [HeroSlideController::class, 'edit'])->name('admin.hero-slides.edit');
    Route::post('/admin/hero-slides/{heroSlide}', [HeroSlideController::class, 'update'])->name('admin.hero-slides.update');
    Route::delete('/admin/hero-slides/{heroSlide}', [HeroSlideController::class, 'destroy'])->name('admin.hero-slides.destroy');
    Route::post('/admin/hero-slides/{heroSlide}/toggle-active', [HeroSlideController::class, 'toggleActive'])->name('admin.hero-slides.toggle-active');

    // CMS Berita
    Route::get('/admin/news', [AdminNewsController::class, 'index'])->name('admin.news.index');
    Route::get('/admin/news/create', [AdminNewsController::class, 'create'])->name('admin.news.create');
    Route::post('/admin/news', [AdminNewsController::class, 'store'])->name('admin.news.store');
    Route::get('/admin/news/{news}/edit', [AdminNewsController::class, 'edit'])->name('admin.news.edit');
    Route::post('/admin/news/{news}', [AdminNewsController::class, 'update'])->name('admin.news.update');
    Route::delete('/admin/news/{news}', [AdminNewsController::class, 'destroy'])->name('admin.news.destroy');
    Route::post('/admin/news/{news}/toggle-status', [AdminNewsController::class, 'toggleStatus'])->name('admin.news.toggle-status');

    // CMS Kalender Akademik
    Route::get('/admin/calendar', [AdminCalendarController::class, 'index'])->name('admin.calendar.index');
    Route::get('/admin/kalender', fn () => redirect()->route('admin.calendar.index'));
    Route::post('/admin/calendar', [AdminCalendarController::class, 'store'])->name('admin.calendar.store');
    Route::post('/admin/calendar/{calendar}', [AdminCalendarController::class, 'update'])->name('admin.calendar.update');
    Route::delete('/admin/calendar/{calendar}', [AdminCalendarController::class, 'destroy'])->name('admin.calendar.destroy');
    Route::post('/admin/calendar/{calendar}/toggle-visibility', [AdminCalendarController::class, 'toggleVisibility'])->name('admin.calendar.toggle-visibility');

    // CMS Pendaftaran Siswa Online (PPDB)
    Route::get('/admin/registrations', [AdminRegistrationController::class, 'index'])->name('admin.registrations.index');
    Route::get('/admin/pendaftaran', fn () => redirect()->route('admin.registrations.index'));
    Route::get('/admin/registrations/export-csv', [AdminRegistrationController::class, 'exportCsv'])->name('admin.registrations.export-csv');
    Route::post('/admin/registrations/settings', [AdminRegistrationController::class, 'updateSettings'])->name('admin.registrations.settings');
    Route::get('/admin/registrations/{registration}', [AdminRegistrationController::class, 'show'])->name('admin.registrations.show');
    Route::post('/admin/registrations/{registration}/status', [AdminRegistrationController::class, 'updateStatus'])->name('admin.registrations.status');
    Route::get('/admin/registrations/{registration}/documents/{document}/download', [AdminRegistrationController::class, 'downloadDocument'])->name('admin.registrations.download-document');

    // CMS Guru & Staf
    Route::get('/admin/guru-staff', [AdminSchoolStaffController::class, 'index'])->name('admin.staff.index');
    Route::redirect('/admin/guru', '/admin/guru-staff');
    Route::get('/admin/guru-staff/create', [AdminSchoolStaffController::class, 'create'])->name('admin.staff.create');
    Route::post('/admin/guru-staff', [AdminSchoolStaffController::class, 'store'])->name('admin.staff.store');
    Route::post('/admin/guru-staff/reorder', [AdminSchoolStaffController::class, 'reorder'])->name('admin.staff.reorder');
    Route::get('/admin/guru-staff/{guru_staff}/edit', [AdminSchoolStaffController::class, 'edit'])->name('admin.staff.edit');
    Route::post('/admin/guru-staff/{guru_staff}', [AdminSchoolStaffController::class, 'update'])->name('admin.staff.update');
    Route::delete('/admin/guru-staff/{guru_staff}', [AdminSchoolStaffController::class, 'destroy'])->name('admin.staff.destroy');
    Route::post('/admin/guru-staff/{guru_staff}/toggle-active', [AdminSchoolStaffController::class, 'toggleActive'])->name('admin.staff.toggle-active');

    // Data Siswa & Manajemen Kelas
    Route::get('/admin/students', [AdminStudentController::class, 'index'])->name('admin.students.index');
    Route::redirect('/admin/siswa', '/admin/students');
    Route::get('/admin/students/export', [AdminStudentController::class, 'export'])->name('admin.students.export');
    Route::get('/admin/students/create', [AdminStudentController::class, 'create'])->name('admin.students.create');
    Route::post('/admin/students', [AdminStudentController::class, 'store'])->name('admin.students.store');
    Route::get('/admin/students/template', [AdminStudentController::class, 'downloadTemplate'])->name('admin.students.template');
    Route::post('/admin/students/import/preview', [AdminStudentController::class, 'previewImport'])->name('admin.students.import.preview');
    Route::post('/admin/students/import/error-report', [AdminStudentController::class, 'downloadErrorReport'])->name('admin.students.import.error-report');
    Route::post('/admin/students/import/credentials', [AdminStudentController::class, 'downloadCredentials'])->name('admin.students.import.credentials');
    Route::post('/admin/students/import', [AdminStudentController::class, 'executeImport'])->name('admin.students.import');
    Route::post('/admin/students/batch-promote/preview', [AdminStudentController::class, 'previewBatchPromote'])->name('admin.students.batch-promote.preview');
    Route::post('/admin/students/batch-promote', [AdminStudentController::class, 'batchPromote'])->name('admin.students.batch-promote');
    Route::post('/admin/students/batch-transfer/preview', [AdminStudentController::class, 'previewBatchTransfer'])->name('admin.students.batch-transfer.preview');
    Route::post('/admin/students/batch-transfer', [AdminStudentController::class, 'batchTransfer'])->name('admin.students.batch-transfer');
    Route::get('/admin/students/{student}', [AdminStudentController::class, 'show'])->name('admin.students.show');
    Route::put('/admin/students/{student}/class', [AdminStudentController::class, 'updateClass'])->name('admin.students.update-class');
    Route::post('/admin/students/{student}/link-parent', [AdminStudentController::class, 'linkParent'])->name('admin.students.link-parent');
    Route::post('/admin/students/{student}/attendance', [AdminStudentController::class, 'recordAttendance'])->name('admin.students.attendance');
    Route::post('/admin/students/{student}/assign-rfid', [AdminStudentController::class, 'assignRfid'])->name('admin.students.assign-rfid');
    Route::post('/admin/students/{student}/replace-rfid', [AdminStudentController::class, 'replaceRfid'])->name('admin.students.replace-rfid');
    Route::post('/admin/students/{student}/remove-rfid', [AdminStudentController::class, 'removeRfid'])->name('admin.students.remove-rfid');

    // Manajemen Presensi Siswa (API Ready & Export)
    Route::get('/admin/attendances', [AdminAttendanceController::class, 'index'])->name('admin.attendances.index');
    Route::redirect('/admin/presensi', '/admin/attendances');
    Route::get('/admin/attendances/export', [AdminAttendanceController::class, 'export'])->name('admin.attendances.export');
    Route::post('/admin/attendances', [AdminAttendanceController::class, 'store'])->name('admin.attendances.store');
    Route::post('/admin/attendances/sync', [AdminAttendanceController::class, 'sync'])->name('admin.attendances.sync');

    // Akun Orang Tua / Wali Siswa
    Route::get('/admin/parents', [AdminParentController::class, 'index'])->name('admin.parents.index');
    Route::redirect('/admin/orang-tua', '/admin/parents');
    Route::get('/admin/parents/create', [AdminParentController::class, 'create'])->name('admin.parents.create');
    Route::post('/admin/parents', [AdminParentController::class, 'store'])->name('admin.parents.store');
    Route::get('/admin/parents/{parent}/edit', [AdminParentController::class, 'edit'])->name('admin.parents.edit');
    Route::put('/admin/parents/{parent}', [AdminParentController::class, 'update'])->name('admin.parents.update');
    Route::delete('/admin/parents/{parent}', [AdminParentController::class, 'destroy'])->name('admin.parents.destroy');

    // CMS Forum Moderation & Categories
    Route::get('/admin/forum', [AdminForumController::class, 'index'])->name('admin.forum.index');
    Route::post('/admin/forum/reports/{report}/review', [AdminForumController::class, 'reviewReport'])->name('admin.forum.reports.review');
    Route::post('/admin/forum/toggle-hide', [AdminForumController::class, 'toggleHide'])->name('admin.forum.toggle-hide');
    Route::post('/admin/forum/categories', [AdminForumController::class, 'storeCategory'])->name('admin.forum.categories.store');
    Route::delete('/admin/forum/categories/{category}', [AdminForumController::class, 'destroyCategory'])->name('admin.forum.categories.destroy');

    // Pengaturan Sistem & Konfigurasi Presensi API / Supabase
    Route::get('/admin/settings', [AdminSettingController::class, 'index'])->name('admin.settings');
    Route::post('/admin/settings/attendance', [AdminSettingController::class, 'updateAttendance'])->name('admin.settings.attendance');
    Route::post('/admin/settings/attendance/test', [AdminSettingController::class, 'testAttendanceApi'])->name('admin.settings.attendance.test');
});

/*
|--------------------------------------------------------------------------
| Forum Diskusi Routes (Public / Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::get('/forum', [ForumController::class, 'index'])->name('forum.index');
    Route::get('/forum/kategori/{category:slug}', [ForumController::class, 'category'])->name('forum.category');
    Route::get('/forum/thread/{thread:slug}', [ForumController::class, 'show'])->name('forum.show');

    Route::post('/forum/threads', [ForumController::class, 'storeThread'])->name('forum.threads.store');
    Route::put('/forum/threads/{thread}', [ForumController::class, 'updateThread'])->name('forum.threads.update');
    Route::delete('/forum/threads/{thread}', [ForumController::class, 'destroyThread'])->name('forum.threads.destroy');

    Route::post('/forum/threads/{thread}/replies', [ForumController::class, 'storePost'])->name('forum.posts.store');
    Route::put('/forum/posts/{post}', [ForumController::class, 'updatePost'])->name('forum.posts.update');
    Route::delete('/forum/posts/{post}', [ForumController::class, 'destroyPost'])->name('forum.posts.destroy');

    Route::post('/forum/reactions/toggle', [ForumController::class, 'toggleReaction'])->name('forum.reactions.toggle');
    Route::post('/forum/reports', [ForumController::class, 'report'])->name('forum.reports.store');

    Route::post('/forum/threads/{thread}/pin', [ForumController::class, 'togglePin'])->name('forum.threads.pin');
    Route::post('/forum/threads/{thread}/lock', [ForumController::class, 'toggleLock'])->name('forum.threads.lock');
});

/*
|--------------------------------------------------------------------------
| Teacher Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:teacher'])->group(function () {
    Route::get('/guru/dashboard', [TeacherDashboardController::class, 'index'])->name('teacher.dashboard');
    Route::get('/guru/kalender', [TeacherCalendarController::class, 'index'])->name('teacher.calendar');
    Route::redirect('/teacher', '/guru/dashboard');

    // Virtual Classroom Guru
    Route::get('/guru/kelas', [TeacherClassController::class, 'index'])->name('teacher.classes.index');
    Route::get('/guru/kelas/{class}', [TeacherClassController::class, 'show'])->name('teacher.classes.show');
    Route::post('/guru/kelas', [TeacherClassController::class, 'store'])->name('teacher.classes.store');

    Route::get('/guru/materi', [TeacherLessonController::class, 'index'])->name('teacher.lessons.index');
    Route::post('/guru/materi', [TeacherLessonController::class, 'store'])->name('teacher.lessons.store');
    Route::delete('/guru/materi/{lesson}', [TeacherLessonController::class, 'destroy'])->name('teacher.lessons.destroy');

    Route::get('/guru/tugas', [TeacherAssignmentController::class, 'index'])->name('teacher.assignments.index');
    Route::post('/guru/tugas', [TeacherAssignmentController::class, 'store'])->name('teacher.assignments.store');
    Route::delete('/guru/tugas/{assignment}', [TeacherAssignmentController::class, 'destroy'])->name('teacher.assignments.destroy');

    Route::get('/guru/pengumpulan', [TeacherSubmissionController::class, 'index'])->name('teacher.submissions.index');
    Route::post('/guru/pengumpulan/{submission}/grade', [TeacherSubmissionController::class, 'grade'])->name('teacher.submissions.grade');
    Route::get('/guru/pengumpulan/{submission}/download', [TeacherSubmissionController::class, 'download'])->name('teacher.submissions.download');
});

/*
|--------------------------------------------------------------------------
| Student Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:student'])->group(function () {
    Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('student.dashboard');
    Route::redirect('/student', '/dashboard');

    // Virtual Classroom Siswa
    Route::get('/kelas', [StudentClassController::class, 'index'])->name('student.classes.index');
    Route::get('/kelas/{class}', [StudentClassController::class, 'show'])->name('student.classes.show');

    Route::get('/materi', [StudentLessonController::class, 'index'])->name('student.lessons.index');
    Route::get('/materi/{lesson}', [StudentLessonController::class, 'show'])->name('student.lessons.show');
    Route::get('/materi/files/{file}/download', [StudentLessonController::class, 'download'])->name('student.lessons.download');

    Route::get('/tugas', [StudentAssignmentController::class, 'index'])->name('student.assignments.index');
    Route::get('/tugas/{assignment}', [StudentAssignmentController::class, 'show'])->name('student.assignments.show');
    Route::post('/tugas/{assignment}/submit', [StudentAssignmentController::class, 'submit'])->name('student.assignments.submit');
    Route::get('/tugas/submissions/{submission}/download', [StudentAssignmentController::class, 'downloadSubmission'])->name('student.submissions.download');
});

/*
|--------------------------------------------------------------------------
| Parent Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:parent'])->group(function () {
    Route::get('/parent/dashboard', [ParentDashboardController::class, 'index'])->name('parent.dashboard');
    Route::redirect('/parent', '/parent/dashboard');
});
