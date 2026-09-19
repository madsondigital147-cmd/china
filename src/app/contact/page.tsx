import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Mail, Phone, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, SERVICE_EMAIL, SERVICE_PHONE, CHINA_OFFICE_CITY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Contact Nexus Global Logistics for international shipping from China.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <section className="container-app py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight">Contact us</h1>
            <p className="mt-4 text-muted-foreground">
              Talk to our logistics team about shipments, quotes or partnerships.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle className="mt-2">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{SERVICE_EMAIL}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle className="mt-2">Phone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{SERVICE_PHONE}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle className="mt-2">Business hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Monday – Friday, 09:00 – 18:00 (China Standard Time)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle className="mt-2">China office</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{CHINA_OFFICE_CITY}</p>
                <p className="mt-1 text-xs text-muted-foreground">Placeholder address — configured from admin settings.</p>
              </CardContent>
            </Card>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted-foreground">
            © 2026 {APP_NAME} — placeholder contact details for demo. Update from admin Settings.
          </p>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}