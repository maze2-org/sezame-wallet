import en from "./en.json";
import { I18n } from "i18n-js";

const i18n = new I18n({en});
i18n.enableFallback = true;
i18n.translations = { en };
i18n.locale = "en"; // Langue par défaut

/**
 * Builds up valid keypaths for translations.
 * Update to your default locale of choice if not English.
 */
type DefaultLocale = typeof en;
export type TxKeyPath = keyof DefaultLocale; // Adaptation de la déclaration de TxKeyPath

export default i18n;