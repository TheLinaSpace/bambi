import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const user = await ctx.db.get(userId);
    const startedAt = user?._creationTime ?? Date.now();
    if (!prefs) {
      return { selectedLanguage: "German", userLanguages: [], dailyGoal: 8, catLives: 9, catLivesDate: null, startedAt };
    }
    // Reset lives if it's a new day
    const today = new Date().toISOString().split("T")[0];
    const catLives = prefs.catLivesDate !== today ? 9 : (prefs.catLives ?? 9);
    return { ...prefs, catLives, catLivesDate: prefs.catLivesDate ?? null, startedAt };
  },
});

export const setLanguage = mutation({
  args: { selectedLanguage: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (prefs) {
      const languages = prefs.userLanguages.includes(args.selectedLanguage)
        ? prefs.userLanguages
        : [...prefs.userLanguages, args.selectedLanguage];
      await ctx.db.patch(prefs._id, {
        selectedLanguage: args.selectedLanguage,
        userLanguages: languages,
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId,
        selectedLanguage: args.selectedLanguage,
        userLanguages: [args.selectedLanguage],
        dailyGoal: 8,
      });
    }
  },
});

export const loseLife = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const today = new Date().toISOString().split("T")[0];
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (prefs) {
      const lives = prefs.catLivesDate !== today ? 8 : Math.max(0, (prefs.catLives ?? 9) - 1);
      await ctx.db.patch(prefs._id, { catLives: lives, catLivesDate: today });
      return lives;
    } else {
      await ctx.db.insert("userPreferences", {
        userId,
        selectedLanguage: "German",
        userLanguages: [],
        dailyGoal: 8,
        catLives: 8,
        catLivesDate: today,
      });
      return 8;
    }
  },
});

export const setGoal = mutation({
  args: { dailyGoal: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (prefs) {
      await ctx.db.patch(prefs._id, { dailyGoal: args.dailyGoal });
    } else {
      await ctx.db.insert("userPreferences", {
        userId,
        selectedLanguage: "German",
        userLanguages: [],
        dailyGoal: args.dailyGoal,
      });
    }
  },
});
