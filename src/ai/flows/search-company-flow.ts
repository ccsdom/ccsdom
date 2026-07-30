
'use server';
/**
 * @fileOverview A flow for searching French companies using an external API.
 * This flow does not use Genkit and directly calls the fetch API.
 *
 * - searchCompany - A function that handles the company search.
 * - SearchCompanyInput - The input type for the searchCompany function.
 * - CompanySearchResult - The return type for the searchCompany function.
 */

import { z } from 'zod';

const LEGAL_STATUS_BY_NATURE_JURIDIQUE: Record<string, string> = {
    "1000": "Entrepreneur individuel",
    "5498": "EURL",
    "5499": "SARL",
    "5710": "SAS",
    "5720": "SASU",
};

function resolveLegalStatus(company: any): string {
    const directStatus = String(
        company.forme_juridique ||
        company.libelle_nature_juridique ||
        company.nature_juridique_libelle ||
        ''
    ).trim();

    if (directStatus && directStatus.toLowerCase() !== 'n/a') {
        return directStatus;
    }

    const natureJuridique = String(company.nature_juridique || '').trim();
    if (LEGAL_STATUS_BY_NATURE_JURIDIQUE[natureJuridique]) {
        return LEGAL_STATUS_BY_NATURE_JURIDIQUE[natureJuridique];
    }

    if (company.complements?.est_entrepreneur_individuel) {
        return "Entrepreneur individuel";
    }

    if (company.complements?.est_association) {
        return "Association";
    }

    return natureJuridique || "Non renseigné";
}

const SearchCompanyInputSchema = z.object({
    query: z.string().describe('The search query (company name or SIRET).'),
});
export type SearchCompanyInput = z.infer<typeof SearchCompanyInputSchema>;

const CompanySearchResultSchema = z.array(
    z.object({
        name: z.string().describe("The company's name."),
        siret: z.string().describe("The company's SIRET number."),
        address: z.string().describe("The company's full address."),
        legalStatus: z.string().optional().describe("The company's legal status."),
        shareCapital: z.number().optional().describe("The company's share capital."),
        director: z.string().optional().describe("The name of the main director."),
        directorQuality: z.string().optional().describe("The role or quality of the main director."),
    })
);
export type CompanySearchResult = z.infer<typeof CompanySearchResultSchema>;

export async function searchCompany(input: SearchCompanyInput): Promise<CompanySearchResult> {
    try {
        const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(input.query)}&per_page=5`);
        if (!response.ok) {
            console.error(`API error: ${response.statusText}`);
            return [];
        }
        const data = await response.json();
        
        const results = data.results.map((company: any) => {
            const dirigeant = company.dirigeants?.[0];
            let directorName = 'N/A';
            if (dirigeant) {
                const parts = [dirigeant.prenoms, dirigeant.nom].filter(Boolean);
                directorName = parts.join(' ');
            }
            const directorQuality =
                dirigeant?.qualite ||
                dirigeant?.fonction ||
                dirigeant?.type_dirigeant ||
                '';
            
            return {
                name: company.nom_complet || 'N/A',
                siret: company.siege.siret || 'N/A',
                address: company.siege.adresse || 'N/A',
                legalStatus: resolveLegalStatus(company),
                shareCapital: company.capital_social,
                director: directorName,
                directorQuality,
            }
        });

        return results;
    } catch (error) {
        console.error('Failed to fetch company data:', error);
        return [];
    }
}
