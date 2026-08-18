<?php

namespace App\Services\Excel;

use App\Models\ClassModel;
use App\Models\StudentAttendance;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class AttendanceExcelExportService
{
    /**
     * Export attendance data to multi-sheet XLSX workbook.
     */
    public function export(array $filters = []): array
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

        if (! empty($filters['student_id']) && $filters['student_id'] !== 'all') {
            $query->where('student_id', $filters['student_id']);
        }

        $records = $query->get();

        $spreadsheet = new Spreadsheet;

        // ----------------------------------------------------
        // SHEET 1: Presensi
        // ----------------------------------------------------
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Presensi');

        // Headers
        $headers = [
            'No',
            'NIS',
            'NISN',
            'Nama Siswa',
            'Kelas',
            'Tanggal',
            'Hari',
            'Check In',
            'Check Out',
            'Status',
            'Source',
            'External ID',
            'Keterangan',
        ];

        $cols = range('A', 'M');

        foreach ($headers as $idx => $h) {
            $sheet1->setCellValue("{$cols[$idx]}1", $h);
        }

        $sheet1->getStyle('A1:M1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E293B']], // Slate 800
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet1->getRowDimension(1)->setRowHeight(28);

        $dayNames = [
            0 => 'Minggu',
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
        ];

        $r = 2;
        foreach ($records as $idx => $att) {
            $carbonDate = $att->date ? Carbon::parse($att->date) : null;
            $dayName = $carbonDate ? ($dayNames[$carbonDate->dayOfWeek] ?? '') : '-';

            $sheet1->setCellValue("A{$r}", $idx + 1);
            $sheet1->setCellValueExplicit("B{$r}", $this->sanitizeCellValue($att->student?->nis), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("C{$r}", $this->sanitizeCellValue($att->student?->nisn), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("D{$r}", $this->sanitizeCellValue($att->student?->user?->name ?? 'Siswa'), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("E{$r}", $this->sanitizeCellValue($att->classRoom?->name ?? $att->student?->grade_level), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("F{$r}", $carbonDate ? $carbonDate->format('Y-m-d') : '-', DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("G{$r}", $dayName, DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("H{$r}", $this->sanitizeCellValue($att->check_in), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("I{$r}", $this->sanitizeCellValue($att->check_out), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("J{$r}", $this->sanitizeCellValue($att->status_label), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("K{$r}", $this->sanitizeCellValue($att->source_label), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("L{$r}", $this->sanitizeCellValue($att->external_id), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("M{$r}", $this->sanitizeCellValue($att->notes), DataType::TYPE_STRING);

            $sheet1->getStyle("A{$r}:M{$r}")->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $sheet1->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet1->getStyle("F{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet1->getStyle("G{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet1->getStyle("H{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet1->getStyle("I{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet1->getStyle("J{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet1->getRowDimension($r)->setRowHeight(22);
            $r++;
        }

        foreach ($cols as $c) {
            $sheet1->getColumnDimension($c)->setAutoSize(true);
        }

        // ----------------------------------------------------
        // SHEET 2: Summary
        // ----------------------------------------------------
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Summary');

        $summaryHeaders = [
            'Kelas',
            'Periode',
            'Jumlah Siswa',
            'Hadir',
            'Terlambat',
            'Sakit',
            'Izin',
            'Alpha',
        ];
        $sCols = range('A', 'H');

        foreach ($summaryHeaders as $idx => $sh) {
            $sheet2->setCellValue("{$sCols[$idx]}1", $sh);
        }

        $sheet2->getStyle('A1:H1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4338CA']], // Indigo 700
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet2->getRowDimension(1)->setRowHeight(28);

        // Group summary by class
        $grouped = $records->groupBy('class_id');
        $classesMap = ClassModel::all()->keyBy('id');

        $sr = 2;
        $periodeLabel = (! empty($filters['start_date']) && ! empty($filters['end_date']))
            ? "{$filters['start_date']} s/d {$filters['end_date']}"
            : ($filters['date'] ?? Carbon::today()->format('Y-m-d'));

        if ($grouped->isEmpty()) {
            $className = (! empty($filters['class_id']) && $filters['class_id'] !== 'all')
                ? ($classesMap->get($filters['class_id'])?->name ?? 'Kelas')
                : 'Semua Kelas';

            $sheet2->setCellValue("A{$sr}", $className);
            $sheet2->setCellValue("B{$sr}", $periodeLabel);
            $sheet2->setCellValue("C{$sr}", 0);
            $sheet2->setCellValue("D{$sr}", 0);
            $sheet2->setCellValue("E{$sr}", 0);
            $sheet2->setCellValue("F{$sr}", 0);
            $sheet2->setCellValue("G{$sr}", 0);
            $sheet2->setCellValue("H{$sr}", 0);
            $sheet2->getStyle("A{$sr}:H{$sr}")->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
            ]);
        } else {
            foreach ($grouped as $cId => $items) {
                $cName = $cId ? ($classesMap->get($cId)?->name ?? "Kelas #{$cId}") : 'Tanpa Kelas';
                $studentCount = $items->pluck('student_id')->unique()->count();
                $hadir = $items->where('status', 'present')->count();
                $sakit = $items->where('status', 'sick')->count();
                $izin = $items->where('status', 'permission')->count();
                $alpha = $items->where('status', 'absent')->count();
                $terlambat = $items->filter(fn ($it) => $it->check_in && $it->check_in > '07:30')->count();

                $sheet2->setCellValue("A{$sr}", $cName);
                $sheet2->setCellValue("B{$sr}", $periodeLabel);
                $sheet2->setCellValue("C{$sr}", $studentCount);
                $sheet2->setCellValue("D{$sr}", $hadir);
                $sheet2->setCellValue("E{$sr}", $terlambat);
                $sheet2->setCellValue("F{$sr}", $sakit);
                $sheet2->setCellValue("G{$sr}", $izin);
                $sheet2->setCellValue("H{$sr}", $alpha);

                $sheet2->getStyle("A{$sr}:H{$sr}")->applyFromArray([
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $sheet2->getStyle("C{$sr}:H{$sr}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet2->getRowDimension($sr)->setRowHeight(22);
                $sr++;
            }
        }

        foreach ($sCols as $sc) {
            $sheet2->getColumnDimension($sc)->setAutoSize(true);
        }

        // Set active sheet to 0
        $spreadsheet->setActiveSheetIndex(0);

        $writer = new Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $binary = ob_get_clean();

        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        // Filename generator
        $classSlug = (! empty($filters['class_id']) && $filters['class_id'] !== 'all')
            ? str_replace(' ', '_', $classesMap->get($filters['class_id'])?->name ?? 'Kelas')
            : 'Semua_Kelas';
        $dateSlug = (! empty($filters['start_date']) && ! empty($filters['end_date']))
            ? "{$filters['start_date']}_sd_{$filters['end_date']}"
            : ($filters['date'] ?? Carbon::today()->format('Y-m'));

        $filename = "presensi_{$classSlug}_{$dateSlug}.xlsx";

        return [
            'binary' => $binary,
            'filename' => $filename,
        ];
    }

    /**
     * Sanitize cell value to prevent CSV / Excel formula injection.
     */
    protected function sanitizeCellValue(?string $value): string
    {
        if ($value === null || $value === '') {
            return '-';
        }

        $trimmed = trim($value);
        if (in_array(substr($trimmed, 0, 1), ['=', '+', '-', '@', "\t", "\r"])) {
            return "'".$trimmed;
        }

        return $trimmed;
    }
}
