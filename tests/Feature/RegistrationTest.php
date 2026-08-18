<?php

namespace Tests\Feature;

use App\Models\Registration;
use App\Models\RegistrationDocument;
use App\Models\SchoolSetting;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $studentUser;

    protected User $teacherUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);

        $this->adminUser = User::create([
            'name' => 'Admin PPDB',
            'email' => 'admin.ppdb@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->adminUser->assignRole('admin');

        $this->studentUser = User::create([
            'name' => 'Siswa Pelajar',
            'email' => 'student.ppdb@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->studentUser->assignRole('student');

        $this->teacherUser = User::create([
            'name' => 'Guru Pengampu',
            'email' => 'teacher.ppdb@schid.test',
            'password' => Hash::make('password'),
        ]);
        $this->teacherUser->assignRole('teacher');

        // Set default setting
        SchoolSetting::set('registration_enabled', true, 'boolean');
        SchoolSetting::set('registration_start', '2026-08-01', 'string');
        SchoolSetting::set('registration_end', '2026-09-30', 'string');
    }

    /**
     * 1. Registration OFF displays closed page and blocks submission.
     */
    public function test_registration_off_displays_closed_page_and_blocks_submission(): void
    {
        SchoolSetting::set('registration_enabled', false, 'boolean');

        $response = $this->get('/pendaftaran');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Registration/Closed')
        );

        $postResponse = $this->post('/pendaftaran', [
            'full_name' => 'Calon Siswa Ditolak',
            'nik' => '3171012304090099',
            'agreement' => true,
        ]);

        $postResponse->assertStatus(403);
    }

    /**
     * 2. Registration ON displays active form.
     */
    public function test_registration_on_displays_active_form(): void
    {
        SchoolSetting::set('registration_enabled', true, 'boolean');

        $response = $this->get('/pendaftaran');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Registration/Index')
        );
    }

    /**
     * 3. Submit valid registration creates record and unique registration number.
     */
    public function test_submit_valid_registration_creates_record_and_unique_reg_number(): void
    {
        Storage::fake('local');

        $kk = UploadedFile::fake()->create('kartu_keluarga.pdf', 300, 'application/pdf');
        $akta = UploadedFile::fake()->create('akta_kelahiran.pdf', 250, 'application/pdf');
        $foto = UploadedFile::fake()->image('pas_foto.jpg', 300, 400);

        $response = $this->post('/pendaftaran', [
            'full_name' => 'Bintang Ramadhan',
            'nik' => '3171012304090011',
            'nisn' => '0091234567',
            'birth_place' => 'Jakarta',
            'birth_date' => '2009-05-14',
            'gender' => 'L',
            'address' => 'Jl. Tebet Raya No. 10',
            'phone' => '081299887766',
            'email' => 'bintang.ramadhan@gmail.com',
            'father_name' => 'Ramadhan Senior',
            'mother_name' => 'Siti Nurhaliza',
            'parent_phone' => '081399887766',
            'doc_kk' => $kk,
            'doc_birth_certificate' => $akta,
            'doc_photo' => $foto,
            'agreement' => '1',
        ]);

        $this->assertDatabaseHas('registrations', [
            'full_name' => 'Bintang Ramadhan',
            'nik' => '3171012304090011',
            'status' => 'pending',
        ]);

        $reg = Registration::where('nik', '3171012304090011')->first();
        $this->assertNotNull($reg);
        $this->assertStringStartsWith('REG-2026-', $reg->registration_number);

        $this->assertEquals(3, $reg->documents()->count());

        $response->assertRedirect("/pendaftaran/sukses/{$reg->registration_number}");
    }

    /**
     * 4. Invalid validation returns field errors.
     */
    public function test_invalid_validation_returns_field_errors(): void
    {
        $response = $this->post('/pendaftaran', [
            'full_name' => '',
            'nik' => '123', // Invalid digits
            'gender' => 'INVALID',
            'email' => 'not-an-email',
            'agreement' => false,
        ]);

        $response->assertSessionHasErrors(['full_name', 'nik', 'gender', 'email', 'agreement', 'doc_kk', 'doc_birth_certificate', 'doc_photo']);
    }

    /**
     * 5. Upload invalid file type is rejected.
     */
    public function test_upload_invalid_file_rejected(): void
    {
        Storage::fake('local');

        $invalidFile = UploadedFile::fake()->create('script.sh', 100, 'application/x-sh');

        $response = $this->post('/pendaftaran', [
            'full_name' => 'Testing Berkas Salah',
            'nik' => '3171012304090055',
            'doc_kk' => $invalidFile,
        ]);

        $response->assertSessionHasErrors(['doc_kk']);
    }

    /**
     * 6. Duplicate NIK is rejected.
     */
    public function test_duplicate_nik_rejected(): void
    {
        Registration::create([
            'registration_number' => 'REG-2026-000001',
            'full_name' => 'Pendaftar Pertama',
            'nik' => '3171012304090088',
            'birth_place' => 'Jakarta',
            'birth_date' => '2009-01-01',
            'gender' => 'L',
            'address' => 'Alamat',
            'phone' => '081234567890',
            'email' => 'pendaftar1@test.com',
            'father_name' => 'Ayah',
            'mother_name' => 'Ibu',
            'parent_phone' => '081234567891',
            'status' => 'pending',
        ]);

        $response = $this->post('/pendaftaran', [
            'full_name' => 'Pendaftar Duplikat',
            'nik' => '3171012304090088', // Duplicate NIK
            'birth_place' => 'Bandung',
            'birth_date' => '2009-02-02',
            'gender' => 'P',
            'address' => 'Alamat 2',
            'phone' => '081234567892',
            'email' => 'pendaftar2@test.com',
            'father_name' => 'Ayah 2',
            'mother_name' => 'Ibu 2',
            'parent_phone' => '081234567893',
            'agreement' => '1',
        ]);

        $response->assertSessionHasErrors(['nik']);
    }

    /**
     * 7. Duplicate registration number is prevented by sequential generator.
     */
    public function test_duplicate_registration_number_prevented(): void
    {
        $num1 = Registration::generateRegistrationNumber();
        Registration::create([
            'registration_number' => $num1,
            'full_name' => 'Pendaftar 1',
            'nik' => '3171012304091111',
            'birth_place' => 'Jakarta',
            'birth_date' => '2009-01-01',
            'gender' => 'L',
            'address' => 'Alamat',
            'phone' => '081234567890',
            'email' => 'p1@test.com',
            'father_name' => 'Ayah',
            'mother_name' => 'Ibu',
            'parent_phone' => '081234567891',
        ]);

        $num2 = Registration::generateRegistrationNumber();

        $this->assertNotEquals($num1, $num2);
        $this->assertEquals('REG-2026-000001', $num1);
        $this->assertEquals('REG-2026-000002', $num2);
    }

    /**
     * 8. Admin accept registration with notes.
     */
    public function test_admin_can_accept_registration_with_notes(): void
    {
        $reg = Registration::create([
            'registration_number' => 'REG-2026-000010',
            'full_name' => 'Calon Siswa Diterima',
            'nik' => '3171012304092222',
            'birth_place' => 'Jakarta',
            'birth_date' => '2009-01-01',
            'gender' => 'L',
            'address' => 'Alamat',
            'phone' => '081234567890',
            'email' => 'diterima@test.com',
            'father_name' => 'Ayah',
            'mother_name' => 'Ibu',
            'parent_phone' => '081234567891',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->adminUser)->post("/admin/registrations/{$reg->id}/status", [
            'status' => 'accepted',
            'admin_notes' => 'Selamat, Anda dinyatakan lolos seleksi PPDB.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $reg->refresh();
        $this->assertEquals('accepted', $reg->status);
        $this->assertEquals('Selamat, Anda dinyatakan lolos seleksi PPDB.', $reg->admin_notes);
        $this->assertEquals($this->adminUser->id, $reg->reviewed_by);
    }

    /**
     * 9. Admin reject registration with notes.
     */
    public function test_admin_can_reject_registration_with_notes(): void
    {
        $reg = Registration::create([
            'registration_number' => 'REG-2026-000011',
            'full_name' => 'Calon Siswa Ditolak',
            'nik' => '3171012304093333',
            'birth_place' => 'Jakarta',
            'birth_date' => '2009-01-01',
            'gender' => 'P',
            'address' => 'Alamat',
            'phone' => '081234567890',
            'email' => 'ditolak@test.com',
            'father_name' => 'Ayah',
            'mother_name' => 'Ibu',
            'parent_phone' => '081234567891',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->adminUser)->post("/admin/registrations/{$reg->id}/status", [
            'status' => 'rejected',
            'admin_notes' => 'Mohon maaf, berkas persyaratan tidak memenuhi kuota zonasi.',
        ]);

        $response->assertRedirect();

        $reg->refresh();
        $this->assertEquals('rejected', $reg->status);
        $this->assertEquals('Mohon maaf, berkas persyaratan tidak memenuhi kuota zonasi.', $reg->admin_notes);
    }

    /**
     * 10. Unauthorized user cannot access private documents.
     */
    public function test_unauthorized_user_cannot_access_private_documents(): void
    {
        Storage::fake('local');
        $file = UploadedFile::fake()->create('rahasia_kk.pdf', 200, 'application/pdf');
        $path = $file->store('registrations/1', 'local');

        $reg = Registration::create([
            'registration_number' => 'REG-2026-000012',
            'full_name' => 'Calon Siswa Berkas Privat',
            'nik' => '3171012304094444',
            'birth_place' => 'Jakarta',
            'birth_date' => '2009-01-01',
            'gender' => 'L',
            'address' => 'Alamat',
            'phone' => '081234567890',
            'email' => 'privat@test.com',
            'father_name' => 'Ayah',
            'mother_name' => 'Ibu',
            'parent_phone' => '081234567891',
            'status' => 'pending',
        ]);

        $doc = RegistrationDocument::create([
            'registration_id' => $reg->id,
            'document_type' => 'kk',
            'file_path' => $path,
            'original_name' => 'rahasia_kk.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 204800,
        ]);

        // Guest access -> redirect login
        $guestResponse = $this->get("/admin/registrations/{$reg->id}/documents/{$doc->id}/download");
        $guestResponse->assertRedirect('/login');

        // Student access -> 403 Forbidden
        $studentResponse = $this->actingAs($this->studentUser)->get("/admin/registrations/{$reg->id}/documents/{$doc->id}/download");
        $studentResponse->assertStatus(403);

        // Teacher access -> 403 Forbidden
        $teacherResponse = $this->actingAs($this->teacherUser)->get("/admin/registrations/{$reg->id}/documents/{$doc->id}/download");
        $teacherResponse->assertStatus(403);

        // Admin access -> 200 Download
        $adminResponse = $this->actingAs($this->adminUser)->get("/admin/registrations/{$reg->id}/documents/{$doc->id}/download");
        $adminResponse->assertStatus(200);
    }

    /**
     * 11. Admin can export CSV.
     */
    public function test_admin_can_export_registrations_csv(): void
    {
        $response = $this->actingAs($this->adminUser)->get('/admin/registrations/export-csv');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }
}
