<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            UserSeeder::class,
            NewsCategorySeeder::class,
            NewsSeeder::class,
            AcademicCalendarSeeder::class,
            RegistrationSeeder::class,
            VirtualClassroomSeeder::class,
            ForumSeeder::class,
            HeroSlideSeeder::class,
            SchoolStaffSeeder::class,
            ParentStudentSeeder::class,
            StudentClassEnrollmentSeeder::class,
        ]);
    }
}
