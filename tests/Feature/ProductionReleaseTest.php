<?php

namespace Tests\Feature;

use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductionReleaseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_health_check_endpoint_returns_ok_status_and_database_subsystem(): void
    {
        $response = $this->getJson('/health');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'app',
            'environment',
            'timestamp',
            'subsystems' => [
                'database',
                'storage',
            ],
        ]);
        $response->assertJson([
            'status' => 'ok',
            'subsystems' => [
                'database' => 'ok',
                'storage' => 'ok',
            ],
        ]);
    }

    public function test_public_core_routes_respond_successfully(): void
    {
        $this->get('/')->assertStatus(200);
        $this->get('/profil')->assertStatus(200);
        $this->get('/berita')->assertStatus(200);
        $this->get('/kalender')->assertStatus(200);
        $this->get('/guru')->assertStatus(200);
        $this->get('/kontak')->assertStatus(200);
        $this->get('/pendaftaran')->assertStatus(200);
        $this->get('/sitemap.xml')->assertStatus(200);
    }

    public function test_auth_routes_are_available(): void
    {
        $this->get('/login')->assertStatus(200);
        $this->get('/forgot-password')->assertStatus(200);
    }
}
