<?php

namespace App\Services\Excel;

use App\Models\AcademicYear;
use App\Models\ClassModel;
use App\Models\Student;
use App\Models\StudentClassAuditLog;
use App\Models\StudentClassEnrollment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use InvalidArgumentException;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx as XlsxReader;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx as XlsxWriter;

class StudentExcelImportService
{
    /**
     * Validate strict XLSX file format.
     */
    public function validateFile(UploadedFile $file): void
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $mime = $file->getMimeType();

        $validMimes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip',
            'application/octet-stream',
            'application/x-zip',
        ];

        if ($extension !== 'xlsx' || ! in_array($mime, $validMimes)) {
            throw new InvalidArgumentException('Format file tidak didukung. Silakan gunakan file Excel .xlsx.');
        }
    }

    /**
     * Parse and preview XLSX student import rows with detailed validation.
     */
    public function preview(UploadedFile $file): array
    {
        $this->validateFile($file);

        try {
            $reader = new XlsxReader;
            $reader->setReadDataOnly(true);
            $spreadsheet = $reader->load($file->getRealPath());
        } catch (\Throwable $e) {
            throw new InvalidArgumentException('File Excel tidak dapat dibaca atau rusak. Silakan gunakan template resmi.');
        }

        // Try to get "Data Siswa" sheet or first sheet
        $sheet = $spreadsheet->getSheetByName('Data Siswa') ?? $spreadsheet->getActiveSheet();
        $sheetData = $sheet->toArray(null, true, true, true);

        if (count($sheetData) < 2) {
            throw new InvalidArgumentException('Sheet Data Siswa tidak memiliki baris data.');
        }

        // Validate Header (Row 1)
        $headerRow = array_shift($sheetData);
        $normalizedHeaders = array_map(fn ($h) => strtolower(trim((string) $h)), array_values($headerRow));

        $expectedHeaders = [
            'nis', 'nisn', 'nama_lengkap', 'jenis_kelamin', 'tempat_lahir',
            'tanggal_lahir', 'email', 'no_hp', 'alamat', 'tahun_ajaran',
            'kelas', 'username', 'password', 'status',
        ];

        // Ensure key required headers exist
        $requiredHeaders = ['nis', 'nama_lengkap', 'jenis_kelamin', 'tahun_ajaran', 'kelas', 'status'];
        foreach ($requiredHeaders as $req) {
            if (! in_array($req, $normalizedHeaders)) {
                throw new InvalidArgumentException("Kolom header '{$req}' tidak ditemukan. Silakan gunakan template resmi.");
            }
        }

        // Map column indices
        $headerMap = [];
        $colLetters = array_keys($headerRow);
        foreach ($colLetters as $idx => $letter) {
            $headerName = strtolower(trim((string) $headerRow[$letter]));
            if ($headerName) {
                $headerMap[$headerName] = $letter;
            }
        }

        // Fetch lookup dictionaries
        $classes = ClassModel::with('academicYear')->get()->keyBy(fn ($c) => strtolower(trim($c->name)));
        $academicYears = AcademicYear::all()->keyBy(fn ($y) => strtolower(trim($y->name)));
        $existingNiss = Student::whereNotNull('nis')->pluck('nis')->map(fn ($n) => trim($n))->flip();
        $existingNisns = Student::whereNotNull('nisn')->pluck('nisn')->map(fn ($n) => trim($n))->flip();
        $existingEmails = User::pluck('email')->map(fn ($e) => strtolower(trim($e)))->flip();
        $existingUsernames = User::pluck('name')->map(fn ($n) => strtolower(trim($n)))->flip();

        $sessionNiss = [];
        $sessionNisns = [];
        $sessionEmails = [];

        $parsedRows = [];
        $validCount = 0;
        $warningCount = 0;
        $errorCount = 0;

        foreach ($sheetData as $rowNum => $row) {
            // Check if entire row is empty
            $rowValues = array_filter(array_map('trim', $row));
            if (empty($rowValues)) {
                continue;
            }

            $nis = trim((string) ($row[$headerMap['nis'] ?? 'A'] ?? ''));
            $nisn = trim((string) ($row[$headerMap['nisn'] ?? 'B'] ?? ''));
            $nama = trim((string) ($row[$headerMap['nama_lengkap'] ?? 'C'] ?? ''));
            $genderRaw = strtoupper(trim((string) ($row[$headerMap['jenis_kelamin'] ?? 'D'] ?? '')));
            $tempatLahir = trim((string) ($row[$headerMap['tempat_lahir'] ?? 'E'] ?? ''));
            $tanggalLahir = trim((string) ($row[$headerMap['tanggal_lahir'] ?? 'F'] ?? ''));
            $email = strtolower(trim((string) ($row[$headerMap['email'] ?? 'G'] ?? '')));
            $noHp = trim((string) ($row[$headerMap['no_hp'] ?? 'H'] ?? ''));
            $alamat = trim((string) ($row[$headerMap['alamat'] ?? 'I'] ?? ''));
            $tahunAjaranName = trim((string) ($row[$headerMap['tahun_ajaran'] ?? 'J'] ?? ''));
            $kelasName = trim((string) ($row[$headerMap['kelas'] ?? 'K'] ?? ''));
            $username = trim((string) ($row[$headerMap['username'] ?? 'L'] ?? ''));
            $password = trim((string) ($row[$headerMap['password'] ?? 'M'] ?? ''));
            $statusRaw = strtolower(trim((string) ($row[$headerMap['status'] ?? 'N'] ?? 'active')));

            $issues = [];
            $warnings = [];

            // 1. NIS Validation (Wajib & Unik)
            if (empty($nis)) {
                $issues[] = 'NIS wajib diisi.';
            } elseif (isset($existingNiss[$nis])) {
                $issues[] = "NIS '{$nis}' sudah terdaftar di database.";
            } elseif (isset($sessionNiss[$nis])) {
                $issues[] = "NIS '{$nis}' duplikat dalam file Excel ini.";
            }

            // 2. Nama Lengkap (Wajib)
            if (empty($nama)) {
                $issues[] = 'Nama lengkap wajib diisi.';
            }

            // 3. NISN Validation (Opsional, jika ada harus unik)
            if (! empty($nisn)) {
                if (isset($existingNisns[$nisn])) {
                    $issues[] = "NISN '{$nisn}' sudah terdaftar di database.";
                } elseif (isset($sessionNisns[$nisn])) {
                    $issues[] = "NISN '{$nisn}' duplikat dalam file Excel ini.";
                }
            }

            // 4. Jenis Kelamin (Wajib L/P)
            $gender = in_array($genderRaw, ['L', 'LAKI-LAKI', 'PRIA', 'M']) ? 'L' : (in_array($genderRaw, ['P', 'PEREMPUAN', 'WANITA', 'F']) ? 'P' : '');
            if (empty($gender)) {
                $issues[] = "Jenis kelamin harus 'L' atau 'P'.";
            }

            // 5. Tanggal Lahir (Opsional)
            $formattedBirthDate = null;
            if (! empty($tanggalLahir)) {
                try {
                    $formattedBirthDate = Carbon::parse($tanggalLahir)->toDateString();
                } catch (\Throwable $e) {
                    $issues[] = "Format tanggal lahir tidak valid: '{$tanggalLahir}' (Gunakan YYYY-MM-DD).";
                }
            }

            // 6. Username (Opsional -> default NIS)
            $finalUsername = ! empty($username) ? $username : $nis;

            // 7. Email (Opsional -> default {username}@siswa.schid.test)
            $finalEmail = $email;
            if (empty($finalEmail)) {
                $finalEmail = (! empty($nis) ? $nis : Str::slug($nama)).'@siswa.schid.test';
                $warnings[] = "Email otomatis dibuat: {$finalEmail}";
            } elseif (! filter_var($finalEmail, FILTER_VALIDATE_EMAIL)) {
                $issues[] = "Format email '{$finalEmail}' tidak valid.";
            } elseif (isset($existingEmails[$finalEmail]) || isset($sessionEmails[$finalEmail])) {
                $issues[] = "Email '{$finalEmail}' sudah digunakan akun lain.";
            }

            // 8. Tahun Ajaran (Wajib & Valid)
            $matchedYear = null;
            if (empty($tahunAjaranName)) {
                $matchedYear = AcademicYear::where('is_active', true)->first() ?? AcademicYear::first();
                $warnings[] = "Tahun ajaran otomatis menggunakan '{$matchedYear?->name}'.";
            } else {
                $matchedYear = $academicYears->get(strtolower($tahunAjaranName));
                if (! $matchedYear) {
                    $issues[] = "Tahun ajaran '{$tahunAjaranName}' tidak ditemukan di sistem.";
                }
            }

            // 9. Kelas / Rombel (Wajib & Valid)
            $matchedClass = null;
            if (empty($kelasName)) {
                $issues[] = 'Nama kelas wajib diisi.';
            } else {
                $matchedClass = $classes->get(strtolower($kelasName));
                if (! $matchedClass) {
                    $issues[] = "Kelas '{$kelasName}' tidak ditemukan di database.";
                }
            }

            // 10. Status (Wajib: active / inactive)
            $status = in_array($statusRaw, ['active', 'inactive', 'aktif', 'nonaktif']) ? ($statusRaw === 'nonaktif' ? 'inactive' : ($statusRaw === 'aktif' ? 'active' : $statusRaw)) : 'active';

            // 11. Password sementara
            $finalPassword = ! empty($password) ? $password : 'Siswa'.($nis ? $nis : '2026!').rand(100, 999);
            if (empty($password)) {
                $warnings[] = 'Password otomatis dibuat oleh sistem.';
            }

            // Classify Row Status
            $hasError = ! empty($issues);
            $hasWarning = ! empty($warnings) && ! $hasError;

            $rowStatus = $hasError ? 'error' : ($hasWarning ? 'warning' : 'valid');

            if ($hasError) {
                $errorCount++;
            } elseif ($hasWarning) {
                $warningCount++;
                $validCount++; // Warnings are still importable
                if ($nis) {
                    $sessionNiss[$nis] = true;
                }
                if ($nisn) {
                    $sessionNisns[$nisn] = true;
                }
                if ($finalEmail) {
                    $sessionEmails[$finalEmail] = true;
                }
            } else {
                $validCount++;
                if ($nis) {
                    $sessionNiss[$nis] = true;
                }
                if ($nisn) {
                    $sessionNisns[$nisn] = true;
                }
                if ($finalEmail) {
                    $sessionEmails[$finalEmail] = true;
                }
            }

            $parsedRows[] = [
                'row_number' => $rowNum,
                'nis' => $nis,
                'nisn' => $nisn,
                'name' => $nama,
                'gender' => $gender ?: 'L',
                'birth_place' => $tempatLahir,
                'birth_date' => $formattedBirthDate,
                'email' => $finalEmail,
                'phone' => $noHp,
                'address' => $alamat,
                'academic_year_id' => $matchedYear?->id,
                'academic_year_name' => $matchedYear?->name ?? $tahunAjaranName,
                'class_id' => $matchedClass?->id,
                'class_name' => $matchedClass?->name ?? $kelasName,
                'username' => $finalUsername,
                'password' => $finalPassword,
                'is_auto_password' => empty($password),
                'status' => $status,
                'row_status' => $rowStatus,
                'issues' => $issues,
                'warnings' => $warnings,
            ];
        }

        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        return [
            'filename' => $file->getClientOriginalName(),
            'total_rows' => count($parsedRows),
            'valid_count' => $validCount,
            'warning_count' => $warningCount,
            'error_count' => $errorCount,
            'rows' => $parsedRows,
        ];
    }

    /**
     * Generate XLSX Error Report with Sheet "Error" and Sheet "Summary".
     */
    public function generateErrorReport(array $errorRows, array $summaryStats = []): string
    {
        $spreadsheet = new Spreadsheet;

        // ----------------------------------------------------
        // Sheet 1: Error
        // ----------------------------------------------------
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Error');

        $headers = ['Row', 'NIS', 'Nama', 'Kelas', 'Error'];
        $cols = ['A', 'B', 'C', 'D', 'E'];

        foreach ($headers as $idx => $h) {
            $sheet1->setCellValue("{$cols[$idx]}1", $h);
        }

        $sheet1->getStyle('A1:E1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'BE123C']], // Rose 700
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet1->getRowDimension(1)->setRowHeight(26);

        $r = 2;
        foreach ($errorRows as $row) {
            $sheet1->setCellValue("A{$r}", $row['row_number'] ?? $r);
            $sheet1->setCellValueExplicit("B{$r}", $row['nis'] ?? '-', DataType::TYPE_STRING);
            $sheet1->setCellValue("C{$r}", $row['name'] ?? '-');
            $sheet1->setCellValue("D{$r}", $row['class_name'] ?? '-');
            $sheet1->setCellValue("E{$r}", implode('; ', $row['issues'] ?? ['Data tidak valid']));

            $sheet1->getStyle("A{$r}:E{$r}")->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FECDD3']]],
            ]);
            $r++;
        }

        foreach ($cols as $c) {
            $sheet1->getColumnDimension($c)->setAutoSize(true);
        }

        // ----------------------------------------------------
        // Sheet 2: Summary
        // ----------------------------------------------------
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Summary');

        $sheet2->setCellValue('A1', 'RINGKASAN HASIL VALIDASI IMPORT SISWA');
        $sheet2->getStyle('A1')->getFont()->setBold(true)->setSize(13);

        $summaryData = [
            ['Kategori', 'Jumlah Baris'],
            ['Total Baris Data', $summaryStats['total_rows'] ?? count($errorRows)],
            ['Baris Valid (Siap Diimport)', $summaryStats['valid_count'] ?? 0],
            ['Baris Warning', $summaryStats['warning_count'] ?? 0],
            ['Baris Error (Gagal)', $summaryStats['error_count'] ?? count($errorRows)],
        ];

        $sr = 3;
        foreach ($summaryData as $idx => $sRow) {
            $sheet2->setCellValue("A{$sr}", $sRow[0]);
            $sheet2->setCellValue("B{$sr}", $sRow[1]);

            if ($idx === 0) {
                $sheet2->getStyle("A{$sr}:B{$sr}")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E293B']],
                ]);
            } else {
                $sheet2->getStyle("A{$sr}:B{$sr}")->applyFromArray([
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'CBD5E1']]],
                ]);
            }
            $sr++;
        }

        $sheet2->getColumnDimension('A')->setWidth(30);
        $sheet2->getColumnDimension('B')->setWidth(20);

        $spreadsheet->setActiveSheetIndex(0);

        $writer = new XlsxWriter($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $binary = ob_get_clean();

        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        return $binary;
    }

    /**
     * Execute atomic batch import of valid rows and return temporary credentials.
     */
    public function executeImport(array $rows, ?int $performedBy = null): array
    {
        if (empty($rows)) {
            throw new InvalidArgumentException('Tidak ada data siswa yang valid untuk diimport.');
        }

        return DB::transaction(function () use ($rows, $performedBy) {
            $importedCount = 0;
            $skippedCount = 0;
            $credentials = [];
            $errors = [];

            foreach ($rows as $row) {
                if (($row['row_status'] ?? 'error') === 'error') {
                    $skippedCount++;

                    continue;
                }

                try {
                    // 1. Create User
                    $plainPassword = $row['password'] ?? 'Siswa'.($row['nis'] ?? '2026!').rand(100, 999);
                    $user = User::create([
                        'name' => $row['name'],
                        'email' => strtolower(trim($row['email'])),
                        'password' => Hash::make($plainPassword),
                        'email_verified_at' => now(),
                    ]);
                    $user->assignRole('student');

                    // 2. Resolve Class & Academic Year
                    $class = ClassModel::find($row['class_id'] ?? null);
                    $academicYearId = $row['academic_year_id'] ?? $class?->academic_year_id ?? 1;

                    // 3. Create Student Profile
                    $student = Student::create([
                        'user_id' => $user->id,
                        'nisn' => $row['nisn'] ?: null,
                        'nis' => $row['nis'] ?: null,
                        'gender' => $row['gender'] ?? 'L',
                        'birth_place' => $row['birth_place'] ?: null,
                        'birth_date' => $row['birth_date'] ?: null,
                        'address' => $row['address'] ?: null,
                        'phone' => $row['phone'] ?: null,
                        'grade_level' => $class?->name ?? '10',
                    ]);

                    // 4. Create Active Enrollment
                    if ($class) {
                        StudentClassEnrollment::create([
                            'student_id' => $student->id,
                            'class_id' => $class->id,
                            'academic_year_id' => $academicYearId,
                            'status' => $row['status'] === 'inactive' ? 'transferred' : 'active',
                            'start_date' => now()->toDateString(),
                            'notes' => 'Import massal data akun siswa dari file Excel XLSX.',
                            'created_by' => $performedBy,
                        ]);

                        $student->classes()->sync([$class->id]);
                    }

                    // 5. Audit Log
                    StudentClassAuditLog::create([
                        'student_id' => $student->id,
                        'to_class_id' => $class?->id,
                        'to_academic_year_id' => $academicYearId,
                        'action' => 'imported',
                        'performed_by' => $performedBy,
                        'notes' => "Import akun siswa baru ke {$class?->name} via XLSX Workbook.",
                    ]);

                    // 6. Record Credential for One-Time Export
                    $credentials[] = [
                        'nis' => $row['nis'] ?: '-',
                        'name' => $row['name'],
                        'username' => $row['username'] ?? $row['nis'],
                        'email' => $row['email'],
                        'temporary_password' => $plainPassword,
                        'class_name' => $class?->name ?? '-',
                    ];

                    $importedCount++;
                } catch (\Throwable $e) {
                    $skippedCount++;
                    $errors[] = "Baris {$row['name']}: {$e->getMessage()}";
                }
            }

            return [
                'imported_count' => $importedCount,
                'skipped_count' => $skippedCount,
                'credentials' => $credentials,
                'errors' => $errors,
            ];
        });
    }

    /**
     * Generate XLSX Credential Export with Sheet "Credentials".
     */
    public function generateCredentialExport(array $credentials): string
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Credentials');

        // Security Notice Header
        $sheet->setCellValue('A1', 'KREDENSIAL AKUN LOGIN SISWA (PASSWORD SEMENTARA)');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(13)->setColor(new Color('1E293B'));

        $sheet->setCellValue('A2', 'PERINGATAN: File ini berisi password sementara siswa. Simpan secara aman dan bagikan langsung kepada siswa terkait.');
        $sheet->getStyle('A2')->getFont()->setItalic(true)->setSize(10)->setColor(new Color('E11D48'));

        $headers = ['No', 'NIS', 'Nama Siswa', 'Kelas', 'Username / Email', 'Password Sementara'];
        $cols = ['A', 'B', 'C', 'D', 'E', 'F'];

        foreach ($headers as $idx => $h) {
            $sheet->setCellValue("{$cols[$idx]}4", $h);
        }

        $sheet->getStyle('A4:F4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4338CA']], // Indigo 700
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(4)->setRowHeight(26);

        $r = 5;
        foreach ($credentials as $idx => $cred) {
            $sheet->setCellValue("A{$r}", $idx + 1);
            $sheet->setCellValueExplicit("B{$r}", $cred['nis'] ?? '-', DataType::TYPE_STRING);
            $sheet->setCellValue("C{$r}", $cred['name'] ?? '-');
            $sheet->setCellValue("D{$r}", $cred['class_name'] ?? '-');
            $sheet->setCellValue("E{$r}", $cred['username'] ?? $cred['email'] ?? '-');
            $sheet->setCellValueExplicit("F{$r}", $cred['temporary_password'] ?? '-', DataType::TYPE_STRING);

            $sheet->getStyle("A{$r}:F{$r}")->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $sheet->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("F{$r}")->getFont()->setBold(true);
            $sheet->getRowDimension($r)->setRowHeight(22);
            $r++;
        }

        foreach ($cols as $c) {
            $sheet->getColumnDimension($c)->setAutoSize(true);
        }

        $writer = new XlsxWriter($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $binary = ob_get_clean();

        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        return $binary;
    }
}
