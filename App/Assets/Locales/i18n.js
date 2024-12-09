import I18n from "i18n-js";
import * as RNLocalize from "react-native-localize";

import en from './en';

const locales = RNLocalize.getLocales();
if (Array.isArray(locales)) {
  I18n.locale = locales[0].languageTag;
}
I18n.fallbacks = true;
I18n.translations = {
  en,
};

// The method we'll use instead of a regular string
export function strings(name, params = {}) {
  return I18n.t(name, params);
};

export default I18n;