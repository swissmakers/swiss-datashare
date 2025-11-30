import { getCookie, setCookie } from "cookies-next";
import { useState } from "react";
import useTranslate from "../../hooks/useTranslate.hook";
import { LOCALES } from "../../i18n/locales";
import { Select } from "../ui";

const LanguagePicker = () => {
  const t = useTranslate();
  const [selectedLanguage, setSelectedLanguage] = useState(
    getCookie("language")?.toString(),
  );

  const languages = Object.values(LOCALES).map((locale) => ({
    value: locale.code,
    label: locale.name,
  }));

  return (
    <Select
      label={t("account.card.language.title")}
      helperText={t("account.card.language.description")}
      value={selectedLanguage}
      options={languages}
      onChange={(e) => {
        if (!e) return;
        const value = e.target.value;
        setSelectedLanguage(value);
        setCookie("language", value, {
          sameSite: "lax",
          expires: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1),
          ),
        });
        location.reload();
      }}
    />
  );
};

export default LanguagePicker;
