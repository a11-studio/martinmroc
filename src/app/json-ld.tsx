import { getMetadataBase } from "@/lib/site";

/** Person structured data — complements meta tags for search & rich results */
export default function PersonJsonLd() {
  const base = getMetadataBase();
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Martin Mroč",
    jobTitle: "Design lead & UX/UI designer",
    url: base.origin,
    image: `${base.origin}/images/og-image.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bratislava",
      addressCountry: "SK",
    },
    sameAs: [
      "https://www.linkedin.com/in/martin-mroc/",
      "https://www.behance.net/martinclear",
      "https://dribbble.com/martinmroc",
    ],
    knowsAbout: [
      "User interface design",
      "User experience design",
      "Product design",
      "Web design",
      "Motion design",
      "Design systems",
      "Web3 product design",
    ],
    description:
      "UX/UI designer and design lead based in Bratislava. Product interfaces, motion, web3, and design systems.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
