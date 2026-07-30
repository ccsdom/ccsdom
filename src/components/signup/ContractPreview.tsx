"use client";

import * as React from "react";
import type { SignupFormValues } from "@/features/signup/config";
import {
  getAccompanimentLabel,
  getAddressLabel,
  getLegalStatusLabel,
  getMailPlanLabel,
  getPaymentFrequencyLabel,
  getProjectTypeLabel,
} from "@/features/signup/display";

type ContractPreviewProps = {
  data: Partial<SignupFormValues> & {
    signature?: string | null;
    signatureUrl?: string | null;
    signatureCaption?: string | null;
    signatoryName?: string | null;
    signedAt?: string | null;
    signaturePlacement?: string | null;
  };
};

function formatSignedAt(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("fr-FR");
}

function displayText(value: unknown, fallback = "—") {
  const v = String(value ?? "").trim();
  return v || fallback;
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b py-2 sm:grid-cols-[220px_1fr]">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

export const ContractPreview = React.forwardRef<HTMLDivElement, ContractPreviewProps>(
  function ContractPreview({ data }, ref) {
    const companyName = displayText(data.companyName);
    const fullName = displayText(
      `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim()
    );
    const legalStatus = getLegalStatusLabel(
      String(data.legalStatus ?? ""),
      String(data.otherLegalStatus ?? "")
    );
    const addressLabel = getAddressLabel(String(data.addressId ?? ""));
    const mailPlanLabel = getMailPlanLabel(String(data.mailPlanId ?? ""));
    const projectTypeLabel = getProjectTypeLabel(String(data.projectType ?? ""));
    const accompanimentLabel = getAccompanimentLabel(
      String(data.accompanimentType ?? "")
    );
    const paymentFrequencyLabel = getPaymentFrequencyLabel(
      String(data.paymentFrequency ?? "")
    );
    const signedAtLabel = formatSignedAt(data.signedAt);
    const signatoryName =
      displayText(data.signatoryName) !== "—"
        ? displayText(data.signatoryName)
        : fullName !== "—"
        ? fullName
        : companyName;

    return (
      <div
        ref={ref}
        className="mx-auto w-full max-w-4xl bg-white p-6 text-slate-900 print:p-0"
      >
        <div className="space-y-6">
          <header className="border-b pb-4">
            <h1 className="text-2xl font-bold">
              Contrat de domiciliation commerciale
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Le présent document récapitule les informations déclarées dans le
              cadre de votre demande de domiciliation.
            </p>
          </header>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">1. Informations société</h2>
            <div className="rounded-xl border p-4">
              <Row label="Projet" value={projectTypeLabel} />
              <Row label="Dénomination sociale" value={companyName} />
              <Row label="Statut juridique" value={legalStatus} />
              <Row label="SIRET" value={displayText(data.siret, "En cours d'immatriculation")} />
              <Row label="Adresse déclarée" value={displayText(data.address)} />
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">2. Représentant légal</h2>
            <div className="rounded-xl border p-4">
              <Row label="Nom complet" value={fullName} />
              <Row label="Qualité" value={displayText(data.quality)} />
              <Row label="Email" value={displayText(data.email)} />
              <Row label="Téléphone" value={displayText(data.phone)} />
              <Row
                label="Adresse personnelle"
                value={displayText(data.address)}
              />
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">3. Offre choisie</h2>
            <div className="rounded-xl border p-4">
              <Row label="Adresse de domiciliation" value={addressLabel} />
              <Row label="Formule courrier" value={mailPlanLabel} />
              <Row label="Accompagnement" value={accompanimentLabel} />
              <Row label="Fréquence de paiement" value={paymentFrequencyLabel} />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Engagement</h2>
            <div className="rounded-xl border p-4 text-sm leading-6">
              <p>
                Le domicilié certifie l’exactitude des informations fournies et
                s’engage à transmettre toute pièce ou mise à jour nécessaire à la
                bonne exécution du contrat de domiciliation.
              </p>
              <p className="mt-3">
                La validation finale du dossier reste soumise au contrôle
                administratif et documentaire du gestionnaire.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Signature</h2>
            <div className="rounded-xl border p-4">
              <Row label="Signataire" value={signatoryName} />
              <Row label="Date de signature" value={signedAtLabel} />

              {(data.signature || data.signatureUrl) && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    {displayText(data.signatureCaption, "Signature")}
                  </p>

                  {data.signature ? (
                    <img
                      src={data.signature}
                      alt="Signature"
                      className="h-24 max-w-[320px] object-contain"
                    />
                  ) : data.signatureUrl ? (
                    <img
                      src={data.signatureUrl}
                      alt="Signature"
                      className="h-24 max-w-[320px] object-contain"
                    />
                  ) : null}
                </div>
              )}
            </div>
          </section>

          <footer className="border-t pt-4 text-xs text-slate-500">
            <p>
              Document généré dans le cadre du parcours d’inscription CCS-DOM.
            </p>
          </footer>
        </div>
      </div>
    );
  }
);