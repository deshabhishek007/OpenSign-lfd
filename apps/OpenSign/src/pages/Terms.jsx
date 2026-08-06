import LegalPage from "./LegalPage";

const SECTIONS = [
  {
    heading: "Acceptance of terms",
    body: "By creating an account or using LDF Sign (the “Service”), you agree to these Terms of Service. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these terms."
  },
  {
    heading: "The service",
    body: "LDF Sign lets you upload documents, request electronic signatures, sign documents yourself, and store the resulting records. Features and limits may vary by plan and may change over time."
  },
  {
    heading: "Your account",
    body: "You are responsible for the activity under your account and for keeping your credentials secure. Notify the operator promptly of any unauthorized use. You must provide accurate information and keep it up to date."
  },
  {
    heading: "Acceptable use",
    body: "You agree not to use the Service to send unlawful, fraudulent, or deceptive documents, to impersonate others, to infringe intellectual-property or privacy rights, or to transmit malware. You are responsible for having the legal right to request signatures on the documents you send."
  },
  {
    heading: "Electronic signatures",
    body: "You agree that electronic signatures created through the Service are intended to have the same legal effect as handwritten signatures where permitted by applicable law. Each completed document is accompanied by a Certificate of Completion recording the signing event. It is your responsibility to ensure electronic signing is appropriate and enforceable for your particular use."
  },
  {
    heading: "Plans and documents",
    body: "Some plans include a limited number of documents. When a limit is reached, you may need to upgrade or request additional capacity to continue. Plan changes are handled by the account administrator for your organization."
  },
  {
    heading: "Your content",
    body: "You retain all rights to the documents and data you upload. You grant the operator the limited rights necessary to store, process, and deliver your documents in order to provide the Service. The operator does not claim ownership of your content."
  },
  {
    heading: "Availability and changes",
    body: "The Service is provided on an “as is” and “as available” basis. Features may be added, changed, or removed, and maintenance may cause temporary unavailability. Reasonable efforts are made to keep the Service running and your data safe, but no uninterrupted or error-free operation is guaranteed."
  },
  {
    heading: "Limitation of liability",
    body: "To the maximum extent permitted by law, the operator is not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Nothing in these terms limits liability that cannot be limited under applicable law."
  },
  {
    heading: "Termination",
    body: "You may stop using the Service at any time. The operator may suspend or terminate access for violation of these terms or misuse of the Service. On termination, you may request an export of your documents subject to reasonable technical limits."
  },
  {
    heading: "Contact",
    body: "Questions about these terms should be directed to your LDF Sign account administrator."
  }
];

const Terms = () => (
  <LegalPage title="Terms of Service" updated="August 2026" sections={SECTIONS} />
);

export default Terms;
