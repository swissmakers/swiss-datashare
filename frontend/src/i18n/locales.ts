import german from "./translations/de-DE";
import english from "./translations/en-US";
import spanish from "./translations/es-ES";
import french from "./translations/fr-FR";
import italian from "./translations/it-IT";

export const LOCALES = {
  ENGLISH: {
    name: "English",
    code: "en-US",
    messages: english,
  },
  GERMAN: {
    name: "Deutsch",
    code: "de-DE",
    messages: german,
  },
  FRENCH: {
    name: "Français",
    code: "fr-FR",
    messages: french,
  },
  SPANISH: {
    name: "Español",
    code: "es-ES",
    messages: spanish,
  },
  ITALIAN: {
    name: "Italiano",
    code: "it-IT",
    messages: italian,
  },
};
