<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Office;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $offices = Office::all();

        // Admin user
        User::create([
            'id' => Str::uuid(),
            'name' => 'Admin User',
            'email' => 'admin@office.com',
            'password' => Hash::make('admin123'),
            'role' => 'ADMIN',
            'active' => true,
        ]);

        // Head user
        User::create([
            'id' => Str::uuid(),
            'name' => 'Head User',
            'email' => 'head@office.com',
            'password' => Hash::make('head1234'),
            'role' => 'HEAD',
            'active' => true,
            'office_id' => $offices->where('name', 'President Office')->first()->id,
        ]);

        // Staff user
        User::create([
            'id' => Str::uuid(),
            'name' => 'Staff User',
            'email' => 'staff@office.com',
            'password' => Hash::make('user1234'),
            'role' => 'STAFF',
            'active' => true,
            'office_id' => $offices->where('name', 'Academic Affairs')->first()->id,
        ]);

        // Viewer user
        User::create([
            'id' => Str::uuid(),
            'name' => 'Viewer User',
            'email' => 'namste@office.com',
            'password' => Hash::make('1234'),
            'role' => 'VIEWER',
            'active' => true,
            'office_id' => $offices->where('name', 'Student Affairs')->first()->id,
        ]);
    }
}
