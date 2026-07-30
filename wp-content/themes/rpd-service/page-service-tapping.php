<?php
/**
 * Template Name: Service tapping page
 *
 * @package rpd-service
 */

get_header();
?>

<style id="rpd-service-page-template-css">
.service-content {
  max-width: var(--container);
}
.service-content .lead {
  max-width: 920px;
  margin-bottom: 30px;
}
.service-content h2 {
  margin-top: 58px;
  margin-bottom: 22px;
}
.service-content .cards + h2,
.service-content .check-list + h2,
.service-content .proc-list + h2,
.service-content .faq + .related-services {
  margin-top: 64px;
}
.service-content .faq {
  margin-top: 20px;
}
.service-content .cards {
  gap: 24px;
}
.service-content .panel-card {
  border-radius: 8px;
}
.service-content .check-list,
.service-content .proc-list {
  margin-bottom: 8px;
}
.service-gallery {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin: 34px 0 12px;
}
.service-gallery figure {
  margin: 0;
}
.service-gallery__main,
.service-gallery__item {
  position: relative;
  min-height: 270px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--ink-900);
  box-shadow: var(--shadow-sm);
}
.service-gallery__side {
  display: contents;
}
.service-gallery img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.service-gallery__caption {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 34px 14px 13px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  background: linear-gradient(180deg, rgba(13, 11, 8, 0), rgba(13, 11, 8, .84));
}
.service-gallery__note {
  max-width: 880px;
  margin: 0 0 42px;
  color: var(--ink-600);
}
.related-services {
  margin-top: 58px;
}
.related-services h2 {
  margin-top: 0;
}
.related-services .cards {
  margin-top: 20px;
}
.page-hero.service-hero {
  background:
    linear-gradient(90deg, rgba(13,11,8,.92), rgba(13,11,8,.68) 52%, rgba(13,11,8,.34)),
    var(--hero-photo),
    linear-gradient(135deg, var(--ink-800), var(--ink-900));
  background-size: cover;
  background-position: center;
  padding: 76px 0 86px;
}
@media (max-width: 980px) {
  .service-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .page-hero.service-hero {
    padding: 58px 0 66px;
  }
  .service-content h2 {
    margin-top: 44px;
  }
  .service-gallery {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-top: 26px;
  }
  .service-gallery__main,
  .service-gallery__item {
    min-height: 230px;
  }
  .service-gallery__note {
    margin-bottom: 32px;
  }
}
</style>

<?php
while ( have_posts() ) :
	the_post();
	the_content();
endwhile;

get_footer();
