<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAcademicEventRequest extends FormRequest
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
            'academic_year_id' => ['nullable', 'exists:academic_years,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'string'],
            'end_time' => ['nullable', 'string'],
            'category' => ['required', 'in:academic,exam,holiday,activity,meeting,event'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_public' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $startDate = $this->input('start_date');
            $endDate = $this->input('end_date') ?: $startDate;
            $startTime = $this->input('start_time');
            $endTime = $this->input('end_time');

            if ($startDate && $endDate && $startDate === $endDate && $startTime && $endTime) {
                if (strtotime($endTime) <= strtotime($startTime)) {
                    $v->errors()->add('end_time', 'Jam selesai tidak boleh mendahului atau sama dengan jam mulai pada tanggal yang sama.');
                }
            }
        });
    }

    /**
     * Custom attribute names.
     */
    public function attributes(): array
    {
        return [
            'title' => 'Judul Agenda',
            'start_date' => 'Tanggal Mulai',
            'end_date' => 'Tanggal Selesai',
            'start_time' => 'Jam Mulai',
            'end_time' => 'Jam Selesai',
            'category' => 'Kategori Agenda',
            'location' => 'Lokasi / Ruangan',
            'is_public' => 'Visibilitas Publik',
        ];
    }
}
