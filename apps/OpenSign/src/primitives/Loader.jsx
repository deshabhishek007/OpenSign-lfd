import React from "react";

// Brand loader — crimson→gold comet ring (.ldf-spinner in peenak-theme.css).
// Replaces DaisyUI's default loading-infinity (the OpenSign-era ∞). Every
// loader in the app routes through this component.
const Loader = () => {
  return <div className="ldf-spinner" role="status" aria-label="Loading"></div>;
};

export default Loader;
