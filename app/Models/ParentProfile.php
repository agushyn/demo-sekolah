<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ParentProfile extends Model
{
    use HasFactory;

    protected $table = 'parents';

    protected $fillable = [
        'user_id',
        'nik',
        'relationship_type',
        'phone',
        'occupation',
        'address',
    ];

    /**
     * The user account for this parent.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The students associated with this parent.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'parent_id');
    }
}
