<?php

namespace App\Services;

use App\Models\StudentAttendance;
use Carbon\Carbon;

class AttendanceExportService
{
    /**
     * Generate formatted CSV export of student attendance records.
     */
    public function export(array $filters = []): string
    {
        $query = StudentAttendance::with(['student.user', 'classRoom', 'recorder'])
            ->orderBy('date', 'desc')
            ->orderBy('class_id', 'asc');

        if (! empty($filters['class_id']) && $filters['class_id'] !== 'all') {
            $query->where('class_id', $filters['class_id']);
        }

        if (! empty($filters['start_date']) && ! empty($filters['end_date'])) {
            $query->whereBetween('date', [
                Carbon::parse($filters['start_date'])->toDateString(),
                Carbon::parse($filters['end_date'])->toDateString(),
            ]);
        } elseif (! empty($filters['date'])) {
            $query->whereDate('date', Carbon::parse($filters['date'])->toDateString());
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['source']) && $filters['source'] !== 'all') {
            $query->where('source', $filters['source']);
        }

        $records = $query->get();

        $headers = [
            'No',
            'Tanggal',
            'NISN',
            'NIS',
            'Nama Siswa',
            'Kelas / Rombel',
            'Status Kehadiran',
            'Jam Masuk (Check-In)',
            'Jam Pulang (Check-Out)',
            'Sumber Data',
            'Dicatat Oleh',
            'Catatan',
        ];

        $output = fopen('php://temp', 'r+');
        fputcsv($output, $headers);

        foreach ($records as $index => $att) {
            fputcsv($output, [
                $index + 1,
                $att->date ? Carbon::parse($att->date)->format('Y-m-d') : '-',
                $att->student?->nisn ?? '-',
                $att->student?->nis ?? '-',
                $att->student?->user?->name ?? 'Siswa',
                $att->classRoom?->name ?? $att->student?->grade_level ?? '-',
                $att->status_label,
                $att->check_in ?? '-',
                $att->check_out ?? '-',
                $att->source_label,
                $att->recorder?->name ?? 'Sistem Otomatis',
                $att->notes ?? '-',
            ]);
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }
}
