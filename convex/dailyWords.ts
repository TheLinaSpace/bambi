import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByDate = query({
  args: { language: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.tokenIdentifier;
    return await ctx.db
      .query("dailyWords")
      .withIndex("by_user_language_date", (q) =>
        q.eq("userId", userId).eq("language", args.language).eq("date", args.date)
      )
      .collect();
  },
});

export const getByMonth = query({
  args: { language: v.string(), yearMonth: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.tokenIdentifier;
    const [year, month] = args.yearMonth.split("-").map(Number);
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
    return await ctx.db
      .query("dailyWords")
      .withIndex("by_user_language_date", (q) =>
        q.eq("userId", userId).eq("language", args.language).gte("date", startDate).lt("date", endDate)
      )
      .collect();
  },
});

export const addWord = mutation({
  args: { word: v.string(), language: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;
    return await ctx.db.insert("dailyWords", { ...args, userId });
  },
});

export const removeWord = mutation({
  args: { word: v.string(), language: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.tokenIdentifier;
    const entry = await ctx.db
      .query("dailyWords")
      .withIndex("by_user_language_date", (q) =>
        q.eq("userId", userId).eq("language", args.language).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("word"), args.word))
      .first();
    if (entry) {
      await ctx.db.delete(entry._id);
    }
  },
});
