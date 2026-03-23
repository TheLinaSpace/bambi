import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getWord = internalQuery({
  args: { word: v.string(), language: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("words")
      .withIndex("by_word_and_language", (q) =>
        q.eq("word", args.word).eq("language", args.language)
      )
      .unique();
  },
});

export const storeWord = internalMutation({
  args: {
    word: v.string(),
    language: v.string(),
    translation: v.string(),
    type: v.string(),
    example: v.string(),
    conjugation: v.optional(
      v.array(
        v.object({
          pronoun: v.string(),
          present: v.string(),
          past: v.string(),
        })
      )
    ),
    prepositions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          explanation: v.string(),
          example: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("words", args);
  },
});
