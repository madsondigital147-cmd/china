import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="January 2026">
      <p>
        This Privacy Policy describes how Nexus Global Logistics collects, uses and protects information in
        connection with the logistics platform. This is a template policy — no claims of compliance are made
        until implemented and verified.
      </p>
      <section>
        <h2 className="text-lg font-semibold">1. Information we collect</h2>
        <p>
          Account information (name, email, language, timezone), shipment information (sender and recipient
          details, package data) and technical data (device, IP address, API logs). Tracking pages show only the
          minimum information necessary to follow a shipment.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">2. How we use information</h2>
        <p>
          We use information to operate the logistics platform, process shipments, provide tracking, respond to
          support requests, ensure security and comply with applicable law. We do not sell personal data.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">3. Data retention</h2>
        <p>
          Logistics history is kept for operational and audit purposes. Customers may request data access,
          correction or deletion as permitted by applicable law. Placeholder — configure retention policies.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">4. Account deletion</h2>
        <p>
          You may request deletion of your account. Shipment tracking history required for logistics operations
          may be kept in accordance with applicable retention requirements.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">5. Contact</h2>
        <p>
          For privacy questions, contact support at the email shown on our Contact page. Placeholder contact
          information is configured from admin settings.
        </p>
      </section>
    </LegalPage>
  );
}