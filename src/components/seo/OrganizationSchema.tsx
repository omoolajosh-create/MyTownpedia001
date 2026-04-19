import { Helmet } from 'react-helmet-async';

export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MyTownpedia",
    "description": "Discover and share African town stories, traditions, and heritage. Preserve community memories.",
    "url": "https://mytownpedia.com",
    "logo": "https://mytownpedia.com/logo.png",
    "sameAs": [
      "https://twitter.com/mytownpedia",
      "https://facebook.com/mytownpedia",
      "https://instagram.com/mytownpedia"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "info@mytownpedia.com"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
