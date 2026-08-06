import LegalPage from "./LegalPage";

const SECTIONS = [
  {
    heading: "Overview",
    body: "This Privacy Policy explains what information LDF Sign (the “Service”) collects, how it is used, and the choices you have. It applies to people who create accounts and to recipients who sign documents through the Service."
  },
  {
    heading: "Information we collect",
    body: "Account information you provide, such as your name, email address, organization, and (optionally) phone and job title.\nDocument information you upload, including files, field placements, and signer details.\nSigning records, including signer name, email, IP address, and timestamps captured to produce the audit trail and Certificate of Completion.\nTechnical information needed to operate the Service, such as session tokens and basic request logs."
  },
  {
    heading: "How we use information",
    body: "To provide the Service — storing your documents, sending signature requests, capturing signatures, and generating completion records.\nTo notify you and your recipients about document activity.\nTo secure the Service, prevent abuse, and comply with legal obligations."
  },
  {
    heading: "Document storage",
    body: "Documents and their signing records are stored on this deployment's own infrastructure rather than a shared third-party signing service. Access is limited to what is necessary to operate the Service."
  },
  {
    heading: "Sharing",
    body: "Your documents and signing details are shared only with the parties involved in a document (the sender and the recipients) and with service providers strictly necessary to operate the Service, such as email delivery. Your information is not sold."
  },
  {
    heading: "Email",
    body: "Transactional emails — signature requests, completion notices, and one-time codes — are sent to the addresses you and your recipients provide. These are required to deliver the Service and are not marketing messages."
  },
  {
    heading: "Retention",
    body: "Documents and records are retained for as long as your account needs them or as required to maintain a valid audit trail. You may request deletion of documents subject to legal and technical constraints."
  },
  {
    heading: "Security",
    body: "Reasonable technical and organizational measures are used to protect your information, including access controls and encrypted connections. No method of transmission or storage is completely secure, but the Service is operated with the integrity of signed records as a priority."
  },
  {
    heading: "Your choices",
    body: "You can review and update your profile information in your account settings, and request export or deletion of your documents through your account administrator."
  },
  {
    heading: "Changes",
    body: "This policy may be updated as the Service evolves. Material changes will be reflected here with a new “last updated” date."
  },
  {
    heading: "Contact",
    body: "Questions about privacy should be directed to your LDF Sign account administrator."
  }
];

const Privacy = () => (
  <LegalPage title="Privacy Policy" updated="August 2026" sections={SECTIONS} />
);

export default Privacy;
