<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreNewsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasAnyRole(['super_admin', 'admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:news_categories,id'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'status' => ['required', 'in:draft,published,scheduled'],
            'is_featured' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
        ];
    }

    /**
     * Get custom attribute names.
     */
    public function attributes(): array
    {
        return [
            'title' => 'Judul Berita',
            'category_id' => 'Kategori Berita',
            'excerpt' => 'Ringkasan Berita',
            'content' => 'Isi Konten Berita',
            'thumbnail' => 'Gambar Thumbnail',
            'status' => 'Status Publikasi',
            'published_at' => 'Jadwal Publikasi',
        ];
    }
}
