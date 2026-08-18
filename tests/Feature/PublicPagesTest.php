<?php

namespace Tests\Feature;

use Database\Seeders\AcademicCalendarSeeder;
use Database\Seeders\ForumSeeder;
use Database\Seeders\NewsCategorySeeder;
use Database\Seeders\NewsSeeder;
use Database\Seeders\RegistrationSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\VirtualClassroomSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);
        $this->seed(UserSeeder::class);
        $this->seed(NewsCategorySeeder::class);
        $this->seed(NewsSeeder::class);
        $this->seed(AcademicCalendarSeeder::class);
        $this->seed(RegistrationSeeder::class);
        $this->seed(VirtualClassroomSeeder::class);
        $this->seed(ForumSeeder::class);
    }

    public function test_homepage_returns_successful_inertia_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Home')
            ->has('school')
            ->has('appName')
            ->has('featuredNews')
            ->has('upcomingEvents')
        );
    }

    public function test_profile_page_returns_successful_inertia_response(): void
    {
        $response = $this->get('/profil');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Profile')
            ->has('history')
            ->has('vision')
            ->has('mission')
            ->has('coreValues')
            ->has('facilities')
        );
    }

    public function test_news_index_returns_successful_inertia_response(): void
    {
        $response = $this->get('/berita');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/News')
            ->has('newsList.data')
            ->has('categories')
            ->has('currentCategory')
        );
    }

    public function test_news_detail_page_returns_successful_inertia_response(): void
    {
        $response = $this->get('/berita/tim-robotika-sma-nusantara-raih-juara-1-osn-2026');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/NewsDetail')
            ->has('news.title')
            ->has('news.content')
            ->has('news.author')
            ->has('news.category')
            ->has('relatedNews')
        );
    }

    public function test_calendar_page_returns_successful_inertia_response(): void
    {
        $response = $this->get('/kalender');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Calendar')
            ->has('events')
            ->has('categories')
        );
    }

    public function test_teachers_directory_returns_successful_inertia_response(): void
    {
        $response = $this->get('/guru');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Teachers')
            ->has('teachers')
        );
    }

    public function test_contact_page_returns_successful_inertia_response(): void
    {
        $response = $this->get('/kontak');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Contact')
            ->has('contactInfo')
        );
    }

    public function test_faq_page_returns_successful_inertia_response(): void
    {
        $response = $this->get('/faq');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Faq')
            ->has('faqCategories')
        );
    }

    public function test_login_page_returns_successful_inertia_response(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Login')
            ->has('school')
        );
    }

    public function test_register_page_returns_successful_inertia_response(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Register')
            ->has('school')
        );
    }

    public function test_forgot_password_page_returns_successful_inertia_response(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/ForgotPassword')
        );
    }
}
