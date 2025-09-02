import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Charger les polices pour un rendu professionnel
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf", fontWeight: 300 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf", fontWeight: 500 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    position: "relative",
    fontSize: 10,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
    color: "#333333",
  },
  header: {
    position: "absolute",
    top: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1a5276",
    borderBottomStyle: "solid",
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1a5276",
    textTransform: "uppercase",
  },
  logo: {
    width: 80,
    height: 40,
    marginBottom: 10,
  },
  watermark: {
    position: "absolute",
    fontSize: 80,
    color: "rgba(26, 82, 118, 0.08)",
    top: "40%",
    left: "20%",
    transform: "rotate(-45deg)",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#666666",
    textAlign: "center",
    lineHeight: 1.3,
    borderTopWidth: 0.5,
    borderTopColor: "#cccccc",
    borderTopStyle: "solid",
    paddingTop: 8,
  },
  section: {
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1a5276",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#2c3e50",
    marginBottom: 6,
    marginTop: 4,
  },
  bold: {
    fontWeight: 700,
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    textDecoration: "underline",
  },
  signatureContainer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signatureBox: {
    width: 180,
    height: 80,
    borderWidth: 0.5,
    borderColor: "#444444",
    borderStyle: "dashed",
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 9,
    marginBottom: 4,
    fontWeight: 600,
    color: "#2c3e50",
  },
  noSignatureText: {
    color: "#e74c3c",
    fontSize: 9,
    fontStyle: "italic",
  },
  optionContainer: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#3498db",
    borderLeftStyle: "solid",
  },
  selectedOption: {
    backgroundColor: "#e8f4fd",
    borderLeftColor: "#2e86c1",
  },
  optionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
    color: "#2c3e50",
  },
  checkedOption: {
    color: "#2e86c1",
  },
  featureList: {
    marginLeft: 10,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 9,
    color: "#555555",
  },
  priceText: {
    fontWeight: 700,
    marginTop: 4,
    fontSize: 9,
    color: "#27ae60",
  },
  discountText: {
    color: "#27ae60",
    fontSize: 9,
    marginTop: 2,
    fontStyle: "italic",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bulletPoint: {
    width: 10,
    fontSize: 9,
  },
  listText: {
    flex: 1,
    fontSize: 9,
  },
  divider: {
    height: 1,
    backgroundColor: "#dddddd",
    marginVertical: 10,
  },
  infoBox: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#dddddd",
    borderStyle: "solid",
    marginBottom: 12,
  },
  highlight: {
    backgroundColor: "#fff3cd",
    padding: 2,
    borderRadius: 2,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: 25,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#666666",
  },
  firstPageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
});

interface ContratDocumentProps {
  data: {
    nomEntreprise?: string;
    capitalSocial?: string;
    formeJuridique?: string;
    nom?: string;
    prenom?: string;
    fonctionRepresentant?: string;
    adresseComplete?: string;
    email?: string;
    telephone?: string;
    representantDomiciliataire?: string;
    frequencePaiement?: "mensuelle" | "annuelle";
    optionCourrier?: "classic" | "starter" | "business" | "premium" | "aucune";
    dateDebutContrat?: string;
    siren?: string;
    ancienGreffe?: string;
    adressePersonnelle?: string;
  };
  signatureDataURL: string | null;
}

const formuleDetails = {
  classic: {
    label: "Offre Classic",
    priceHT: 20,
    features: [
      "Retrait sur place uniquement",
      "Scan du courrier",
      "Réexpédition",
      "Notification email",
      "Suivi postal",
    ],
  },
  starter: {
    label: "Offre Starter",
    priceHT: 30,
    features: [
      "Scan uniquement, sans réexpédition",
      "Retrait sur place",
      "Scan du courrier",
      "Réexpédition",
      "Notification email",
      "Suivi postal",
      "Recommandé",
    ],
  },
  business: {
    label: "Offre Business",
    priceHT: 35,
    features: [
      "Scan + réexpédition mensuelle",
      "Retrait sur place",
      "Scan du courrier",
      "Réexpédition mensuelle",
      "Notification email",
      "Suivi postal",
    ],
  },
  premium: {
    label: "Offre Premium",
    priceHT: 40,
    features: [
      "Scan + réexpédition hebdomadaire",
      "Retrait sur place",
      "Scan du courrier",
      "Réexpédition hebdomadaire",
      "Notification email",
      "Suivi postal",
      "Paiement annuel est à -10%",
    ],
  },
  aucune: {
    label: "Aucune réexpédition du courrier",
    priceHT: 0,
    features: [
      "Incluse dans la redevance de domiciliation",
    ],
  },
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "XX/XX/XXXX";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return "XX/XX/XXXX";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2 
  }).format(amount);
};

const ContratDocument: React.FC<ContratDocumentProps> = ({ data, signatureDataURL }) => {
  const selectedOption = data.optionCourrier ?? "aucune";
  const formule = formuleDetails[selectedOption] || formuleDetails.aucune;
  const dateContrat = formatDate(data.dateDebutContrat);
  
  // Remplir les informations manquantes avec des valeurs par défaut
  const entrepriseInfo = {
    nom: data.nomEntreprise || "XXXXXXXX",
    capital: data.capitalSocial ? formatCurrency(Number(data.capitalSocial)) : "XXXXXX",
    forme: data.formeJuridique || "XXXXXXXX",
    siren: data.siren || "XXXXXX",
    greffe: data.ancienGreffe || "XXXXXX",
    representant: `${data.prenom || "XXXXX"} ${data.nom || "XXXXXXXX"}`,
    qualite: data.fonctionRepresentant || "Président",
    adresse: data.adressePersonnelle || data.adresseComplete || "XXXXXXXXXXXXXXXXXXXX",
    email: data.email || "XXXXXXXXXX",
    telephone: data.telephone || "+XX XXXXXXXX"
  };

  return (
    <Document>
      {/* Page 1 - Entête et parties */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.watermark}>CCS</Text>
        
        {/* Logo en haut à gauche */}
        <View style={styles.firstPageHeader}>
          <Image 
            style={styles.logo} 
            src="/logoccs.svg" 
          />
          <View>
            <Text style={styles.headerText}>CONSULTING CONSEIL SERVICES</Text>
            <Text style={styles.headerText}>CONTRAT DE DOMICILIATION</Text>
          </View>
        </View>

        <Text style={styles.title}>Entre les soussignés :</Text>

        <View style={styles.section}>
          <Text style={styles.subtitle}>La société CONSULTING CONSEIL SERVICES</Text>
          <Text>Société à Responsabilité Limitée, au capital de 100 000 €</Text>
          <Text>Siège social : 25 RUE EDMOND ROSTAND 94310 ORLY</Text>
          <Text>Immatriculée au RCS de Créteil sous le n° 830 278 644</Text>
          <Text>Agrément préfectoral de Val-de-Marne sous le n° AG/DOM/2024-06</Text>
          <Text>Représentée par M. Rabah MAHFOUF, agissant en qualité de Gérant.</Text>
          <Text style={styles.bold}>Ci-après désignée « le domiciliataire »</Text>
        </View>

        <Text style={styles.section}>D'une part,</Text>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Et</Text>
          <Text>La société <Text style={styles.bold}>{entrepriseInfo.nom}</Text></Text>
          <Text>{entrepriseInfo.forme} au capital de {entrepriseInfo.capital}</Text>
          <Text>Dont le siège social sera fixé chez CCS au 25 RUE EDMOND ROSTAND 94310 ORLY</Text>
          <Text>{entrepriseInfo.siren ? `Immatriculée sous le n° ${entrepriseInfo.siren}` : "En cours d'immatriculation"}{entrepriseInfo.greffe ? ` auprès du RCS de ${entrepriseInfo.greffe}` : ""}</Text>
          <Text>Représentée par : {entrepriseInfo.representant}</Text>
          <Text>Agissant en qualité de : {entrepriseInfo.qualite}</Text>
          <Text>Et demeurant : {entrepriseInfo.adresse}</Text>
          <Text>E-mail : {entrepriseInfo.email}</Text>
          <Text>Tél : {entrepriseInfo.telephone}</Text>
          <Text style={styles.bold}>Ci-après désignée « le domicilié »</Text>
        </View>

        <Text style={styles.section}>D'autre part</Text>
        <Text style={styles.section}>Ci-après ensemble désignées « les parties »</Text>

        <Text style={[styles.subtitle, {marginTop: 15}]}>APRES AVOIR RAPPELE QUE :</Text>
        
        <View style={styles.section}>
          <Text>
            Le domiciliataire CONSULTING CONSEIL SERVICES dispose d'un local à usage de bureaux situé à 
            25 RUE EDMOND ROSTAND 94310 ORLY qu'il exploite en vue de la prestation de services communs 
            aux entreprises.
          </Text>
          <Text style={{marginTop: 6}}>
            Ce local est d'une superficie de 57 m², situé au rez-de-chaussée à gauche dans l'immeuble sis 
            au 25 rue Edmond Rostand 94310 Orly composé de : 3 bureaux, un espace cuisine et des sanitaires.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.bold, {marginBottom: 4}]}>Le local comprend les équipements suivants :</Text>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Un bureau de réception et d'accueil</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Une ligne téléphonique fixe et internet</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Un appareil de photocopies</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Une pièce propre à assurer la confidentialité nécessaire</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Des casiers pour la distribution interne du courrier</Text>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          CONSULTING CONSEIL SERVICES - SARL au Capital de 100 000€ - RCS Créteil 830 278 644{"\n"}
          25, Rue Edmond Rostand 94310 Orly – www.consultingccs.fr – contact.ccs94@gmail.com{"\n"}
          Tel : +33 1 88 27 34 10 / Mob : +33 6 16 97 78 25
        </Text>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      {/* Page 2 - Articles 1 à 5 */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.watermark}>CCS</Text>
        
        <View style={styles.header}>
          <Text style={styles.headerText}>CONSULTING CONSEIL SERVICES</Text>
          <Text style={styles.headerText}>CONTRAT DE DOMICILIATION</Text>
        </View>

        <Text style={styles.title}>IL A ÉTÉ CONVENU CE QUI SUIT :</Text>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Article 1 - Objet</Text>
          <Text>
            Le présent contrat a pour objet la domiciliation du siège social de l'entreprise domiciliée
            conformément aux dispositions des articles R 123-167 à R 123-171 du Code de commerce
            relatifs à la domiciliation des entreprises.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Article 2 - Obligations du domiciliataire</Text>
          <Text>Le domiciliataire s'engage à :</Text>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Être immatriculé au Registre du Commerce et des Sociétés ou au Répertoire des Métiers</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Mettre à disposition des locaux permettant la réunion régulière des organes chargés de la direction, de l'administration ou de la surveillance de l'entreprise</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Informer le Greffe du Tribunal de commerce de Créteil de la cessation de domiciliation à l'expiration ou en cas de résiliation du contrat</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Article 2 bis - Conservation des documents comptables</Text>
          <Text>
            Le domicilié conserve tous ses livres, registres et documents comptables dans ses propres
            locaux ou systèmes de stockage.
          </Text>
          <Text style={{marginTop: 6}}>
            Le domiciliataire ne conserve pas ces documents et n'est pas responsable de leur sécurité ou
            de leur confidentialité.
          </Text>
          <Text style={{marginTop: 6}}>
            Le domicilié reste seul responsable de l'exactitude, de la mise à jour et de la conservation de
            ses documents conformément à la réglementation en vigueur (articles L123-22 et suivants du
            Code de commerce, 10 ans pour la comptabilité, 6 ans pour les documents fiscaux sauf
            dispositions spécifiques).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Article 3 - Obligations du domicilié</Text>
          <Text>
            Le domicilié s'engage à utiliser effectivement et exclusivement les locaux susvisés pour son
            siège social et à informer le domiciliataire de toute modification de son activité, de sa forme
            juridique, de son objet et de l'identité des personnes ayant le pouvoir de l'engager.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Article 4 - Mandat</Text>
          <Text>
            Le domicilié donne mandat au domiciliataire de recevoir, en son nom, toute notification.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Article 5 - Durée</Text>
          <Text>
            Le présent contrat est consenti pour une durée de 12 mois à compter du : {dateContrat}
          </Text>
          <Text style={{marginTop: 6}}>
            Il se renouvellera par tacite reconduction pour une durée de 12 mois, sauf dénonciation
            notifiée par l'une des parties par lettre recommandée avec demande d'avis de réception 2
            mois avant le terme fixé.
          </Text>
          <Text style={{marginTop: 6}}>
            Le présent contrat pourra également être résilié par anticipation, par l'une ou l'autre partie en
            cas de manquement par l'une des parties des obligations mises à sa charge par les présentes.
            Dans ce cas, la résiliation prendra effet de plein droit 30 jours après la réception d'une mise en
            demeure adressée, par lettre recommandée avec demande d'avis de réception, par la partie
            lésée à la partie défaillante и demeurée infructueuse.
          </Text>
          <Text style={{marginTop: 6}}>
            Lors de l'expiration du contrat ou en cas de résiliation, le domiciliataire devra informer le
            Greffe du Tribunal de commerce de Créteil de la cessation de la domiciliation.
          </Text>
        </View>

        <Text style={styles.footer} fixed>
          CONSULTING CONSEIL SERVICES - SARL au Capital de 100 000€ - RCS Créteil 830 278 644{"\n"}
          25, Rue Edmond Rostand 94310 Orly – www.consultingccs.fr – contact.ccs94@gmail.com{"\n"}
          Tel : +33 1 88 27 34 10 / Mob : +33 6 16 97 78 25
        </Text>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      {/* Page 3 - Articles 6 et formule choisie */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.watermark}>CCS</Text>
        
        <View style={styles.header}>
          <Text style={styles.headerText}>CONSULTING CONSEIL SERVICES</Text>
          <Text style={styles.headerText}>CONTRAT DE DOMICILIATION</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Article 6 - Redevance</Text>
          <Text>
            Les tarifs et prestations proposés par la société CONSULTING CONSEIL SERVICES, et que
            le domicilié accepte, sont les suivants :
          </Text>
          <Text style={{marginTop: 6}}>
            Le présent contrat est consenti moyennant une redevance annuelle de 240 € HT, soit
            288 € TTC payable d'avance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Formule de réexpédition du courrier :</Text>
          <Text style={{marginBottom: 8, fontStyle: "italic"}}>
            La formule suivante a été sélectionnée :
          </Text>
          
          <View style={[styles.optionContainer, styles.selectedOption]}>
            <Text style={[styles.optionTitle, styles.checkedOption]}>
              ☑ {formule.label}
            </Text>
            
            <View style={styles.featureList}>
              {formule.features.map((feat, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>
            
            <Text style={styles.priceText}>
              {data.frequencePaiement === "annuelle"
                ? `Prix annuel : ${formatCurrency(formule.priceHT * 12 * 0.9)} HT (${formatCurrency(formule.priceHT * 12 * 0.9 * 1.2)} TTC)`
                : `Prix mensuel : ${formatCurrency(formule.priceHT)} HT (${formatCurrency(formule.priceHT * 1.2)} TTC)`}
            </Text>
            
            {data.frequencePaiement === "annuelle" && (
              <Text style={styles.discountText}>
                Économie de 10% avec le paiement annuel
              </Text>
            )}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.bold, {marginBottom: 4}]}>Conditions de réexpédition :</Text>
          <Text style={styles.featureText}>
            La réexpédition quotidienne est limitée à 40 courriers ({'<'}20g) par mois.
            Tout courrier envoyé en sus serait facturé au tarif de 0,75 € en plus des frais postaux en vigueur.
          </Text>
          <Text style={[styles.featureText, {marginTop: 4}]}>
            La facture de l'affranchissement pour les réexpéditions se fera trimestriellement et sera jointe à votre facture de fin de mois.
          </Text>
          <Text style={[styles.featureText, {marginTop: 4}]}>
            La réexpédition postale s'effectue à l'adresse indiquée par le domicilié.
          </Text>
        </View>

        <Text style={styles.footer} fixed>
          CONSULTING CONSEIL SERVICES - SARL au Capital de 100 000€ - RCS Créteil 830 278 644{"\n"}
          25, Rue Edmond Rostand 94310 Orly – www.consultingccs.fr – contact.ccs94@gmail.com{"\n"}
          Tel : +33 1 88 27 34 10 / Mob : +33 6 16 97 78 25
        </Text>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      {/* Page 4 - Articles 6 bis à 8 */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.watermark}>CCS</Text>
        
        <View style={styles.header}>
          <Text style={styles.headerText}>CONSULTING CONSEIL SERVICES</Text>
          <Text style={styles.headerText}>CONTRAT DE DOMICILIATION</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Article 6 bis - Récupération du courrier et paiement des redevances</Text>
          
          <Text style={[styles.bold, {marginBottom: 4}]}>Récupération du courrier</Text>
          <Text>
            Le domicilié s'engage à récupérer régulièrement son courrier au sein des locaux du
            domiciliataire ou à organiser sa réexpédition selon la formule choisie.
          </Text>
          <Text style={{marginTop: 6}}>
            Tout courrier non récupéré pendant 3 mois sera renvoyé à l'expéditeur, à la charge du
            domicilié.
          </Text>
          
          <Text style={[styles.bold, {marginTop: 12, marginBottom: 4}]}>Paiement des redevances</Text>
          <Text>
            Le domicilié s'engage à régler la redevance annuelle ou mensuelle prévue à l'article 6, ainsi
            que les frais liés à la réexpédition ou au traitement du courrier, avant l'échéance prévue.
          </Text>
          <Text style={{marginTop: 6}}>
            En cas de non-paiement, le domiciliataire pourra :
          </Text>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Suspendre l'accès au courrier et aux services liés à la domiciliation</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Appliquer des pénalités de retard conformément à la législation en vigueur</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Résilier le contrat après mise en demeure restée infructueuse pendant 30 jours</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Article 7 - Pièces justificatives</Text>
          <Text>
            Le domicilié s'engage à communiquer à Consulting Conseil Services, lors de la signature du
            présent contrat, les pièces suivantes :
          </Text>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Une attestation de sa situation d'auto-entrepreneur</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Un Kbis si sa société est déjà immatriculée</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Une copie d'attestation de parution au Journal Officiel si sa société est en cours de création</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>La copie de sa pièce d'identité</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Un justificatif de domicile</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>Une procuration postale dûment remplie et signée</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Article 8 - Dépôt de garantie</Text>
          <Text>
            Le domicilié verse, au moment de la signature du présent contrat, la somme de soixante-
            quinze euros (75 €) à titre de dépôt de garantie.
          </Text>
          <Text style={{marginTop: 6}}>
            À la fin du contrat, ce dépôt de garantie sera remboursé déduction faite des sommes
            éventuellement dues au domiciliataire. Il ne dispense pas le domicilié d'acquitter les loyers
            jusqu'au terme prévu.
          </Text>
        </View>

        <Text style={styles.footer} fixed>
          CONSULTING CONSEIL SERVICES - SARL au Capital de 100 000€ - RCS Créteil 830 278 644{"\n"}
          25, Rue Edmond Rostand 94310 Orly – www.consultingccs.fr – contact.ccs94@gmail.com{"\n"}
          Tel : +33 1 88 27 34 10 / Mob : +33 6 16 97 78 25
        </Text>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      {/* Page 5 - Articles 9 à 10 et signatures */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.watermark}>CCS</Text>
        
        <View style={styles.header}>
          <Text style={styles.headerText}>CONSULTING CONSEIL SERVICES</Text>
          <Text style={styles.headerText}>CONTRAT DE DOMICILIATION</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Article 9 - Attribution de juridiction</Text>
          <Text>
            Tout litige survenant entre les parties, relatif à l'exécution du présent contrat sera porté devant
            le tribunal de commerce de Créteil.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Article 10 - Signature</Text>
          <Text>
            Le contrat doit être établi en deux exemplaires originaux, dont l'un doit être remis au
            Domicilié. Il est impératif que le nom du signataire, sa signature et le cachet de la société
            CONSULTING CONSEIL SERVICES soient présents sur chaque exemplaire, à l'exception
            des contrats validés avec une signature électronique.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.italic}>
            Fait à Orly, le {dateContrat}
          </Text>
          <Text style={styles.italic}>
            En 02 exemplaires.
          </Text>
        </View>

        <View style={styles.signatureContainer}>
          <View>
            <Text style={styles.signatureLabel}>Le domiciliataire</Text>
            <Text style={{fontSize: 9, marginBottom: 15}}>{data.representantDomiciliataire || "M. Rabah MAHFOUF"}</Text>
            <View style={styles.signatureBox}></View>
            <Text style={{fontSize: 8, marginTop: 4}}>Cachet et signature</Text>
          </View>

          <View>
            <Text style={styles.signatureLabel}>Le domicilié</Text>
            <Text style={{fontSize: 9, marginBottom: 15}}>{data.prenom || "XXXXX"} {data.nom || "XXXXXXXX"}</Text>
            {signatureDataURL ? (
              <Image style={styles.signatureBox} src={signatureDataURL} />
            ) : (
              <View style={styles.signatureBox}>
                <Text style={styles.noSignatureText}>Signature non fournie</Text>
              </View>
            )}
            <Text style={{fontSize: 8, marginTop: 4, textAlign: "center"}}>
              Précédé de la mention manuscrite "Lu et approuvé"
            </Text>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          CONSULTING CONSEIL SERVICES - SARL au Capital de 100 000€ - RCS Créteil 830 278 644{"\n"}
          25, Rue Edmond Rostand 94310 Orly – www.consultingccs.fr – contact.ccs94@gmail.com{"\n"}
          Tel : +33 1 88 27 34 10 / Mob : +33 6 16 97 78 25
        </Text>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default ContratDocument;