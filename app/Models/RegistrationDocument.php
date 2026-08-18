<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistrationDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_id',
        'document_type',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
    ];

    protected $appends = [
        'formatted_file_size',
        'type_label',
    ];

    /**
     * Relationship to registration.
     */
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    /**
     * Accessor for human-readable type label.
     */
    public function getTypeLabelAttribute(): string
    {
        $labels = [
            'kk' => 'Kartu Keluarga (KK)',
            'birth_certificate' => 'Akta Kelahiran',
            'diploma' => 'Ijazah / SKL',
            'photo' => 'Pas Foto Berwarna',
            'additional' => 'Dokumen Prestasi / Tambahan',
        ];

        return $labels[$this->document_type] ?? ucfirst($this->document_type);
    }

    /**
     * Accessor for formatted file size.
     */
    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = (int) $this->file_size;

        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2).' MB';
        }

        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 1).' KB';
        }

        return $bytes.' B';
    }
}
