<?php

namespace App\Models;

use App\Models\Concerns\HasRolesAndPermissions;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRolesAndPermissions, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Teacher profile associated with user.
     */
    public function teacher(): HasOne
    {
        return $this->hasOne(Teacher::class);
    }

    /**
     * Student profile associated with user.
     */
    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    /**
     * Parent profile associated with user.
     */
    public function parentProfile(): HasOne
    {
        return $this->hasOne(ParentProfile::class);
    }

    /**
     * Get dashboard URL based on user role.
     */
    public function getDashboardUrl(): string
    {
        if ($this->hasAnyRole('super_admin', 'admin')) {
            return route('admin.dashboard');
        }

        if ($this->hasRole('teacher')) {
            return route('teacher.dashboard');
        }

        if ($this->hasRole('student')) {
            return route('student.dashboard');
        }

        if ($this->hasRole('parent')) {
            return route('parent.dashboard');
        }

        return route('home');
    }
}
