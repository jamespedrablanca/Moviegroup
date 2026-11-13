<?php
declare(strict_types=1);

$host = getenv('CINEMATE_DB_HOST') ?: '127.0.0.1';
$database = getenv('CINEMATE_DB_NAME') ?: 'cinemate_db';
$username = getenv('CINEMATE_DB_USER') ?: 'root';
$databasePassword = getenv('CINEMATE_DB_PASSWORD');

if ($databasePassword === false) {
    $databasePassword = '';
}

$pdo = new PDO(
    "mysql:host={$host};dbname={$database};charset=utf8mb4",
    $username,
    $databasePassword,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
);
