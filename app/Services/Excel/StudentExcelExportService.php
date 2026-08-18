<?php

namespace App\Services\Excel;

use App\Models\Student;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class StudentExcelExportService
{
    /**
     * Export all students or filtered students to XLSX workbook.
     */
    public function export(array $filters = []): string
    {
        $query = Student::with(['user', 'parent.user', 'classes.academicYear', 'activeEnrollment.classRoom', 'activeEnrollment.academicYear'])
            ->orderBy('id', 'asc');

        if (! empty($filters['class_id']) && $filters['class_id'] !== 'all') {
            $query->whereHas('classes', fn ($c) => $c->where('classes.id', $filters['class_id']));
        }

        if (! empty($filters['parent_status'])) {
            if ($filters['parent_status'] === 'linked') {
                $query->whereNotNull('parent_id');
            } elseif ($filters['parent_status'] === 'unlinked') {
                $query->whereNull('parent_id');
            }
        }

        if (! empty($filters['search'])) {
            $term = trim($filters['search']);
            $query->where(function ($q) use ($term) {
                $q->where('nisn', 'like', "%{$term}%")
                    ->orWhere('nis', 'like', "%{$term}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%"));
            });
        }

        $students = $query->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Data Siswa');

        // Title
        $sheet->setCellValue('A1', 'DATA POKOK SISWA & ROMBONGAN BELAJAR');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->setColor(new Color('1E293B'));

        $sheet->setCellValue('A2', 'Diekspor pada: '.Carbon::now()->isoFormat('D MMMM Y, HH:mm').' WIB');
        $sheet->getStyle('A2')->getFont()->setItalic(true)->setSize(10)->setColor(new Color('64748B'));

        $headers = [
            'No',
            'NIS',
            'NISN',
            'Nama Lengkap',
            'L/P',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Email',
            'No Telepon',
            'Alamat',
            'Tahun Ajaran',
            'Kelas / Rombel',
            'Status',
            'Orang Tua / Wali',
        ];

        $cols = range('A', 'N');

        foreach ($headers as $idx => $h) {
            $sheet->setCellValue("{$cols[$idx]}4", $h);
        }

        $sheet->getStyle('A4:N4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E293B']], // Slate 800
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(4)->setRowHeight(28);

        $r = 5;
        foreach ($students as $idx => $student) {
            $activeClass = $student->activeEnrollment?->classRoom ?? $student->classes->first();
            $activeYear = $student->activeEnrollment?->academicYear ?? $activeClass?->academicYear;

            $sheet->setCellValue("A{$r}", $idx + 1);
            $sheet->setCellValueExplicit("B{$r}", $this->sanitizeCellValue($student->nis), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("C{$r}", $this->sanitizeCellValue($student->nisn), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("D{$r}", $this->sanitizeCellValue($student->user?->name ?? 'Siswa'), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("E{$r}", $this->sanitizeCellValue($student->gender ?? 'L'), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("F{$r}", $this->sanitizeCellValue($student->birth_place), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("G{$r}", $student->birth_date ? Carbon::parse($student->birth_date)->format('Y-m-d') : '-', DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("H{$r}", $this->sanitizeCellValue($student->user?->email), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("I{$r}", $this->sanitizeCellValue($student->phone), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("J{$r}", $this->sanitizeCellValue($student->address), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("K{$r}", $this->sanitizeCellValue($activeYear?->name ?? '2026/2027'), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("L{$r}", $this->sanitizeCellValue($activeClass?->name ?? $student->grade_level), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("M{$r}", $this->sanitizeCellValue($student->activeEnrollment?->status_label ?? 'Aktif'), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("N{$r}", $this->sanitizeCellValue($student->parent?->user?->name ?? 'Belum Ditautkan'), DataType::TYPE_STRING);

            $sheet->getStyle("A{$r}:N{$r}")->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $sheet->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("E{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getRowDimension($r)->setRowHeight(22);
            $r++;
        }

        foreach ($cols as $c) {
            $sheet->getColumnDimension($c)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $binary = ob_get_clean();

        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        return $binary;
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
