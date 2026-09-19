import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="January 2026">
      <p>
        These terms govern the use of the Nexus Global Logistics platform and services. This is a template —
        final operating terms should be reviewed with qualified counsel.
      </p>
      <section>
        <h2 className="text-lg font-semibold">1. Service description</h2>
        <p>
          The platform provides shipment creation, international logistics coordination, tracking and related
          administrative functions for customers, operators and administrators.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">2. Accounts and security</h2>
        <p>
          You are responsible for safeguarding your credentials. Accounts are non-transferable. We may suspend
          accounts suspected of abusive or unlawful use.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">3. Shipments</h2>
        <p>
          Shipment data, documents and declared values must be accurate. The platform distinguishes internal
          shipment IDs from carrier tracking numbers. Tracking events are sourced from the carrier, the operator
          or the system and labeled accordingly.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">4. Limitation of liability</h2>
        <p>
          To the extent permitted by law, the platform is provided on an &quot;as is&quot; basis. Liability is
          limited as described in the applicable service agreement. Placeholder.
        </p>
      </section>
    </LegalPage>
  );
}