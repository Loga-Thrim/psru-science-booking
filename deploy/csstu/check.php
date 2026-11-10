<?php
/**
 * Diagnostic page: can this server reach the booking API, and by which route?
 * Open https://csstu.psru.ac.th/~ID/check.php after uploading. It only reads
 * the public room list, so it is safe to leave in place.
 */
header('Content-Type: text/html; charset=utf-8');

$targets = [
    'https://143-198-81-130.sslip.io',
    'https://143.198.81.130',
    'https://psru-booking.vercel.app',
];

$rows = [];
foreach ($targets as $target) {
    if (!function_exists('curl_init')) {
        $rows[] = [$target, 'ไม่มี PHP curl บนเครื่องนี้', false];
        continue;
    }
    $ch = curl_init($target . '/api/book-rooms');
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 15]);
    $started = microtime(true);
    $body = curl_exec($ch);
    $ms = (int) ((microtime(true) - $started) * 1000);
    if ($body === false) {
        $rows[] = [$target, 'ไม่ผ่าน: ' . curl_error($ch), false];
    } else {
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $data = json_decode($body, true);
        $ok = $status === 200 && is_array($data);
        $rows[] = [$target, $ok ? "ผ่าน ({$ms} ms, พบ " . count($data) . " ห้อง)" : "ตอบกลับ HTTP {$status}", $ok];
    }
    curl_close($ch);
}
$anyOk = (bool) array_filter($rows, fn ($r) => $r[2]);
?>
<!doctype html>
<html lang="th">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ตรวจการเชื่อมต่อ</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;color:#1e293b}td{padding:.5rem;border-bottom:1px solid #e2e8f0}.ok{color:#047857;font-weight:600}.bad{color:#b91c1c}</style></head>
<body>
<h1>ตรวจการเชื่อมต่อระบบจองห้อง</h1>
<p>PHP <?= htmlspecialchars(PHP_VERSION) ?> · curl <?= function_exists('curl_version') ? htmlspecialchars(curl_version()['version']) : 'ไม่มี' ?></p>
<table>
<?php foreach ($rows as [$target, $result, $ok]): ?>
<tr><td><?= htmlspecialchars($target) ?></td><td class="<?= $ok ? 'ok' : 'bad' ?>"><?= htmlspecialchars($result) ?></td></tr>
<?php endforeach; ?>
</table>
<h2 class="<?= $anyOk ? 'ok' : 'bad' ?>"><?= $anyOk ? 'ใช้งานได้ ✓' : 'ใช้งานไม่ได้: เครื่องนี้ออกไปหาเซิร์ฟเวอร์ไม่ได้เลย' ?></h2>
</body>
</html>
