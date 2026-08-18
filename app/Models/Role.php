<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'label',
        'guard_name',
        'description',
    ];

    /**
     * The permissions that belong to the role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_has_permissions', 'role_id', 'permission_id');
    }

    /**
     * The users that belong to the role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'model_has_roles', 'role_id', 'model_id')
            ->wherePivot('model_type', User::class);
    }

    /**
     * Give a permission to this role.
     */
    public function givePermission(string|Permission $permission): self
    {
        if (is_string($permission)) {
            $permission = Permission::firstOrCreate([
                'name' => $permission,
            ], [
                'label' => ucwords(str_replace('_', ' ', $permission)),
                'guard_name' => 'web',
            ]);
        }

        $this->permissions()->syncWithoutDetaching([$permission->id]);

        return $this;
    }

    /**
     * Revoke a permission from this role.
     */
    public function revokePermission(string|Permission $permission): self
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->first();
        }

        if ($permission) {
            $this->permissions()->detach($permission->id);
        }

        return $this;
    }

    /**
     * Check if role has a permission.
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions->contains('name', $permission);
    }
}
