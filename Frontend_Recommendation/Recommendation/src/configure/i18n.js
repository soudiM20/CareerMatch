import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';
import bn from '../locales/bn.json';
import gu from '../locales/gu.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';
import or from '../locales/or.json';
import pa from '../locales/pa.json';
import ta from '../locales/ta.json';

// Fix (i18n-completeness audit): assets/Navbar.jsx's language dropdown
// lists 9 languages (English + 8 Indic languages), but only 3 of the 10
// locale files that actually exist under src/locales/ were ever registered
// here. Selecting any of the other 6 (Bengali, Gujarati, Kannada,
// Malayalam, Odia, Punjabi) silently fell back to English — the dropdown
// looked functional but 6 of its 9 options did nothing. All 10 files
// validate as well-formed JSON with the same 38 keys as en.json, so they're
// wired in rather than left unregistered.
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
      bn: { translation: bn },
      gu: { translation: gu },
      kn: { translation: kn },
      ml: { translation: ml },
      or: { translation: or },
      pa: { translation: pa },
      ta: { translation: ta },
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
