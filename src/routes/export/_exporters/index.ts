import type { FuzzyDate } from "$lib/anilist";

export { createMyAnimeListExport } from "./myanimelist";
export { createCSVExport } from "./csv";

export function formatDate(date?: FuzzyDate): string {
	return `${date?.year || "0000"}-${date?.month || "00"}-${date?.day || "00"}`;
}