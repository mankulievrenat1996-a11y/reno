<?php
/**
 * Plugin Name: RPD legacy HTML redirects
 * Description: Redirects old static .html URLs to the current WordPress permalinks.
 */

add_action('template_redirect', static function (): void {
    if (is_admin()) {
        return;
    }

    $request_path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if (!is_string($request_path)) {
        return;
    }

    $legacy_path = rawurldecode($request_path);

    $redirects = [
        '/index.html' => '/',
        '/uslugi.html' => '/uslugi',
        '/o-kompanii.html' => '/o-kompanii',
        '/proekty.html' => '/proekty',
        '/kontakty.html' => '/kontakty',
        '/stati.html' => '/stati',
        '/remont-bez-otklyucheniya-vody.html' => '/remont-bez-otklyucheniya-vody',
        '/diagnostika-truboprovodov.html' => '/diagnostika-truboprovodov',
        '/stoimost-vrezki-pod-davleniem.html' => '/stoimost-vrezki-pod-davleniem',
        '/vrezka-v-truboprovod-pod-davleniem.html' => '/vrezka-v-truboprovod-pod-davleniem',
        '/vrezka-v-gazoprovod-pod-davleniem.html' => '/vrezka-v-gazoprovod-pod-davleniem',
        '/vrezka-v-vodoprovod-pod-davleniem.html' => '/vrezka-v-vodoprovod-pod-davleniem',
        '/vrezka-v-nefteprovod-pod-davleniem.html' => '/vrezka-v-nefteprovod-pod-davleniem',
        '/politika-konfidencialnosti.html' => '/politika-konfidencialnosti',
        '/soglasie-na-obrabotku-pdn.html' => '/soglasie-na-obrabotku-pdn',
    ];

    if (!isset($redirects[$legacy_path])) {
        return;
    }

    wp_safe_redirect(home_url($redirects[$legacy_path]), 301);
    exit;
});
