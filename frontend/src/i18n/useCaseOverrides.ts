type Messages = Record<string, string>;

const lawyerOverridesByLocale: Record<string, Messages> = {
  "de-DE": {
    "home.title": "<h>Rechtssichere</h> Dokumentenfreigabe für Kanzleien und Mandate.",
    "home.description":
      "Dokumente sicher hochladen, einen vertraulichen Link erstellen und kontrolliert mit Mandanten oder Gegenparteien teilen.",
    "home.button.start": "Datenübertragung starten",
    "home.trust.title": "Warum Kanzleien diesem Dienst vertrauen",
    "home.trust.no-analysis.title": "Keine Inhaltsauswertung",
    "home.trust.no-analysis.description":
      "Inhalte bleiben vertraulich und werden nicht analysiert oder für Modelle genutzt.",
    "home.how.step2.title": "Vertraulichen Link erstellen",
    "home.how.step3.title": "Vertraulich teilen",
    "upload.title": "Sicherer Dokumenten-Upload",
    "common.button.share": "Vertraulichen Link erstellen",
    "account.shares.title": "Freigaben",
    "account.reverseShares.title": "Externe Anfragen",
    "admin.users.title": "Benutzerverwaltung",
    "admin.shares.title": "Dokumentenfreigaben",
  },
  "en-US": {
    "home.title": "<h>Legal-grade</h> document sharing for firms and matters.",
    "home.description":
      "Upload documents securely, create a confidential link, and share with clients or counterparties in a controlled way.",
    "home.button.start": "Start legal data exchange",
    "home.trust.title": "Why law firms trust this service",
    "home.trust.no-analysis.title": "No content analysis",
    "home.trust.no-analysis.description":
      "Content stays confidential and is never analyzed or used to train models.",
    "home.how.step2.title": "Share Data",
    "home.how.step3.title": "Share confidentially",
    "upload.title": "Share Data",
    "upload.reverse-share.title": "Upload requested documents",
    "upload.reverse-share.description":
      "Upload documents for this request. Add an optional note, then click \"Finish upload\".",
    "common.button.share": "Share Data",
    "account.shares.title": "Matter shares",
    "account.reverseShares.title": "Data Requests",
    "admin.users.title": "User administration",
    "admin.shares.title": "Document shares",
  },
  "fr-FR": {
    "home.title": "<h>Partage juridique sécurisé</h> pour cabinets et dossiers.",
    "home.description":
      "Téléversez des documents en toute sécurité, créez un lien confidentiel et partagez-le de manière contrôlée avec vos clients ou parties prenantes.",
    "home.button.start": "Démarrer un échange juridique",
    "home.trust.title": "Pourquoi les cabinets font confiance à ce service",
    "home.trust.no-analysis.title": "Aucune analyse du contenu",
    "home.trust.no-analysis.description":
      "Le contenu reste confidentiel et n'est ni analysé ni utilisé pour entraîner des modèles.",
    "home.how.step2.title": "Créer un lien confidentiel",
    "home.how.step3.title": "Partager de manière confidentielle",
    "upload.title": "Téléversement sécurisé de documents",
    "common.button.share": "Créer un lien confidentiel",
    "account.shares.title": "Partages de dossier",
    "account.reverseShares.title": "Demandes externes",
    "admin.users.title": "Administration des utilisateurs",
    "admin.shares.title": "Partages de documents",
  },
  "es-ES": {
    "home.title": "<h>Intercambio jurídico seguro</h> para despachos y casos.",
    "home.description":
      "Sube documentos de forma segura, crea un enlace confidencial y compártelo de manera controlada con clientes o contrapartes.",
    "home.button.start": "Iniciar intercambio legal",
    "home.trust.title": "Por qué los despachos confían en este servicio",
    "home.trust.no-analysis.title": "Sin análisis de contenido",
    "home.trust.no-analysis.description":
      "El contenido se mantiene confidencial y nunca se analiza ni se usa para entrenar modelos.",
    "home.how.step2.title": "Crear enlace confidencial",
    "home.how.step3.title": "Compartir de forma confidencial",
    "upload.title": "Carga segura de documentos",
    "common.button.share": "Crear enlace confidencial",
    "account.shares.title": "Compartidos del caso",
    "account.reverseShares.title": "Solicitudes externas",
    "admin.users.title": "Administración de usuarios",
    "admin.shares.title": "Compartidos de documentos",
  },
  "it-IT": {
    "home.title": "<h>Condivisione legale sicura</h> per studi e pratiche.",
    "home.description":
      "Carica documenti in modo sicuro, crea un link confidenziale e condividilo in modo controllato con clienti o controparti.",
    "home.button.start": "Avvia scambio legale",
    "home.trust.title": "Perché gli studi legali si fidano di questo servizio",
    "home.trust.no-analysis.title": "Nessuna analisi dei contenuti",
    "home.trust.no-analysis.description":
      "I contenuti restano confidenziali e non vengono analizzati né usati per addestrare modelli.",
    "home.how.step2.title": "Crea link confidenziale",
    "home.how.step3.title": "Condividi in modo confidenziale",
    "upload.title": "Caricamento sicuro documenti",
    "common.button.share": "Crea link confidenziale",
    "account.shares.title": "Condivisioni pratica",
    "account.reverseShares.title": "Richieste esterne",
    "admin.users.title": "Amministrazione utenti",
    "admin.shares.title": "Condivisioni documenti",
  },
};

export const mergeMessagesForUseCase = (
  localeCode: string,
  baseMessages: Messages,
  useCase: string,
) => {
  const useCases = useCase
    .toLowerCase()
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!useCases.includes("lawyer")) {
    return baseMessages;
  }
  return {
    ...baseMessages,
    ...(lawyerOverridesByLocale[localeCode] ?? {}),
  };
};

