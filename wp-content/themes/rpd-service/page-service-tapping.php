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
</style>

<?php
while ( have_posts() ) :
	the_post();
	the_content();
endwhile;

get_footer();
