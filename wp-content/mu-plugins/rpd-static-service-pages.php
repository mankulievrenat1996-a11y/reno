<?php
/**
 * Plugin Name: RPD static service pages
 * Description: Serves new static service pages through WordPress clean URLs.
 */

add_action('template_redirect', static function (): void {
    if (is_admin()) {
        return;
    }

    $request_path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if (!is_string($request_path)) {
        return;
    }

    $slug = trim(rawurldecode($request_path), '/');
    $pages = [
        'vrezka-v-truboprovod-pod-davleniem' => 'vrezka-v-truboprovod-pod-davleniem.html',
        'vrezka-v-gazoprovod-pod-davleniem' => 'vrezka-v-gazoprovod-pod-davleniem.html',
        'vrezka-v-vodoprovod-pod-davleniem' => 'vrezka-v-vodoprovod-pod-davleniem.html',
        'vrezka-v-nefteprovod-pod-davleniem' => 'vrezka-v-nefteprovod-pod-davleniem.html',
    ];

    if (!isset($pages[$slug])) {
        return;
    }

    $file = ABSPATH . $pages[$slug];
    if (!is_readable($file)) {
        return;
    }

    status_header(200);
    nocache_headers();
    header('Content-Type: text/html; charset=UTF-8');
    readfile($file);
    exit;
}, 0);
