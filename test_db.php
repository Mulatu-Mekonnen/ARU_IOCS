<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$users = DB::table('users')->count();
echo 'Users in database: ' . $users . "\n";
?>