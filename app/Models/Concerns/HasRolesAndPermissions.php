<?php

namespace App\Models\Concerns;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;

trait HasRolesAndPermissions
{
    /**
     * The roles assigned to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'model_has_roles', 'model_id', 'role_id')
            ->wherePivot('model_type', static::class);
    }

    /**
     * Direct permissions assigned to the user.
     */
    public function directPermissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'model_has_permissions', 'model_id', 'permission_id')
            ->wherePivot('model_type', static::class);
    }

    /**
     * Assign one or multiple roles to user.
     */
    public function assignRole(string|Role ...$roles): self
    {
        $roleIds = [];

        foreach ($roles as $role) {
            if (is_string($role)) {
                $roleModel = Role::where('name', $role)->first();
                if ($roleModel) {
                    $roleIds[] = $roleModel->id;
                }
            } elseif ($role instanceof Role) {
                $roleIds[] = $role->id;
            }
        }

        if (! empty($roleIds)) {
            $this->roles()->syncWithPivotValues($roleIds, ['model_type' => static::class], false);
            $this->unsetRelation('roles');
        }

        return $this;
    }

    /**
     * Remove a role from user.
     */
    public function removeRole(string|Role $role): self
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->first();
        }

        if ($role) {
            $this->roles()->detach($role->id);
            $this->unsetRelation('roles');
        }

        return $this;
    }

    /**
     * Sync roles for user.
     */
    public function syncRoles(array $roles): self
    {
        $roleIds = [];

        foreach ($roles as $role) {
            if (is_string($role)) {
                $roleModel = Role::where('name', $role)->first();
                if ($roleModel) {
                    $roleIds[] = $roleModel->id;
                }
            } elseif ($role instanceof Role) {
                $roleIds[] = $role->id;
            }
        }

        $this->roles()->syncWithPivotValues($roleIds, ['model_type' => static::class]);
        $this->unsetRelation('roles');

        return $this;
    }

    /**
     * Check if user has specific role(s).
     */
    public function hasRole(string|array $roles): bool
    {
        if (is_string($roles)) {
            $roles = [$roles];
        }

        return $this->roles->contains(fn ($role) => in_array($role->name, $roles, true));
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(string|array ...$roles): bool
    {
        $flattened = collect($roles)->flatten()->all();

        return $this->hasRole($flattened);
    }

    /**
     * Check if user has permission directly or through role.
     */
    public function hasPermission(string $permission): bool
    {
        // Super admin bypasses all permission checks
        if ($this->hasRole('super_admin')) {
            return true;
        }

        // Direct permission
        if ($this->directPermissions->contains('name', $permission)) {
            return true;
        }

        // Permission via role
        foreach ($this->roles as $role) {
            if ($role->permissions->contains('name', $permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get all permissions of the user (direct and role-inherited).
     */
    public function getAllPermissions(): Collection
    {
        $rolePermissions = $this->roles->flatMap->permissions;

        return $this->directPermissions->merge($rolePermissions)->unique('name');
    }

    /**
     * Scope a query to only include users with a given role.
     */
    public function scopeRole($query, string|array $roles)
    {
        $roles = is_array($roles) ? $roles : func_get_args();
        if (isset($roles[0]) && $roles[0] === $query) {
            array_shift($roles);
        }
        $flattened = collect($roles)->flatten()->all();

        return $query->whereHas('roles', function ($q) use ($flattened) {
            $q->whereIn('name', $flattened);
        });
    }

    /**
     * Get primary role name.
     */
    public function getPrimaryRoleAttribute(): string
    {
        $priority = ['super_admin', 'admin', 'teacher', 'student', 'parent'];

        foreach ($priority as $roleName) {
            if ($this->hasRole($roleName)) {
                return $roleName;
            }
        }

        return $this->roles->first()?->name ?? 'guest';
    }
}
