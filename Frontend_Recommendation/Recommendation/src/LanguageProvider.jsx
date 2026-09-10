import React, { createContext, useState } from "react";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import mr from "./locales/mr.json";

// import other languages similarly

const languages = { en, hi, mr }; // map codes to JSON

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [languageCode, setLanguageCode] = useState("en"); // default language

  // function to fetch translated text
  const t = (key) => {
    return languages[languageCode][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ languageCode, setLanguageCode, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
