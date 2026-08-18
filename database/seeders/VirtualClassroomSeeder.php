<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\ClassModel;
use App\Models\ClassTeacher;
use App\Models\Lesson;
use App\Models\LessonFile;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;

class VirtualClassroomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $academicYear = AcademicYear::where('is_active', true)->first() ?? AcademicYear::create([
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'start_date' => '2026-07-15',
            'end_date' => '2026-12-20',
            'is_active' => true,
        ]);

        $teacher = Teacher::first();
        if (! $teacher) {
            $teacherUser = User::role('teacher')->first() ?? User::first();
            $teacher = Teacher::create([
                'user_id' => $teacherUser->id,
                'nip' => '198501012010011001',
                'title' => 'Guru Informatika & Komputer',
                'specialization' => 'Informatika',
            ]);
        }

        $student = Student::first();
        if (! $student) {
            $studentUser = User::role('student')->first() ?? User::first();
            $student = Student::create([
                'user_id' => $studentUser->id,
                'nisn' => '0091234567',
                'nis' => '20261001',
                'grade_level' => '10',
            ]);
        }

        // 1. Subjects
        $subjectsData = [
            ['code' => 'INF-10', 'name' => 'Informatika & Pemrograman AI', 'description' => 'Materi algoritma pemrograman, kecerdasan buatan, dan logika komputasional.'],
            ['code' => 'MAT-10', 'name' => 'Matematika Peminatan MIPA', 'description' => 'Eksplorasi kalkulus dasar, trigonometri analitik, dan matriks transformasi.'],
            ['code' => 'FIS-10', 'name' => 'Fisika Teori & Praktikum', 'description' => 'Kajian mekanika fluida, kinematika partikel, dan termodinamika terapan.'],
            ['code' => 'ING-10', 'name' => 'Bahasa & Sastra Inggris', 'description' => 'Pengembangan kemampuan academic writing, listening TOEFL prep, dan public speech.'],
        ];

        $subjects = [];
        foreach ($subjectsData as $sData) {
            $subjects[$sData['code']] = Subject::updateOrCreate(['code' => $sData['code']], $sData);
        }

        // 2. Classes
        $class10 = ClassModel::updateOrCreate(
            ['name' => 'X MIPA 1'],
            [
                'academic_year_id' => $academicYear->id,
                'grade_level' => '10',
                'section' => 'MIPA 1',
                'homeroom_teacher_id' => $teacher->id,
            ]
        );

        $class11 = ClassModel::updateOrCreate(
            ['name' => 'XI MIPA 1'],
            [
                'academic_year_id' => $academicYear->id,
                'grade_level' => '11',
                'section' => 'MIPA 1',
                'homeroom_teacher_id' => $teacher->id,
            ]
        );

        // 3. Course Offerings (ClassTeacher)
        $course1 = ClassTeacher::updateOrCreate(
            ['class_id' => $class10->id, 'teacher_id' => $teacher->id, 'subject_id' => $subjects['INF-10']->id]
        );

        $course2 = ClassTeacher::updateOrCreate(
            ['class_id' => $class10->id, 'teacher_id' => $teacher->id, 'subject_id' => $subjects['MAT-10']->id]
        );

        $course3 = ClassTeacher::updateOrCreate(
            ['class_id' => $class11->id, 'teacher_id' => $teacher->id, 'subject_id' => $subjects['INF-10']->id]
        );

        // 4. Enroll Student in Class
        $class10->students()->syncWithoutDetaching([$student->id]);

        // 5. Lessons for Course 1 (Informatika X MIPA 1)
        $lesson1 = Lesson::updateOrCreate(
            ['class_teacher_id' => $course1->id, 'title' => 'Pengantar Berpikir Komputasional & Flowchart'],
            [
                'slug' => 'pengantar-berpikir-komputasional-dan-flowchart',
                'content' => "Selamat datang di modul perdana Informatika Kelas X.\n\nPembahasan modul ini mencakup 4 pilar utama computational thinking:\n1. Dekomposisi: Memecah masalah kompleks menjadi bagian-bagian terkelola.\n2. Pengenalan Pola: Mengidentifikasi kesamaan dan tren dari sekumpulan data.\n3. Abstraksi: Fokus pada informasi esensial dan mengabaikan detail yang tidak relevan.\n4. Desain Algoritma: Menyusun langkah-langkah sistematis penyelesaian persoalan.",
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'is_published' => true,
                'published_at' => now()->subDays(3),
            ]
        );

        LessonFile::updateOrCreate(
            ['lesson_id' => $lesson1->id, 'original_name' => 'Modul_01_Computational_Thinking.pdf'],
            [
                'file_path' => 'lessons/sample_modul_1.pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 1048576,
            ]
        );

        $lesson2 = Lesson::updateOrCreate(
            ['class_teacher_id' => $course1->id, 'title' => 'Struktur Kontrol Percabangan (If-Else) & Perulangan (Loop)'],
            [
                'slug' => 'struktur-kontrol-percabangan-dan-perulangan',
                'content' => "Pada materi ini kita mempelajari sintaks dasar logika kontrol alur program:\n\n- Conditional Statements: if, elif, else.\n- Iterative Loops: for loop dan while loop.\n\nSilakan unduh modul latihan dan pelajari contoh kode terlampir.",
                'is_published' => true,
                'published_at' => now()->subDay(),
            ]
        );

        // 6. Assignments for Course 1
        $assignment1 = Assignment::updateOrCreate(
            ['class_teacher_id' => $course1->id, 'title' => 'Tugas Praktik 01: Membuat Algoritma Flowchart Sistem Antrean'],
            [
                'description' => "Instruksi Pengerjaan Tugas:\n1. Buat diagram alir (flowchart) sistem antrean loket menggunakan standar simbol ANSI/ISO.\n2. Sertakan studi kasus validasi tiket dan pemanggilan nomor antrean otomatis.\n3. Format berkas pengumpulan: PDF atau gambar PNG/JPG beresolusi jelas (Maks 5MB).",
                'deadline' => now()->addDays(7),
                'allow_late_submission' => true,
                'max_score' => 100,
                'status' => 'published',
            ]
        );

        $assignment2 = Assignment::updateOrCreate(
            ['class_teacher_id' => $course1->id, 'title' => 'Latihan Mandiri 01: Logika Percabangan Python'],
            [
                'description' => 'Selesaikan 3 studi kasus pemrograman logika percabangan di Google Colab atau VS Code, lalu kumpulkan tangkapan layar eksekusi kode beserta berkas .py/.ipynb.',
                'deadline' => now()->subDays(2),
                'allow_late_submission' => false,
                'max_score' => 100,
                'status' => 'published',
            ]
        );

        // 7. Student Submissions
        AssignmentSubmission::updateOrCreate(
            ['assignment_id' => $assignment2->id, 'student_id' => $student->id],
            [
                'file_path' => 'submissions/sample_jawaban.pdf',
                'notes' => 'Telah selesai dikerjakan sesuai petunjuk modul 1 & 2. Terima kasih Pak.',
                'status' => 'graded',
                'score' => 95.00,
                'feedback' => 'Analisis alur logika sangat runtut dan penamaan variabel rapi. Pertahankan prestasinya!',
                'graded_by' => $teacher->user_id,
                'graded_at' => now()->subDay(),
                'submitted_at' => now()->subDays(3),
            ]
        );
    }
}
