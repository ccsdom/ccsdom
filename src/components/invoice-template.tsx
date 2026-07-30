// This component is no longer used for client-side rendering
// but kept for potential reference or future server-side generation.
// The PDF generation logic has been moved to a Firebase Extension.

import { Client } from "@/app/admin/clients/page";

type Invoice = {
    id: string;
    client: Client;
    date: Date;
    dueDate: Date;
    amount: number;
    status: "Payée" | "En attente" | "En retard";
};

export const InvoiceTemplate = ({ invoice }: { invoice: Invoice }) => {
    return (
        <div>
            <h1>Facture {invoice.id}</h1>
            <p>Client: {invoice.client.name}</p>
            <p>Montant: {invoice.amount.toFixed(2)}€</p>
        </div>
    );
};
