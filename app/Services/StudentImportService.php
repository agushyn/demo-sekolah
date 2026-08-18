<?php

namespace App\Services;

use App\Models\ClassModel;
use App\Models\Student;
use App\Models\StudentClassAuditLog;
use App\Models\StudentClassEnrollment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use InvalidArgumentException;

class StudentImportService
{
    /**
     * Generate official CSV import template.
     */
    public function generateTemplate(): string
    {
        $headers = [
            'Nama Lengkap',
            'Email',
            'Password',
            'NISN',
            'NIS',
            'Jenis Kelamin (L/P)',
            'Tempat Lahir',
            'Tanggal Lahir (YYYY-MM-DD)',
            'Telepon',
            'Alamat',
            'Nama Kelas',
        ];

        $sampleRows = [
            [
                'Ahmad Fauzi Nurfadilah',
                'ahmad.fauzi@schid.test',
                'password123',
                '0051234581',
                '20261011',
                'L',
                'Jakarta',
                '2009-04-12',
                '081234567891',
                'Jl. Melati No. 5, Jakarta Selatan',
                'X MIPA 1',
            ],
            [
                'Siti Aisyah Rahmawati',
                'siti.aisyah@schid.test',
                'password123',
                '0051234582',
                '20261012',
                'P',
                'Bandung',
                '2009-08-25',
                '081234567892',
                'Jl. Anggrek No. 18, Jakarta Selatan',
                'X MIPA 1',
            ],
        ];

        $output = fopen('php://temp', 'r+');
        fputcsv($output, $headers);
        foreach ($sampleRows as $row) {
            fputcsv($output, $row);
        }
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Parse and validate CSV content row by row.
     */
    public function parseAndValidate(UploadedFile|string $file): array
    {
        $content = $file instanceof UploadedFile ? file_get_contents($file->getRealPath()) : $file;

        $lines = preg_split('/\r\n|\r|\n/', trim($content));
        if (empty($lines)) {
            throw new InvalidArgumentException('File import kosong atau tidak memiliki data.');
        }

        // Parse header
        $headerLine = array_shift($lines);
        $headers = str_getcsv($headerLine);

        $parsedRows = [];
        $validCount = 0;
        $invalidCount = 0;

        $classes = ClassModel::all()->keyBy(fn ($c) => strtolower(trim($c->name)));
        $existingEmails = User::pluck('email')->map(fn ($e) => strtolower(trim($e)))->flip();
        $existingNisns = Student::whereNotNull('nisn')->pluck('nisn')->map(fn ($n) => trim($n))->flip();
        $existingNiss = Student::whereNotNull('nis')->pluck('nis')->map(fn ($n) => trim($n))->flip();

        $sessionEmails = [];
        $sessionNisns = [];

        foreach ($lines as $index => $line) {
            if (empty(trim($line))) {
                continue;
            }

            $row = str_getcsv($line);
            $rowNum = $index + 2; // Line 1 is header

            $name = trim($row[0] ?? '');
            $email = strtolower(trim($row[1] ?? ''));
            $password = trim($row[2] ?? '') ?: 'password';
            $nisn = trim($row[3] ?? '');
            $nis = trim($row[4] ?? '');
            $genderRaw = strtoupper(trim($row[5] ?? 'L'));
            $birthPlace = trim($row[6] ?? '');
            $birthDate = trim($row[7] ?? '');
            $phone = trim($row[8] ?? '');
            $address = trim($row[9] ?? '');
            $className = trim($row[10] ?? '');

            $issues = [];

            // 1. Name validation
            if (empty($name)) {
                $issues[] = 'Nama lengkap wajib diisi.';
            }

            // 2. Email validation
            if (empty($email) || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $issues[] = 'Format email tidak valid.';
            } elseif (isset($existingEmails[$email]) || isset($sessionEmails[$email])) {
                $issues[] = "Email '{$email}' sudah terdaftar di sistem.";
            }

            // 3. NISN validation
            if (! empty($nisn)) {
                if (isset($existingNisns[$nisn]) || isset($sessionNisns[$nisn])) {
                    $issues[] = "NISN '{$nisn}' sudah digunakan siswa lain.";
                }
            }

            // 4. NIS validation
            if (! empty($nis) && isset($existingNiss[$nis])) {
                $issues[] = "NIS '{$nis}' sudah digunakan.";
            }

            // 5. Gender validation
            $gender = in_array($genderRaw, ['L', 'LAKI-LAKI', 'PRIA', 'M']) ? 'L' : (in_array($genderRaw, ['P', 'PEREMPUAN', 'WANITA', 'F']) ? 'P' : 'L');

            // 6. Birth date validation
            $formattedBirthDate = null;
            if (! empty($birthDate)) {
                try {
                    $formattedBirthDate = Carbon::parse($birthDate)->toDateString();
                } catch (\Throwable $e) {
                    $issues[] = 'Format tanggal lahir tidak valid (gunakan YYYY-MM-DD).';
                }
            }

            // 7. Class validation
            $matchedClass = null;
            if (! empty($className)) {
                $matchedClass = $classes->get(strtolower($className));
                if (! $matchedClass) {
                    $issues[] = "Kelas '{$className}' tidak ditemukan di database.";
                }
            } else {
                $matchedClass = ClassModel::first();
            }

            $isValid = empty($issues);
            if ($isValid) {
                $validCount++;
                $sessionEmails[$email] = true;
                if (! empty($nisn)) {
                    $sessionNisns[$nisn] = true;
                }
            } else {
                $invalidCount++;
            }

            $parsedRows[] = [
                'row_number' => $rowNum,
                'name' => $name,
                'email' => $email,
                'password' => $password,
                'nisn' => $nisn,
                'nis' => $nis,
                'gender' => $gender,
                'birth_place' => $birthPlace,
                'birth_date' => $formattedBirthDate,
                'phone' => $phone,
                'address' => $address,
                'class_id' => $matchedClass?->id,
                'class_name' => $matchedClass?->name ?? $className,
                'status' => $isValid ? 'valid' : 'error',
                'issues' => $issues,
            ];
        }

        return [
            'total_rows' => count($parsedRows),
            'valid_count' => $validCount,
            'invalid_count' => $invalidCount,
            'rows' => $parsedRows,
        ];
    }

    /**
     * Execute atomic batch import of valid rows.
     */
    public function executeImport(array $rows, ?int $performedBy = null): array
    {
        if (empty($rows)) {
            throw new InvalidArgumentException('Tidak ada data siswa untuk diimport.');
        }

        return DB::transaction(function () use ($rows, $performedBy) {
            $importedCount = 0;
            $skippedCount = 0;
            $errors = [];

            foreach ($rows as $row) {
                if (($row['status'] ?? 'valid') !== 'valid') {
                    $skippedCount++;

                    continue;
                }

                try {
                    // 1. Create User
                    $user = User::create([
                        'name' => $row['name'],
                        'email' => $row['email'],
                        'password' => Hash::make($row['password'] ?? 'password'),
                        'email_verified_at' => now(),
                    ]);
                    $user->assignRole('student');

                    // 2. Resolve Class
                    $classId = $row['class_id'] ?? ClassModel::first()?->id;
                    $class = ClassModel::find($classId);

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
                            'academic_year_id' => $class->academic_year_id ?? 1,
                            'status' => 'active',
                            'start_date' => now()->toDateString(),
                            'notes' => 'Import massal data akun siswa dari Excel/CSV.',
                            'created_by' => $performedBy,
                        ]);

                        $student->classes()->sync([$class->id]);
                    }

                    // 5. Audit Log
                    StudentClassAuditLog::create([
                        'student_id' => $student->id,
                        'to_class_id' => $class?->id,
                        'to_academic_year_id' => $class?->academic_year_id,
                        'action' => 'imported',
                        'performed_by' => $performedBy,
                        'notes' => "Import akun siswa baru ke {$class?->name}.",
                    ]);

                    $importedCount++;
                } catch (\Throwable $e) {
                    $skippedCount++;
                    $errors[] = "Baris {$row['name']}: {$e->getMessage()}";
                }
            }

            return [
                'imported_count' => $importedCount,
                'skipped_count' => $skippedCount,
                'errors' => $errors,
            ];
        });
    }
}
