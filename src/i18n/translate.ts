import i18n from "./i18n"; // Importez votre configuration i18n

/**
 * Translates text.
 *
 * @param key The i18n key.
 */
export function translate(key: any, options?: any) {
  return i18n.t(key, options);
}