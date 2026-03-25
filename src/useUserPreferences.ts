import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function useUserPreferences() {
  const prefs = useQuery(api.userPreferences.get);
  return {
    selectedLanguage: prefs?.selectedLanguage ?? "German",
    userLanguages: prefs?.userLanguages ?? [],
    dailyGoal: prefs?.dailyGoal ?? 8,
    catLives: prefs?.catLives ?? 9,
    isLoading: prefs === undefined,
  };
}
