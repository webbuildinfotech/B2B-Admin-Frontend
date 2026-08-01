import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

/**
 * Admin panel page title + meta description.
 * Defaults to noindex (private app — should not rank in Google).
 */
export function PageSeo({ title, description, noIndex = true }) {
  const siteName = CONFIG.site.name;
  const fullTitle = title?.includes(siteName) ? title : `${title} | ${siteName}`;
  const metaDescription =
    description || CONFIG.site.defaultDescription;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
    </Helmet>
  );
}

PageSeo.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  noIndex: PropTypes.bool,
};
