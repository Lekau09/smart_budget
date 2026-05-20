<?php
/**
 * Simple Router for PHP Development Server
 * Routes /api/* requests to /api/ files
 */

$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Route /api/* to /api files
if (strpos($request_path, '/api/') === 0) {
    $file = __DIR__ . $request_path;
    
    if (file_exists($file) && is_file($file)) {
        include $file;
        return true;
    }
}

// Default 404
http_response_code(404);
echo "Not Found";
return false;
?>
