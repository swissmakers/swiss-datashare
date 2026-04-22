import {
  normalizeEmailLocale,
  SUPPORTED_EMAIL_LOCALES,
  SupportedEmailLocale,
} from "./locales";

type MailSection = {
  subject: string;
  preheader: string;
  title: string;
  intro: string;
  actionLabel: string;
};

export type EmailCopy = {
  labels: {
    sender: string;
    senderEmail: string;
    availability: string;
    message: string;
    accountEmail: string;
    temporaryPassword: string;
  };
  common: {
    someone: string;
    noEmail: string;
    noDescription: string;
    noNote: string;
    neverExpires: string;
    securityNotice: string;
    footerPrefix: string;
  };
  shareRecipients: MailSection & {
    intro: string;
    availabilityLine: string;
    messageLine: string;
  };
  reverseShare: MailSection & {
    messageLine: string;
  };
  resetPassword: MailSection & {
    intro: string;
  };
  invite: MailSection & {
    intro: string;
    credentialsLine: string;
  };
  testMail: MailSection & {
    intro: string;
  };
};

const emailMessages: Record<SupportedEmailLocale, EmailCopy> = {
  "en-US": {
    labels: {
      sender: "Sender",
      senderEmail: "Sender Email",
      availability: "Availability",
      message: "Message",
      accountEmail: "Account Email",
      temporaryPassword: "Temporary Password",
    },
    common: {
      someone: "Someone",
      noEmail: "Not provided",
      noDescription: "No message provided.",
      noNote: "No note provided.",
      neverExpires: "Never",
      securityNotice:
        "This email was sent automatically by {appName}. If you are not the intended recipient, please delete this email immediately and do not share or act on its contents.",
      footerPrefix: "Powered by",
    },
    shareRecipients: {
      subject: "{appName}: Someone shared files with you.",
      preheader: "Open the secure link to view and download your files.",
      title: "You have received shared files.",
      intro: "{creator} ({creatorEmail}) has shared files with you.",
      actionLabel: "Open shared files",
      availabilityLine: "This link expires on {expires}.",
      messageLine: "Message from sender: {description}",
    },
    reverseShare: {
      subject: "{appName}: Someone uploaded files via your link.",
      preheader: "A new upload was submitted through your shared upload link.",
      title: "New files are waiting for you.",
      intro: "Someone used your upload link and submitted files for you to review.",
      actionLabel: "Review uploaded files",
      messageLine: "Message from uploader: {note}",
    },
    resetPassword: {
      subject: "Reset your {appName} password",
      preheader: "Use the secure link below to reset your password.",
      title: "Password reset requested",
      intro: "Click the button below to reset your password. This link expires in one hour.",
      actionLabel: "Reset password",
    },
    invite: {
      subject: "You have been invited to {appName}",
      preheader: "Sign in with your temporary credentials to get started.",
      title: "You are invited",
      intro: "An administrator has invited you to {appName}. Use the temporary credentials below to sign in.",
      actionLabel: "Sign in now",
      credentialsLine: "Sign in with email {email} and temporary password {password}.",
    },
    testMail: {
      subject: "{appName}: Email configuration test",
      preheader: "Your SMTP configuration is working correctly.",
      title: "Email setup successful",
      intro: "This is a test email from {appName}, confirming that your SMTP configuration is set up correctly.",
      actionLabel: "Open application",
    },
  },

  "de-DE": {
    labels: {
      sender: "Absender",
      senderEmail: "Absender-E-Mail",
      availability: "Verfügbarkeit",
      message: "Nachricht",
      accountEmail: "Konto-E-Mail",
      temporaryPassword: "Temporäres Passwort",
    },
    common: {
      someone: "Jemand",
      noEmail: "Nicht angegeben",
      noDescription: "Keine Nachricht hinterlassen.",
      noNote: "Keine Notiz hinterlassen.",
      neverExpires: "Nie",
      securityNotice:
        "Diese E-Mail wurde automatisch von {appName} versendet. Falls Sie nicht der beabsichtigte Empfänger sind, löschen Sie diese E-Mail bitte umgehend und geben Sie deren Inhalt nicht weiter.",
      footerPrefix: "Bereitgestellt von",
    },
    shareRecipients: {
      subject: "{appName}: Jemand hat Dateien mit Ihnen geteilt.",
      preheader: "Öffnen Sie den sicheren Link, um Ihre Dateien anzuzeigen und herunterzuladen.",
      title: "Sie haben geteilte Dateien erhalten.",
      intro: "{creator} ({creatorEmail}) hat Dateien mit Ihnen geteilt.",
      actionLabel: "Geteilte Dateien öffnen",
      availabilityLine: "Dieser Link läuft ab am {expires}.",
      messageLine: "Nachricht des Absenders: {description}",
    },
    reverseShare: {
      subject: "{appName}: Jemand hat Dateien über Ihren Link hochgeladen.",
      preheader: "Ein neuer Upload wurde über Ihren geteilten Upload-Link eingereicht.",
      title: "Neue Dateien warten auf Sie.",
      intro: "Jemand hat Ihren Upload-Link verwendet und Dateien für Sie eingereicht.",
      actionLabel: "Hochgeladene Dateien ansehen",
      messageLine: "Nachricht des Uploaders: {note}",
    },
    resetPassword: {
      subject: "Ihr {appName}-Passwort zurücksetzen",
      preheader: "Verwenden Sie den sicheren Link, um Ihr Passwort zurückzusetzen.",
      title: "Passwort zurücksetzen",
      intro: "Klicken Sie auf die Schaltfläche unten, um Ihr Passwort zurückzusetzen. Dieser Link läuft in einer Stunde ab.",
      actionLabel: "Passwort zurücksetzen",
    },
    invite: {
      subject: "Sie wurden zu {appName} eingeladen",
      preheader: "Melden Sie sich mit Ihren temporären Zugangsdaten an.",
      title: "Sie sind eingeladen",
      intro: "Ein Administrator hat Sie zu {appName} eingeladen. Verwenden Sie die temporären Zugangsdaten unten, um sich anzumelden.",
      actionLabel: "Jetzt anmelden",
      credentialsLine: "Melden Sie sich mit der E-Mail {email} und dem temporären Passwort {password} an.",
    },
    testMail: {
      subject: "{appName}: E-Mail-Konfigurationstest",
      preheader: "Ihre SMTP-Konfiguration funktioniert korrekt.",
      title: "E-Mail-Einrichtung erfolgreich",
      intro: "Dies ist eine Test-E-Mail von {appName} und bestätigt, dass Ihre SMTP-Konfiguration korrekt eingerichtet ist.",
      actionLabel: "Anwendung öffnen",
    },
  },

  "fr-FR": {
    labels: {
      sender: "Expéditeur",
      senderEmail: "E-mail de l'expéditeur",
      availability: "Disponibilité",
      message: "Message",
      accountEmail: "E-mail du compte",
      temporaryPassword: "Mot de passe temporaire",
    },
    common: {
      someone: "Quelqu'un",
      noEmail: "Non renseigné",
      noDescription: "Aucun message fourni.",
      noNote: "Aucune note fournie.",
      neverExpires: "Jamais",
      securityNotice:
        "Cet e-mail a été envoyé automatiquement par {appName}. Si vous n'êtes pas le destinataire prévu, veuillez supprimer cet e-mail immédiatement et ne pas en divulguer ni en utiliser le contenu.",
      footerPrefix: "Propulsé par",
    },
    shareRecipients: {
      subject: "{appName} : Des fichiers ont été partagés avec vous.",
      preheader: "Ouvrez le lien sécurisé pour consulter et télécharger vos fichiers.",
      title: "Vous avez reçu des fichiers partagés.",
      intro: "{creator} ({creatorEmail}) a partagé des fichiers avec vous.",
      actionLabel: "Ouvrir les fichiers partagés",
      availabilityLine: "Ce lien expire le {expires}.",
      messageLine: "Message de l'expéditeur : {description}",
    },
    reverseShare: {
      subject: "{appName} : Quelqu'un a déposé des fichiers via votre lien.",
      preheader: "Un nouveau dépôt a été effectué via votre lien d'envoi partagé.",
      title: "De nouveaux fichiers vous attendent.",
      intro: "Quelqu'un a utilisé votre lien d'envoi et a déposé des fichiers à votre intention.",
      actionLabel: "Consulter les fichiers déposés",
      messageLine: "Message de l'expéditeur : {note}",
    },
    resetPassword: {
      subject: "Réinitialisation de votre mot de passe {appName}",
      preheader: "Utilisez le lien sécurisé ci-dessous pour réinitialiser votre mot de passe.",
      title: "Réinitialisation du mot de passe demandée",
      intro: "Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe. Ce lien expire dans une heure.",
      actionLabel: "Réinitialiser le mot de passe",
    },
    invite: {
      subject: "Vous avez été invité sur {appName}",
      preheader: "Connectez-vous avec vos identifiants temporaires pour commencer.",
      title: "Vous êtes invité",
      intro: "Un administrateur vous a invité sur {appName}. Utilisez les identifiants temporaires ci-dessous pour vous connecter.",
      actionLabel: "Se connecter maintenant",
      credentialsLine: "Connectez-vous avec l'e-mail {email} et le mot de passe temporaire {password}.",
    },
    testMail: {
      subject: "{appName} : Test de configuration e-mail",
      preheader: "Votre configuration SMTP fonctionne correctement.",
      title: "Configuration e-mail réussie",
      intro: "Ceci est un e-mail de test envoyé par {appName}, confirmant que votre configuration SMTP est correctement établie.",
      actionLabel: "Ouvrir l'application",
    },
  },

  "es-ES": {
    labels: {
      sender: "Remitente",
      senderEmail: "Correo del remitente",
      availability: "Disponibilidad",
      message: "Mensaje",
      accountEmail: "Correo de la cuenta",
      temporaryPassword: "Contraseña temporal",
    },
    common: {
      someone: "Alguien",
      noEmail: "No proporcionado",
      noDescription: "No se ha incluido ningún mensaje.",
      noNote: "No se ha incluido ninguna nota.",
      neverExpires: "Nunca",
      securityNotice:
        "Este correo fue enviado automáticamente por {appName}. Si usted no es el destinatario previsto, por favor elimínelo de inmediato y no comparta ni actúe sobre su contenido.",
      footerPrefix: "Desarrollado por",
    },
    shareRecipients: {
      subject: "{appName}: Alguien ha compartido archivos contigo.",
      preheader: "Abre el enlace seguro para ver y descargar tus archivos.",
      title: "Has recibido archivos compartidos.",
      intro: "{creator} ({creatorEmail}) ha compartido archivos contigo.",
      actionLabel: "Abrir archivos compartidos",
      availabilityLine: "Este enlace caduca el {expires}.",
      messageLine: "Mensaje del remitente: {description}",
    },
    reverseShare: {
      subject: "{appName}: Alguien ha subido archivos a través de tu enlace.",
      preheader: "Se ha completado una nueva subida a través de tu enlace compartido.",
      title: "Tienes nuevos archivos esperándote.",
      intro: "Alguien ha utilizado tu enlace de subida y ha enviado archivos para que los revises.",
      actionLabel: "Revisar archivos subidos",
      messageLine: "Mensaje del remitente: {note}",
    },
    resetPassword: {
      subject: "Restablece tu contraseña de {appName}",
      preheader: "Usa el enlace seguro a continuación para restablecer tu contraseña.",
      title: "Solicitud de restablecimiento de contraseña",
      intro: "Haz clic en el botón de abajo para restablecer tu contraseña. Este enlace caduca en una hora.",
      actionLabel: "Restablecer contraseña",
    },
    invite: {
      subject: "Has sido invitado a {appName}",
      preheader: "Inicia sesión con tus credenciales temporales para comenzar.",
      title: "Estás invitado",
      intro: "Un administrador te ha invitado a {appName}. Usa las credenciales temporales a continuación para iniciar sesión.",
      actionLabel: "Iniciar sesión ahora",
      credentialsLine: "Inicia sesión con el correo {email} y la contraseña temporal {password}.",
    },
    testMail: {
      subject: "{appName}: Prueba de configuración de correo",
      preheader: "Tu configuración SMTP funciona correctamente.",
      title: "Configuración de correo exitosa",
      intro: "Este es un correo de prueba de {appName}, que confirma que tu configuración SMTP está correctamente establecida.",
      actionLabel: "Abrir aplicación",
    },
  },

  "it-IT": {
    labels: {
      sender: "Mittente",
      senderEmail: "E-mail del mittente",
      availability: "Disponibilità",
      message: "Messaggio",
      accountEmail: "E-mail dell'account",
      temporaryPassword: "Password temporanea",
    },
    common: {
      someone: "Qualcuno",
      noEmail: "Non fornita",
      noDescription: "Nessun messaggio fornito.",
      noNote: "Nessuna nota fornita.",
      neverExpires: "Mai",
      securityNotice:
        "Questa e-mail è stata inviata automaticamente da {appName}. Se non sei il destinatario previsto, ti preghiamo di eliminarla immediatamente e di non condividerne né utilizzarne il contenuto.",
      footerPrefix: "Offerto da",
    },
    shareRecipients: {
      subject: "{appName}: Qualcuno ha condiviso dei file con te.",
      preheader: "Apri il link sicuro per visualizzare e scaricare i tuoi file.",
      title: "Hai ricevuto dei file condivisi.",
      intro: "{creator} ({creatorEmail}) ha condiviso dei file con te.",
      actionLabel: "Apri i file condivisi",
      availabilityLine: "Questo link scade il {expires}.",
      messageLine: "Messaggio del mittente: {description}",
    },
    reverseShare: {
      subject: "{appName}: Qualcuno ha caricato dei file tramite il tuo link.",
      preheader: "È stato effettuato un nuovo caricamento tramite il tuo link di upload condiviso.",
      title: "Nuovi file ti stanno aspettando.",
      intro: "Qualcuno ha utilizzato il tuo link di upload e ha inviato dei file per la tua revisione.",
      actionLabel: "Visualizza i file caricati",
      messageLine: "Messaggio del mittente: {note}",
    },
    resetPassword: {
      subject: "Reimposta la tua password di {appName}",
      preheader: "Usa il link sicuro qui sotto per reimpostare la tua password.",
      title: "Reimpostazione password richiesta",
      intro: "Clicca il pulsante qui sotto per reimpostare la tua password. Questo link scade tra un'ora.",
      actionLabel: "Reimposta password",
    },
    invite: {
      subject: "Sei stato invitato su {appName}",
      preheader: "Accedi con le tue credenziali temporanee per iniziare.",
      title: "Sei invitato",
      intro: "Un amministratore ti ha invitato su {appName}. Usa le credenziali temporanee qui sotto per accedere.",
      actionLabel: "Accedi ora",
      credentialsLine: "Accedi con l'e-mail {email} e la password temporanea {password}.",
    },
    testMail: {
      subject: "{appName}: Test di configurazione e-mail",
      preheader: "La tua configurazione SMTP funziona correttamente.",
      title: "Configurazione e-mail completata",
      intro: "Questa è un'e-mail di test di {appName}, che conferma che la tua configurazione SMTP è impostata correttamente.",
      actionLabel: "Apri l'applicazione",
    },
  },
};

type RecordString = Record<string, unknown>;

function flattenTranslationKeys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value == null) return [prefix];
  return Object.entries(value as RecordString).flatMap(([key, nested]) =>
    flattenTranslationKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

function extractPlaceholders(text: string): string[] {
  return [...text.matchAll(/\{([a-zA-Z0-9]+)\}/g)]
    .map((match) => match[1])
    .sort();
}

function validateEmailTranslations() {
  const base = emailMessages["en-US"];
  const baseKeys = flattenTranslationKeys(base).sort();

  for (const [locale, translation] of Object.entries(emailMessages)) {
    const translationKeys = flattenTranslationKeys(translation).sort();
    if (baseKeys.join("|") !== translationKeys.join("|")) {
      throw new Error(`Email translation keys mismatch for locale ${locale}`);
    }

    for (const key of baseKeys) {
      const baseValue = key
        .split(".")
        .reduce<unknown>((acc, path) => (acc as RecordString)[path], base);
      const translationValue = key
        .split(".")
        .reduce<unknown>(
          (acc, path) => (acc as RecordString)[path],
          translation as RecordString,
        );

      if (typeof baseValue !== "string" || typeof translationValue !== "string") {
        continue;
      }

      if (
        extractPlaceholders(baseValue).join("|") !==
        extractPlaceholders(translationValue).join("|")
      ) {
        throw new Error(
          `Email placeholders mismatch for locale ${locale} at key ${key}`,
        );
      }
    }
  }
}

validateEmailTranslations();

export function getEmailCopy(locale?: string | null): EmailCopy {
  return emailMessages[normalizeEmailLocale(locale)];
}

export type EmailConfigTranslationKey =
  | "shareRecipientsSubject"
  | "shareRecipientsMessage"
  | "reverseShareSubject"
  | "reverseShareMessage"
  | "resetPasswordSubject"
  | "resetPasswordMessage"
  | "inviteSubject"
  | "inviteMessage";

export function buildDefaultEmailConfigTranslations(): Record<
  EmailConfigTranslationKey,
  Record<SupportedEmailLocale, string>
> {
  const defaults = {
    shareRecipientsSubject: {} as Record<SupportedEmailLocale, string>,
    shareRecipientsMessage: {} as Record<SupportedEmailLocale, string>,
    reverseShareSubject: {} as Record<SupportedEmailLocale, string>,
    reverseShareMessage: {} as Record<SupportedEmailLocale, string>,
    resetPasswordSubject: {} as Record<SupportedEmailLocale, string>,
    resetPasswordMessage: {} as Record<SupportedEmailLocale, string>,
    inviteSubject: {} as Record<SupportedEmailLocale, string>,
    inviteMessage: {} as Record<SupportedEmailLocale, string>,
  };

  for (const locale of SUPPORTED_EMAIL_LOCALES) {
    const copy = getEmailCopy(locale);
    defaults.shareRecipientsSubject[locale] = copy.shareRecipients.subject;
    defaults.shareRecipientsMessage[locale] = [
      copy.shareRecipients.intro,
      copy.shareRecipients.availabilityLine,
      copy.shareRecipients.messageLine,
    ].join("\n\n");
    defaults.reverseShareSubject[locale] = copy.reverseShare.subject;
    defaults.reverseShareMessage[locale] = [
      copy.reverseShare.intro,
      copy.reverseShare.messageLine,
    ].join("\n\n");
    defaults.resetPasswordSubject[locale] = copy.resetPassword.subject;
    defaults.resetPasswordMessage[locale] = `${copy.resetPassword.intro}\n\n{url}`;
    defaults.inviteSubject[locale] = copy.invite.subject;
    defaults.inviteMessage[locale] = [
      copy.invite.intro,
      copy.invite.credentialsLine,
      "{url}",
    ].join("\n\n");
  }

  return defaults;
}
