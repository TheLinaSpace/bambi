import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByDate = query({
  args: { language: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyWords")
      .withIndex("by_language_and_date", (q) =>
        q.eq("language", args.language).eq("date", args.date)
      )
      .collect();
  },
});

export const addWord = mutation({
  args: { word: v.string(), language: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dailyWords", args);
  },
});
