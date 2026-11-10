<?php
/**
 * Front door for the booking API on the university's student server.
 *
 * The university firewall blocks the droplet's sslip.io name for campus
 * browsers, but csstu.psru.ac.th is the university's own domain. The page is
 * served from here, and every API call goes to this script, which forwards it
 * server-side. The browser only ever talks to csstu.psru.ac.th.
 *
 *   /~ID/api.php/booking?x=1   ->  <target>/api/booking?x=1
 *   /~ID/api.php/uploads/a.jpg ->  <target>/uploads/a.jpg
 *
 * Nothing secret lives here: logins and data stay on the droplet.
 */

// Tried in order. Only a failure to *connect* moves on to the next one, so a
// request that reached a server is never sent twice (no double bookings).
const TARGETS = [
    'https://143-198-81-130.sslip.io',
    'https://143.198.81.130',
    'https://psru-booking.vercel.app',
];

// curl errors that mean the request never got through: DNS, connect, TLS.
const RETRYABLE = [5, 6, 7, 28, 35, 51, 58, 60];

function fail($code, $message) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

// The part after "api.php". PATH_INFO is not set on every Apache setup, so
// fall back to cutting it out of the request URI.
$path = $_SERVER['PATH_INFO'] ?? '';
if ($path === '') {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
    $pos = strpos($uri, '/api.php');
    $path = $pos === false ? '' : substr($uri, $pos + strlen('/api.php'));
}

// Only the API and uploaded images: this must not become an open proxy.
if (!preg_match('#^/[A-Za-z0-9._~/-]*$#', $path) || strpos($path, '..') !== false) {
    fail(400, 'invalid path');
}
$upstreamPath = strpos($path, '/uploads/') === 0 ? $path : '/api' . $path;
$query = $_SERVER['QUERY_STRING'] ?? '';
if ($query !== '') {
    $upstreamPath .= '?' . $query;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($method, ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], true)) {
    fail(405, 'method not allowed');
}
$body = file_get_contents('php://input');

$headers = ['Accept: ' . ($_SERVER['HTTP_ACCEPT'] ?? 'application/json')];
if (!empty($_SERVER['CONTENT_TYPE'])) {
    $headers[] = 'Content-Type: ' . $_SERVER['CONTENT_TYPE'];
}
// Some Apache setups hide the Authorization header from PHP.
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
if ($auth === '' && function_exists('getallheaders')) {
    foreach (getallheaders() as $name => $value) {
        if (strcasecmp($name, 'Authorization') === 0) {
            $auth = $value;
        }
    }
}
if ($auth !== '') {
    $headers[] = 'Authorization: ' . $auth;
}
// The API rate-limits public endpoints per visitor; pass on who that is.
$headers[] = 'X-Forwarded-For: ' . ($_SERVER['REMOTE_ADDR'] ?? '');

if (!function_exists('curl_init')) {
    fail(500, 'PHP curl extension is not available on this server');
}

$lastError = '';
foreach (TARGETS as $target) {
    $ch = curl_init($target . $upstreamPath);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    if ($body !== '' && $method !== 'GET') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    $response = curl_exec($ch);
    $errno = curl_errno($ch);
    if ($response === false) {
        $lastError = $target . ': ' . curl_error($ch);
        curl_close($ch);
        if (in_array($errno, RETRYABLE, true)) {
            continue;
        }
        fail(502, 'ติดต่อเซิร์ฟเวอร์ไม่ได้');
    }

    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);

    http_response_code($status);
    if ($contentType) {
        header('Content-Type: ' . $contentType);
    }
    // Only the rate limiter's hint is worth passing on.
    if (preg_match('/^Retry-After:\s*(\d+)/mi', substr($response, 0, $headerSize), $m)) {
        header('Retry-After: ' . $m[1]);
    }
    header('Cache-Control: no-store');
    echo substr($response, $headerSize);
    exit;
}

error_log('booking proxy: all targets failed. ' . $lastError);
fail(502, 'ติดต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง');
