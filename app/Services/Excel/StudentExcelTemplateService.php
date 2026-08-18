<?php

namespace App\Services\Excel;

use App\Models\AcademicYear;
use App\Models\ClassModel;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class StudentExcelTemplateService
{
    /**
     * Generate official template_import_siswa.xlsx with 2 sheets and data validation.
     */
    public function generate(): string
    {
        $spreadsheet = new Spreadsheet;

        // ----------------------------------------------------
        // SHEET 1: Data Siswa
        // ----------------------------------------------------
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Data Siswa');

        $headers = [
            'A1' => 'nis',
            'B1' => 'nisn',
            'C1' => 'nama_lengkap',
            'D1' => 'jenis_kelamin',
            'E1' => 'tempat_lahir',
            'F1' => 'tanggal_lahir',
            'G1' => 'email',
            'H1' => 'no_hp',
            'I1' => 'alamat',
            'J1' => 'tahun_ajaran',
            'K1' => 'kelas',
            'L1' => 'username',
            'P1' => 'password',
            'N1' => 'status',
        ];

        // Adjusted keys properly: A to N (14 columns)
        $columnMap = [
            'A1' => 'nis',
            'B1' => 'nisn',
            'C1' => 'nama_lengkap',
            'D1' => 'jenis_kelamin',
            'E1' => 'tempat_lahir',
            'F1' => 'tanggal_lahir',
            'G1' => 'email',
            'H1' => 'no_hp',
            'I1' => 'alamat',
            'J1' => 'tahun_ajaran',
            'K1' => 'kelas',
            'L1' => 'username',
            'M1' => 'password',
            'N1' => 'status',
        ];

        foreach ($columnMap as $cell => $headerName) {
            $sheet1->setCellValue($cell, $headerName);
        }

        // Header Styling
        $headerStyle = [
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1E293B'], // Slate 800
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '475569'],
                ],
            ],
        ];
        $sheet1->getStyle('A1:N1')->applyFromArray($headerStyle);
        $sheet1->getRowDimension(1)->setRowHeight(28);

        // Fetch dynamic years and classes from database for sample
        $activeYear = AcademicYear::where('is_active', true)->first()?->name ?? '2026/2027';
        $firstClass = ClassModel::first()?->name ?? 'X MIPA 1';

        // Sample Data Rows (Row 2 & 3)
        $sampleData = [
            [
                '20260001',
                '1234567890',
                'Budi Santoso',
                'L',
                'Bogor',
                '2012-05-10',
                'budi.santoso@schid.test',
                '08123456789',
                'Jl. Raya Pajajaran No. 12, Bogor',
                $activeYear,
                $firstClass,
                '', // username empty -> auto NIS
                '', // password empty -> auto generated
                'active',
            ],
            [
                '20260002',
                '1234567891',
                'Siti Aisyah Rahma',
                'P',
                'Bandung',
                '2012-08-15',
                'siti.aisyah@schid.test',
                '08123456780',
                'Jl. Dago Asri No. 45, Bandung',
                $activeYear,
                $firstClass,
                '',
                '',
                'active',
            ],
        ];

        $rowNum = 2;
        foreach ($sampleData as $row) {
            $colLetter = 'A';
            foreach ($row as $val) {
                $sheet1->setCellValueExplicit("{$colLetter}{$rowNum}", $val, DataType::TYPE_STRING);
                $colLetter++;
            }
            $rowNum++;
        }

        // Add Data Validation dropdowns for 100 rows
        for ($r = 2; $r <= 100; $r++) {
            // Jenis Kelamin (Col D)
            $validationGender = $sheet1->getCell("D{$r}")->getDataValidation();
            $validationGender->setType(DataValidation::TYPE_LIST);
            $validationGender->setErrorStyle(DataValidation::STYLE_INFORMATION);
            $validationGender->setAllowBlank(false);
            $validationGender->setShowInputMessage(true);
            $validationGender->setShowErrorMessage(true);
            $validationGender->setShowDropDown(true);
            $validationGender->setErrorTitle('Pilihan Tidak Valid');
            $validationGender->setError('Pilih L untuk Laki-laki atau P untuk Perempuan.');
            $validationGender->setPromptTitle('Jenis Kelamin');
            $validationGender->setPrompt('Pilih L atau P');
            $validationGender->setFormula1('"L,P"');

            // Status (Col N)
            $validationStatus = $sheet1->getCell("N{$r}")->getDataValidation();
            $validationStatus->setType(DataValidation::TYPE_LIST);
            $validationStatus->setErrorStyle(DataValidation::STYLE_INFORMATION);
            $validationStatus->setAllowBlank(false);
            $validationStatus->setShowInputMessage(true);
            $validationStatus->setShowErrorMessage(true);
            $validationStatus->setShowDropDown(true);
            $validationStatus->setErrorTitle('Pilihan Status');
            $validationStatus->setError('Pilih active atau inactive.');
            $validationStatus->setPromptTitle('Status Siswa');
            $validationStatus->setPrompt('Pilih active atau inactive');
            $validationStatus->setFormula1('"active,inactive"');
        }

        // Auto-fit column widths
        foreach (range('A', 'N') as $col) {
            $sheet1->getColumnDimension($col)->setAutoSize(true);
        }

        // ----------------------------------------------------
        // SHEET 2: Petunjuk
        // ----------------------------------------------------
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Petunjuk');

        // Title
        $sheet2->setCellValue('A1', 'PANDUAN RESMI IMPORT DATA SISWA (FORMAT .XLSX)');
        $sheet2->getStyle('A1')->getFont()->setBold(true)->setSize(14)->setColor(new Color('1E293B'));
        $sheet2->getRowDimension(1)->setRowHeight(30);

        $instructions = [
            ['No', 'Aturan & Ketentuan Pengisian', 'Penjelasan / Format'],
            ['1', 'Jangan Mengubah Header', 'Nama dan susunan kolom di baris 1 Sheet "Data Siswa" tidak boleh diubah, dihapus, atau dipindah.'],
            ['2', 'Satu Baris Satu Siswa', 'Setiap baris data mewakili 1 akun siswa.'],
            ['3', 'Format File Wajib .XLSX', 'File harus berekstensi .xlsx (Microsoft Excel Open XML Spreadsheet). Sistem menolak format .csv/.xls.'],
            ['4', 'NIS Harus Unik & Wajib', 'Nomor Induk Siswa (NIS) wajib diisi dan tidak boleh sama dengan siswa yang sudah terdaftar.'],
            ['5', 'Tahun Ajaran Harus Valid', "Gunakan tahun ajaran yang aktif di sistem, contoh: {$activeYear}."],
            ['6', 'Kelas Harus Terdaftar di Sistem', "Tuliskan nama kelas yang sudah dibuat di sistem sekolah, contoh: {$firstClass}."],
            ['7', 'Format Tanggal Lahir', 'Gunakan format internasional baku: YYYY-MM-DD (Contoh: 2012-05-10).'],
            ['8', 'Jenis Kelamin', 'Isi dengan huruf kapital: "L" (Laki-laki) atau "P" (Perempuan).'],
            ['9', 'Status Siswa', 'Pilih antara "active" (aktif) atau "inactive" (tidak aktif).'],
            ['10', 'Username Akun', 'Opsional. Jika dikosongkan, sistem secara otomatis akan menggunakan NIS sebagai username login.'],
            ['11', 'Password Akun & Kredensial', 'Opsional. Jika dikosongkan, sistem akan mengenerate password sementara yang dapat diunduh via Credential Export.'],
            ['12', 'Keamanan Database', 'Jangan memasukkan ID database internal. Password siswa di database akan di-hash secara aman.'],
        ];

        $rIdx = 3;
        foreach ($instructions as $row) {
            $sheet2->setCellValue("A{$rIdx}", $row[0]);
            $sheet2->setCellValue("B{$rIdx}", $row[1]);
            $sheet2->setCellValue("C{$rIdx}", $row[2]);

            if ($rIdx === 3) {
                $sheet2->getStyle('A3:C3')->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4338CA']], // Indigo 700
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);
                $sheet2->getRowDimension(3)->setRowHeight(24);
            } else {
                $sheet2->getStyle("A{$rIdx}:C{$rIdx}")->applyFromArray([
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $sheet2->getStyle("A{$rIdx}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet2->getRowDimension($rIdx)->setRowHeight(22);
            }
            $rIdx++;
        }

        $sheet2->getColumnDimension('A')->setWidth(6);
        $sheet2->getColumnDimension('B')->setWidth(35);
        $sheet2->getColumnDimension('C')->setWidth(80);

        // Set active sheet back to Sheet 0 ("Data Siswa")
        $spreadsheet->setActiveSheetIndex(0);

        // Write to stream
        $writer = new Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $binary = ob_get_clean();

        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        return $binary;
    }
}
