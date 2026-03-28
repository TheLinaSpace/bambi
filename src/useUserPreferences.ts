import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function useUserPreferences() {
  const prefs = useQuery(api.userPreferences.get);
  const startedAt = prefs?.startedAt ?? Date.now();
  const dayNumber = Math.floor((Date.now() - startedAt) / (1000 * 60 * 60 * 24)) + 1;
  return {
    selectedLanguage: prefs?.selectedLanguage ?? "German",
    userLanguages: prefs?.userLanguages ?? [],
    dailyGoal: prefs?.dailyGoal ?? 8,
    catLives: prefs?.catLives ?? 9,
    dayNumber,
    startedAt,
    isLoading: prefs === undefined,
  };
}
