<?php

namespace Database\Seeders;

use App\Models\AcademicEvent;
use App\Models\AcademicYear;
use App\Models\User;
use Illuminate\Database\Seeder;

class AcademicCalendarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::role(['super_admin', 'admin'])->first() ?? User::first();
        $adminId = $admin ? $admin->id : 1;

        $academicYear = AcademicYear::updateOrCreate(
            ['name' => '2026/2027', 'semester' => 'Ganjil'],
            [
                'start_date' => '2026-07-15',
                'end_date' => '2026-12-20',
                'is_active' => true,
            ]
        );

        $events = [
            [
                'academic_year_id' => $academicYear->id,
                'title' => 'Upacara Peringatan Hari Kemerdekaan RI ke-81',
                'description' => 'Upacara bendera bendera merah putih mengenakan pakaian adat nusantara atau seragam resmi sekolah.',
                'start_date' => '2026-08-17',
                'end_date' => '2026-08-17',
                'start_time' => '07:00:00',
                'end_time' => '09:30:00',
                'category' => 'event',
                'location' => 'Lapangan Utama Sekolah',
                'is_public' => true,
                'created_by' => $adminId,
            ],
            [
                'academic_year_id' => $academicYear->id,
                'title' => 'Asesmen Diagnostik & Pemetaan Minat Bakat Siswa Baru Kelas X',
                'description' => 'Tes pemetaan peminatan akademik dan psikotes minat bakat untuk program pendampingan intensif.',
                'start_date' => '2026-08-25',
                'end_date' => '2026-08-25',
                'start_time' => '08:00:00',
                'end_time' => '12:00:00',
                'category' => 'academic',
                'location' => 'Lab Komputer 1 & 2',
                'is_public' => true,
                'created_by' => $adminId,
            ],
            [
                'academic_year_id' => $academicYear->id,
                'title' => 'Rapat Pleno Dewan Guru & Koordinasi Kurikulum',
                'description' => 'Rapat evaluasi 1 bulan awal semester ganjil dan penyelarasan modul ajar digital antar rumpun mapel.',
                'start_date' => '2026-08-28',
                'end_date' => '2026-08-28',
                'start_time' => '13:30:00',
                'end_time' => '16:00:00',
                'category' => 'meeting',
                'location' => 'Ruang Guru & Meeting Room Lt. 2',
                'is_public' => false, // Internal Guru Only
                'created_by' => $adminId,
            ],
            [
                'academic_year_id' => $academicYear->id,
                'title' => 'Workshop Karir & Sosialisasi SNBP / SNBT 2027',
                'description' => 'Seminar bimbingan studi lanjut bersama perwakilan perguruan tinggi negeri dan alumni berprestasi.',
                'start_date' => '2026-09-02',
                'end_date' => '2026-09-02',
                'start_time' => '09:00:00',
                'end_time' => '12:30:00',
                'category' => 'academic',
                'location' => 'Auditorium Lt. 3',
                'is_public' => true,
                'created_by' => $adminId,
            ],
            [
                'academic_year_id' => $academicYear->id,
                'title' => 'Penilaian Tengah Semester (PTS) Ganjil TA 2026/2027',
                'description' => 'Pelaksanaan evaluasi tengah semester secara hibrida menggunakan platform CBT portal sekolah.',
                'start_date' => '2026-09-15',
                'end_date' => '2026-09-22',
                'start_time' => '07:30:00',
                'end_time' => '13:00:00',
                'category' => 'exam',
                'location' => 'Ruang Kelas & CBT Online',
                'is_public' => true,
                'created_by' => $adminId,
            ],
            [
                'academic_year_id' => $academicYear->id,
                'title' => 'Rapat Pembahasan Nilai Tengah Semester & Remedial Guru',
                'description' => 'Evaluasi capaian nilai PTS siswa dan persiapan program pengayaan/remedial terstruktur.',
                'start_date' => '2026-09-25',
                'end_date' => '2026-09-25',
                'start_time' => '14:00:00',
                'end_time' => '16:30:00',
                'category' => 'meeting',
                'location' => 'Ruang Sidang Lt. 2',
                'is_public' => false, // Internal Guru Only
                'created_by' => $adminId,
            ],
            [
                'academic_year_id' => $academicYear->id,
                'title' => 'Pekan Olahraga & Seni Antar Kelas (Class Meeting)',
                'description' => 'Ajang kreativitas, pertandingan olahraga futsal/basket, kompetisi e-sport edukatif, dan pentas musik siswa.',
                'start_date' => '2026-10-05',
                'end_date' => '2026-10-08',
                'start_time' => '08:00:00',
                'end_time' => '15:00:00',
                'category' => 'activity',
                'location' => 'Gelanggang Olahraga & Aula',
                'is_public' => true,
                'created_by' => $adminId,
            ],
            [
                'academic_year_id' => $academicYear->id,
                'title' => 'Libur Nasional Maulid Nabi Muhammad SAW',
                'description' => 'Hari libur resmi nasional sesuai surat keputusan bersama menteri.',
                'start_date' => '2026-09-16',
                'end_date' => '2026-09-16',
                'start_time' => null,
                'end_time' => null,
                'category' => 'holiday',
                'location' => '-',
                'is_public' => true,
                'created_by' => $adminId,
            ],
        ];

        foreach ($events as $event) {
            AcademicEvent::updateOrCreate(
                [
                    'title' => $event['title'],
                    'start_date' => $event['start_date'],
                ],
                $event
            );
        }
    }
}
