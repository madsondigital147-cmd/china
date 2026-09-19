import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Policies",
  robots: { index: true, follow: true },
};

export default function PoliciesPage() {
  return (
    <LegalPage title="Company Policies" updated="January 2026">
      <p>
        This page summarizes the operational policies of the logistics platform. Each policy below is a
        starting template — final policies must be reviewed and approved before public use.
      </p>
      <section>
        <h2 className="text-lg font-semibold">Cookie policy</h2>
        <p>
          We use strictly necessary cookies (sessions) and, where enabled, preferences (language, theme) stored
          locally. No advertising cookies are used. Placeholder — update with your cookie notice.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Data protection approach</h2>
        <p>
          The platform implements security measures including password hashing, secure sessions, role-based
          access control, rate limiting and audit logs. This architecture is prepared to support data protection
          practices. No certification, compliance or legal claim is made here.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Returned and undeliverable shipments</h2>
        <p>
          Undeliverable shipments may be returned to origin. Exception handling follows the procedures
          configured by operational staff.
        </p>
      </section>
    </LegalPage>
  );
}