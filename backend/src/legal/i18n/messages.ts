import {
  SUPPORTED_EMAIL_LOCALES,
  SupportedEmailLocale,
} from "../../email/i18n/locales";

export type LegalConfigTranslationKey =
  | "imprintText"
  | "imprintUrl"
  | "privacyPolicyText"
  | "privacyPolicyUrl";

const defaultImprintText: Record<SupportedEmailLocale, string> = {
  "en-US": `## Imprint (Switzerland)

Information according to Art. 3 para. 1 lit. s UWG:

- Company: [Company Name]
- Address: [Street, ZIP, City], Switzerland
- Email: [legal@example.com]
- Phone: [optional]
- Commercial register no.: [optional]
- VAT no. (CHE-...): [optional]

Responsible for content:
[Name, Function]

Applicable law and jurisdiction:
Switzerland.`,
  "de-DE": `## Impressum (Schweiz)

Angaben gemaess Art. 3 Abs. 1 lit. s UWG:

- Firma: [Firmenname]
- Adresse: [Strasse, PLZ, Ort], Schweiz
- E-Mail: [legal@example.com]
- Telefon: [optional]
- Handelsregister-Nr.: [optional]
- UID (CHE-...): [optional]

Verantwortlich fuer den Inhalt:
[Name, Funktion]

Anwendbares Recht und Gerichtsstand:
Schweiz.`,
  "fr-FR": `## Mentions legales (Suisse)

Informations selon l'art. 3 al. 1 let. s LCD:

- Societe: [Nom de la societe]
- Adresse: [Rue, NPA, Ville], Suisse
- E-mail: [legal@example.com]
- Telephone: [optionnel]
- No du registre du commerce: [optionnel]
- No TVA (CHE-...): [optionnel]

Responsable du contenu:
[Nom, Fonction]

Droit applicable et for:
Suisse.`,
  "es-ES": `## Aviso legal (Suiza)

Informacion segun el art. 3 apdo. 1 letra s de la UWG suiza:

- Empresa: [Nombre de la empresa]
- Direccion: [Calle, CP, Ciudad], Suiza
- Correo: [legal@example.com]
- Telefono: [opcional]
- Nro. registro mercantil: [opcional]
- Nro. IVA (CHE-...): [opcional]

Responsable del contenido:
[Nombre, Cargo]

Ley aplicable y fuero:
Suiza.`,
  "it-IT": `## Note legali (Svizzera)

Informazioni ai sensi dell'art. 3 cpv. 1 lett. s LCSI:

- Societa: [Nome societa]
- Indirizzo: [Via, CAP, Citta], Svizzera
- Email: [legal@example.com]
- Telefono: [opzionale]
- N. registro di commercio: [opzionale]
- N. IVA (CHE-...): [opzionale]

Responsabile dei contenuti:
[Nome, Ruolo]

Legge applicabile e foro competente:
Svizzera.`,
};

const defaultPrivacyPolicyText: Record<SupportedEmailLocale, string> = {
  "en-US": `## Privacy Policy (Switzerland)

We process personal data in accordance with the Swiss Federal Act on Data Protection (nFADP). If applicable, we also process data under the GDPR.

### Controller
- Controller: [Company Name]
- Address: [Street, ZIP, City], Switzerland
- Email: [privacy@example.com]

### Processed data
- Account data (username, email)
- Uploaded files and metadata (size, timestamps)
- Technical logs (IP, browser, system events)

### Purpose of processing
- Provide and secure the file sharing service
- Authenticate users and prevent abuse
- Fulfill legal obligations

### Disclosure
Data is disclosed only to processors required for operations (for example hosting, email delivery) and only on a lawful basis.

### Retention
Data is stored only as long as required for the stated purpose, legal obligations, or contract fulfillment.

### Your rights
You may request information, correction, deletion, restriction, data portability, and objection where legally applicable.

### Contact
For privacy requests, contact: [privacy@example.com]`,
  "de-DE": `## Datenschutzerklaerung (Schweiz)

Wir bearbeiten Personendaten gemaess dem schweizerischen Datenschutzgesetz (nDSG). Soweit anwendbar, bearbeiten wir Daten auch nach DSGVO.

### Verantwortliche Stelle
- Verantwortlich: [Firmenname]
- Adresse: [Strasse, PLZ, Ort], Schweiz
- E-Mail: [privacy@example.com]

### Bearbeitete Daten
- Kontodaten (Benutzername, E-Mail)
- Hochgeladene Dateien und Metadaten (Groesse, Zeitstempel)
- Technische Protokolle (IP, Browser, Systemereignisse)

### Zweck der Bearbeitung
- Bereitstellung und Absicherung des File-Sharing-Dienstes
- Benutzer-Authentifizierung und Missbrauchspraevention
- Erfuellung gesetzlicher Pflichten

### Weitergabe
Daten werden nur an erforderliche Auftragsbearbeiter weitergegeben (z. B. Hosting, E-Mail-Versand) und nur auf rechtlicher Grundlage.

### Aufbewahrung
Daten werden nur so lange gespeichert, wie es fuer Zweck, Vertrag oder gesetzliche Pflichten erforderlich ist.

### Ihre Rechte
Sie koennen Auskunft, Berichtigung, Loeschung, Einschraenkung, Datenherausgabe und Widerspruch im gesetzlich zulaessigen Rahmen verlangen.

### Kontakt
Datenschutzanfragen an: [privacy@example.com]`,
  "fr-FR": `## Politique de confidentialite (Suisse)

Nous traitons les donnees personnelles conformement a la loi federale suisse sur la protection des donnees (nLPD). Si applicable, nous appliquons aussi le RGPD.

### Responsable du traitement
- Responsable: [Nom de la societe]
- Adresse: [Rue, NPA, Ville], Suisse
- E-mail: [privacy@example.com]

### Donnees traitees
- Donnees de compte (nom d'utilisateur, e-mail)
- Fichiers televerses et metadonnees (taille, horodatage)
- Journaux techniques (IP, navigateur, evenements systeme)

### Finalites
- Fournir et securiser le service de partage de fichiers
- Authentifier les utilisateurs et prevenir les abus
- Respecter les obligations legales

### Transmission
Les donnees sont transmises uniquement a des sous-traitants necessaires (p. ex. hebergement, envoi d'e-mails) sur une base legale.

### Conservation
Les donnees sont conservees uniquement pendant la duree necessaire aux finalites, obligations legales et contractuelles.

### Vos droits
Vous pouvez demander l'acces, la rectification, la suppression, la limitation, la portabilite et l'opposition dans le cadre legal applicable.

### Contact
Demandes de confidentialite: [privacy@example.com]`,
  "es-ES": `## Politica de privacidad (Suiza)

Tratamos datos personales de acuerdo con la Ley Federal Suiza de Proteccion de Datos (nFADP). Cuando aplica, tambien tratamos datos segun el RGPD.

### Responsable del tratamiento
- Responsable: [Nombre de la empresa]
- Direccion: [Calle, CP, Ciudad], Suiza
- Correo: [privacy@example.com]

### Datos tratados
- Datos de cuenta (usuario, correo)
- Archivos subidos y metadatos (tamano, marcas de tiempo)
- Registros tecnicos (IP, navegador, eventos del sistema)

### Finalidad
- Proveer y proteger el servicio de comparticion de archivos
- Autenticar usuarios y prevenir abusos
- Cumplir obligaciones legales

### Cesiones
Los datos solo se comparten con encargados necesarios para operar el servicio (por ejemplo hosting, envio de correo) y sobre base legal.

### Conservacion
Los datos se conservan solo el tiempo necesario para la finalidad indicada, obligaciones legales o cumplimiento contractual.

### Derechos
Puede solicitar acceso, rectificacion, supresion, limitacion, portabilidad y oposicion cuando sea legalmente aplicable.

### Contacto
Solicitudes de privacidad: [privacy@example.com]`,
  "it-IT": `## Informativa sulla privacy (Svizzera)

Trattiamo dati personali in conformita alla Legge federale svizzera sulla protezione dei dati (nLPD). Se applicabile, trattiamo i dati anche ai sensi del GDPR.

### Titolare del trattamento
- Titolare: [Nome societa]
- Indirizzo: [Via, CAP, Citta], Svizzera
- Email: [privacy@example.com]

### Dati trattati
- Dati account (nome utente, email)
- File caricati e metadati (dimensione, timestamp)
- Log tecnici (IP, browser, eventi di sistema)

### Finalita
- Fornire e proteggere il servizio di condivisione file
- Autenticare utenti e prevenire abusi
- Adempiere obblighi legali

### Comunicazione
I dati vengono comunicati solo a responsabili necessari all'operativita (ad es. hosting, invio email) e solo su base legale.

### Conservazione
I dati vengono conservati solo per il tempo necessario alle finalita indicate, agli obblighi legali o contrattuali.

### Diritti
E possibile richiedere accesso, rettifica, cancellazione, limitazione, portabilita e opposizione nei limiti previsti dalla legge.

### Contatto
Richieste privacy: [privacy@example.com]`,
};

export function buildDefaultLegalConfigTranslations(): Record<
  LegalConfigTranslationKey,
  Record<SupportedEmailLocale, string>
> {
  const imprintUrl = {} as Record<SupportedEmailLocale, string>;
  const privacyPolicyUrl = {} as Record<SupportedEmailLocale, string>;

  for (const locale of SUPPORTED_EMAIL_LOCALES) {
    imprintUrl[locale] = "";
    privacyPolicyUrl[locale] = "";
  }

  return {
    imprintText: defaultImprintText,
    imprintUrl,
    privacyPolicyText: defaultPrivacyPolicyText,
    privacyPolicyUrl,
  };
}
