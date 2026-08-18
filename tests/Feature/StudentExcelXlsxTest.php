<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ClassModel;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx as XlsxReader;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx as XlsxWriter;
use Tests\TestCase;

class StudentExcelXlsxTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $studentUser;

    protected ClassModel $class10;

    protected AcademicYear $year;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);

        $this->admin = User::create([
            'name' => 'Admin Excel',
            'email' => 'admin.excel@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->admin->assignRole('admin');

        $this->studentUser = User::create([
            'name' => 'Siswa Test',
            'email' => 'siswa.test@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->studentUser->assignRole('student');

        $this->year = AcademicYear::create([
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'start_date' => '2026-07-15',
            'end_date' => '2026-12-20',
            'is_active' => true,
        ]);

        $this->class10 = ClassModel::create([
            'academic_year_id' => $this->year->id,
            'name' => 'X MIPA 1',
            'grade_level' => '10',
        ]);
    }

    /**
     * Helper to create a genuine XLSX test file.
     */
    protected function createTestXlsx(array $rows, string $sheetName = 'Data Siswa'): UploadedFile
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle($sheetName);

        $headers = [
            'nis', 'nisn', 'nama_lengkap', 'jenis_kelamin', 'tempat_lahir',
            'tanggal_lahir', 'email', 'no_hp', 'alamat', 'tahun_ajaran',
            'kelas', 'username', 'password', 'status',
        ];

        $colLetters = range('A', 'N');
        foreach ($headers as $idx => $h) {
            $sheet->setCellValue("{$colLetters[$idx]}1", $h);
        }

        $r = 2;
        foreach ($rows as $row) {
            foreach ($row as $idx => $val) {
                $sheet->setCellValueExplicit("{$colLetters[$idx]}{$r}", (string) $val, DataType::TYPE_STRING);
            }
            $r++;
        }

        $tempFile = tempnam(sys_get_temp_dir(), 'test_xlsx_').'.xlsx';
        $writer = new XlsxWriter($spreadsheet);
        $writer->save($tempFile);

        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        return new UploadedFile(
            $tempFile,
            'test_siswa.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );
    }

    public function test_admin_can_download_xlsx_template_with_two_sheets(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/students/template');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $tempFile = tempnam(sys_get_temp_dir(), 'template_').'.xlsx';
        file_put_contents($tempFile, $response->streamedContent());

        $reader = new XlsxReader;
        $spreadsheet = $reader->load($tempFile);

        $sheetNames = $spreadsheet->getSheetNames();
        $this->assertContains('Data Siswa', $sheetNames);
        $this->assertContains('Petunjuk', $sheetNames);

        $sheet1 = $spreadsheet->getSheetByName('Data Siswa');
        $this->assertEquals('nis', strtolower($sheet1->getCell('A1')->getValue()));
        $this->assertEquals('status', strtolower($sheet1->getCell('N1')->getValue()));

        $spreadsheet->disconnectWorksheets();
        @unlink($tempFile);
    }

    public function test_system_rejects_non_xlsx_upload(): void
    {
        $csvFile = UploadedFile::fake()->createWithContent('test.csv', "nis,nama_lengkap\n123,Budi");

        $response = $this->actingAs($this->admin)->postJson('/admin/students/import/preview', [
            'file' => $csvFile,
        ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_preview_valid_xlsx_import(): void
    {
        $rows = [
            [
                '20261050',
                '0051234700',
                'Ahmad Fauzan',
                'L',
                'Jakarta',
                '2009-06-15',
                'ahmad.fauzan@schid.test',
                '081234567801',
                'Jl. Melati No. 1',
                '2026/2027',
                'X MIPA 1',
                '20261050',
                'password123',
                'active',
            ],
        ];

        $xlsxFile = $this->createTestXlsx($rows);

        $response = $this->actingAs($this->admin)->postJson('/admin/students/import/preview', [
            'file' => $xlsxFile,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'total_rows' => 1,
            'valid_count' => 1,
            'error_count' => 0,
        ]);
    }

    public function test_admin_can_preview_invalid_xlsx_import_and_download_error_report(): void
    {
        // Pre-create user to trigger duplicate email
        User::create([
            'name' => 'Existing',
            'email' => 'duplicate.xlsx@schid.test',
            'password' => Hash::make('password'),
        ]);

        $rows = [
            [
                '', // Missing NIS
                '',
                'Siti Invalid',
                'X', // Invalid Gender
                'Bandung',
                '2009-08-20',
                'duplicate.xlsx@schid.test',
                '081234567802',
                'Jl. Mawar',
                '2026/2027',
                'Kelas Gaib', // Invalid Class
                '',
                '',
                'active',
            ],
        ];

        $xlsxFile = $this->createTestXlsx($rows);

        $previewResponse = $this->actingAs($this->admin)->postJson('/admin/students/import/preview', [
            'file' => $xlsxFile,
        ]);

        $previewResponse->assertStatus(200);
        $previewData = $previewResponse->json();
        $this->assertEquals(1, $previewData['error_count']);

        // Download error report
        $errorReportResponse = $this->actingAs($this->admin)->post('/admin/students/import/error-report', [
            'error_rows' => $previewData['rows'],
            'summary' => [
                'total_rows' => 1,
                'valid_count' => 0,
                'warning_count' => 0,
                'error_count' => 1,
            ],
        ]);

        $errorReportResponse->assertStatus(200);
        $errorReportResponse->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_admin_can_execute_batch_student_import_and_download_credentials(): void
    {
        $rows = [
            [
                'row_number' => 2,
                'nis' => '20261060',
                'nisn' => '0051234710',
                'name' => 'Rian Kurniawan',
                'gender' => 'L',
                'birth_place' => 'Surabaya',
                'birth_date' => '2009-04-12',
                'email' => 'rian.kurniawan@schid.test',
                'phone' => '081234567803',
                'address' => 'Jl. Pahlawan',
                'academic_year_id' => $this->year->id,
                'academic_year_name' => '2026/2027',
                'class_id' => $this->class10->id,
                'class_name' => 'X MIPA 1',
                'username' => '20261060',
                'password' => 'Siswa2026!secret',
                'is_auto_password' => false,
                'status' => 'active',
                'row_status' => 'valid',
            ],
        ];

        $response = $this->actingAs($this->admin)->postJson('/admin/students/import', [
            'rows' => $rows,
        ]);

        $response->assertStatus(200);
        $result = $response->json();
        $this->assertEquals(1, $result['imported_count']);
        $this->assertCount(1, $result['credentials']);

        $this->assertDatabaseHas('users', ['email' => 'rian.kurniawan@schid.test']);
        $this->assertDatabaseHas('students', ['nis' => '20261060']);
        $this->assertDatabaseHas('student_class_enrollments', ['class_id' => $this->class10->id, 'status' => 'active']);

        // Download Credential XLSX
        $credResponse = $this->actingAs($this->admin)->post('/admin/students/import/credentials', [
            'credentials' => $result['credentials'],
        ]);

        $credResponse->assertStatus(200);
        $credResponse->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_admin_can_export_student_records_as_xlsx(): void
    {
        Student::create([
            'user_id' => $this->studentUser->id,
            'nisn' => '0051234800',
            'nis' => '20261080',
            'gender' => 'L',
            'grade_level' => 'X MIPA 1',
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/students/export');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_admin_can_export_attendances_as_multi_sheet_xlsx(): void
    {
        $student = Student::create([
            'user_id' => $this->studentUser->id,
            'nisn' => '0051234801',
            'nis' => '20261081',
            'gender' => 'L',
            'grade_level' => 'X MIPA 1',
        ]);

        StudentAttendance::create([
            'student_id' => $student->id,
            'class_id' => $this->class10->id,
            'date' => now()->toDateString(),
            'status' => 'present',
            'check_in' => '07:15',
            'check_out' => '15:30',
            'source' => 'manual',
            'recorded_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->get("/admin/attendances/export?class_id={$this->class10->id}");

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $tempFile = tempnam(sys_get_temp_dir(), 'attendance_export_').'.xlsx';
        file_put_contents($tempFile, $response->streamedContent());

        $reader = new XlsxReader;
        $spreadsheet = $reader->load($tempFile);

        $sheetNames = $spreadsheet->getSheetNames();
        $this->assertContains('Presensi', $sheetNames);
        $this->assertContains('Summary', $sheetNames);

        $spreadsheet->disconnectWorksheets();
        @unlink($tempFile);
    }
}
