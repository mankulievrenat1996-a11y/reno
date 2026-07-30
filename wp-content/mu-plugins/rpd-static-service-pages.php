<?php
/**
 * Plugin Name: RPD static service pages
 * Description: Serves new static service pages through WordPress clean URLs.
 */

add_action('template_redirect', static function (): void {
    if (is_admin()) {
        return;
    }

    ob_start(static function (string $html): string {
        $html = preg_replace('~<img([^>]*class="logo__mark"[^>]*)src="https://rpd-service\\.ru/wp-content/themes/rpd-service/assets/img/logo\\.png\\?ver=[^"]*"~', '<img$1src="/assets/logo.png"', $html) ?? $html;
        $html = preg_replace('~<img([^>]*class="logo__mark"[^>]*)src="/wp-content/themes/rpd-service/assets/img/logo\\.png"~', '<img$1src="/assets/logo.png"', $html) ?? $html;

        if (strpos($html, 'class="nav-services"') !== false) {
            return $html;
        }

        $menu = <<<'HTML'
<div class="nav__item nav__item--services">
      <details class="nav-services">
        <summary class="nav-services__summary">Услуги</summary>
        <div class="nav-services__menu" aria-label="Услуги">
          <a href="/uslugi">Все услуги</a>
          <a href="/vrezka-v-truboprovod-pod-davleniem">Врезка в трубопровод</a>
          <a href="/vrezka-v-gazoprovod-pod-davleniem">Врезка в газопровод</a>
          <a href="/vrezka-v-vodoprovod-pod-davleniem">Врезка в водопровод</a>
          <a href="/vrezka-v-nefteprovod-pod-davleniem">Врезка в нефтепровод</a>
        </div>
      </details>
    </div>
HTML;

        $html = preg_replace(
            '~<a href="https://rpd-service\.ru/uslugi" class="([^"]*)">Услуги</a>~',
            str_replace('nav-services__summary"', 'nav-services__summary $1"', $menu),
            $html,
            1
        ) ?? $html;

        $styles = <<<'HTML'
<style id="rpd-services-menu-fix">
.nav__item{position:relative}.nav a:hover,.nav a.active,.nav-services__summary:hover,.nav-services__summary.active,.nav-services[open] .nav-services__summary{background:linear-gradient(135deg,var(--amber-500,#FFDD00),var(--amber-600,#D4B106))!important;color:var(--ink-900,#0D0B08)!important}.nav-services{position:relative}.nav-services__summary{list-style:none;display:flex;align-items:center;gap:7px;padding:10px 14px;border-radius:100px;color:var(--ink-700,#2B2318);font-weight:700;font-size:14.5px;white-space:nowrap;cursor:pointer;transition:background .2s,color .2s}.nav-services__summary::-webkit-details-marker{display:none}.nav-services__summary::after{content:"";width:7px;height:7px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg) translateY(-2px);transition:transform .2s}.nav-services[open] .nav-services__summary::after{transform:rotate(225deg) translateY(-1px)}.nav-services__menu{position:absolute;top:calc(100% - 2px);left:0;z-index:250;min-width:300px;padding:10px;border:1px solid var(--border,#E7D5C7);border-radius:8px;background:#fff;box-shadow:0 18px 45px rgba(33,23,18,.16);display:grid;gap:4px;opacity:0;visibility:hidden;transform:translateY(6px);transition:opacity .18s,transform .18s,visibility .18s;pointer-events:auto}.nav__item--services:hover .nav-services__menu,.nav-services[open] .nav-services__menu{opacity:1;visibility:visible;transform:translateY(0)}.nav-services__menu a{display:block;padding:11px 12px;border-radius:6px;color:var(--ink-700,#2B2318);font-size:14px;font-weight:700;white-space:normal}.nav-services__menu a:hover,.nav-services__menu a.is-active{background:linear-gradient(135deg,var(--amber-500,#FFDD00),var(--amber-600,#D4B106))!important;color:var(--ink-900,#0D0B08)!important}@media(max-width:860px){.nav__item{width:100%}.nav-services{width:100%}.nav-services__summary{width:100%;justify-content:space-between;padding:14px 16px;border-radius:8px;font-size:18px}.nav-services__menu{position:static;min-width:0;width:100%;margin:0 0 4px;padding:0 0 0 12px;border:0;box-shadow:none;background:transparent;display:none;opacity:1;visibility:visible;transform:none}.nav-services[open] .nav-services__menu{display:grid}.nav-services__menu a{padding:11px 14px;font-size:16px}}
</style>
HTML;

        if (strpos($html, 'id="rpd-services-menu-fix"') === false) {
            $html = str_replace('</head>', $styles . "\n</head>", $html);
        }

        $script = <<<'HTML'
<script id="rpd-services-menu-script">
document.querySelectorAll('.nav__item--services').forEach(function(item){var details=item.querySelector('.nav-services');if(!details)return;item.addEventListener('mouseenter',function(){if(window.matchMedia('(min-width: 861px)').matches)details.open=true;});item.addEventListener('mouseleave',function(){if(window.matchMedia('(min-width: 861px)').matches)window.setTimeout(function(){if(!item.matches(':hover'))details.open=false;},220);});});(function(){var path=location.pathname.replace(/\/$/,'');document.querySelectorAll('.nav-services').forEach(function(menu){var summary=menu.querySelector('.nav-services__summary');menu.querySelectorAll('.nav-services__menu a').forEach(function(link){var linkPath=new URL(link.href,location.origin).pathname.replace(/\/$/,'');if(linkPath===path){link.classList.add('is-active');if(summary)summary.classList.add('active');}});});})();
</script>
HTML;

        if (strpos($html, 'id="rpd-services-menu-script"') === false) {
            $html = str_replace('</body>', $script . "\n</body>", $html);
        }

        return $html;
    });
}, 1);
