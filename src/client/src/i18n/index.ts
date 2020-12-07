import m from "mithril";
import * as logger from "../logger";
import type { Translation } from "./languages/en";

export type Language = keyof typeof languageMap;

const languageMap = {
	English: () => import("./languages/en"),
	"Serbian (Latin)": () => import("./languages/rsLatin"),
	"Serbian (Cyrillic)": () => import("./languages/rsCyrillic"),
};

let translation: Translation | null = null;
let currentLanguage: Language | null = null;

export async function setLanguage(language: Language): Promise<boolean> {
	try {
		translation = (await languageMap[language]()).translation;
		currentLanguage = language;
		m.redraw();
		return true;
	} catch (e) {
		logger.error(`Error loading language ${language}.`);
		return false;
	}
}

export function i18n<K extends keyof Translation>(key: K): Translation[K];
export function i18n(key: ""): "";
export function i18n<K extends keyof Translation>(
	key: K | "",
): "" | Translation[K] {
	if (!translation || key === "") {
		return "";
	}

	return translation[key];
}

export function i18nVar(key: string): string {
	if (!translation) {
		return PRODUCTION ? "" : "Not loaded.";
	}

	if (key === "") {
		return "";
	}

	if (!Number.isNaN(Number(key))) {
		return key;
	}

	if (key.includes("↓") || key.includes("↑")) {
		return key;
	}

	const value = translation[key as keyof Translation];
	if (value === undefined) {
		logger.error(`No entry for key "${key}" in language "${currentLanguage}".`);
		return "";
	}

	if (typeof value === "function") {
		logger.error(`Entry "${key}" is a function.`);
		return "";
	}

	return value;
}

export function getLanguage(): Language | null {
	return currentLanguage;
}

export function availableLanguages(): Language[] {
	return Object.keys(languageMap) as Language[];
}
