<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Office;
use Illuminate\Support\Str;

class OfficeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Office::create(['id' => Str::uuid(), 'name' => 'President Office']);
        Office::create(['id' => Str::uuid(), 'name' => 'Academic Affairs']);
        Office::create(['id' => Str::uuid(), 'name' => 'Student Affairs']);
        Office::create(['id' => Str::uuid(), 'name' => 'Finance Office']);
        Office::create(['id' => Str::uuid(), 'name' => 'Human Resources']);
    }
}
