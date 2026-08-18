<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ForumReaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reactable_type',
        'reactable_id',
        'reaction_type',
    ];

    /**
     * Polymorphic target (ForumThread or ForumPost).
     */
    public function reactable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * User who reacted.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
