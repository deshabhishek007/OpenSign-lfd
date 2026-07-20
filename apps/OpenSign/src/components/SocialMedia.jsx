import React from "react";

// Legal Data Forensic branding footer (sidebar). Icons use FontAwesome loaded
// via cdn.opensignlabs.com/fonts.css (fa-light / fa-brands).
const SocialMedia = () => {
  return (
    <div className="flex flex-col items-center gap-3 text-xs">
      <div className="flex flex-row justify-center items-center gap-4 text-2xl">
        <a
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
          href="https://legaldataforensic.com/"
          target="_blank"
        >
          <i aria-hidden="true" className="fa-light fa-globe"></i>
          <span className="fa-sr-only">Website</span>
        </a>
        <a
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
          href="https://www.linkedin.com/company/legal-data-forensic/"
          target="_blank"
        >
          <i aria-hidden="true" className="fa-brands fa-linkedin"></i>
          <span className="fa-sr-only">LinkedIn</span>
        </a>
        <a
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
          href="https://www.instagram.com/legaldataforensic"
          target="_blank"
        >
          <i aria-hidden="true" className="fa-brands fa-instagram"></i>
          <span className="fa-sr-only">Instagram</span>
        </a>
        <a
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
          href="https://api.whatsapp.com/send?phone=918766618976"
          target="_blank"
        >
          <i aria-hidden="true" className="fa-brands fa-whatsapp"></i>
          <span className="fa-sr-only">WhatsApp</span>
        </a>
      </div>
      <div className="text-[11px] text-base-content text-center max-w-[280px] leading-tight mt-1">
        <p className="font-semibold">Office Address:</p>
        <p>
          202, Balwant Apartment, Plot 18, Central Excise Colony, Near
          Chhatrapati Square, Nagpur, Maharashtra – 440015
        </p>
        <p className="font-semibold mt-1">Contact us:</p>
        <a
          href="tel:+917773900082"
          className="op-link op-link-primary font-medium"
        >
          +91 7773900082
        </a>
      </div>
    </div>
  );
};

export default SocialMedia;
