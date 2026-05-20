<?php
/**
 * CORS Headers Utility
 * Include this file at the TOP of every API endpoint
 * 
 * Usage:
 *   <?php
 *   require_once __DIR__ . '/cors-headers.php';
 *   // ... rest of your code
 */

// Set proper CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Wildcard is safe since we don't use credentials
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');

