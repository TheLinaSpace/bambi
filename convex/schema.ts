import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    nativeLanguage: v.string(),
    targetLanguage: v.string(),
  }),
  lessons: defineTable({
    title: v.string(),
    language: v.string(),
    level: v.string(),
    content: v.string(),
  }),
  progress: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    completed: v.boolean(),
    score: v.optional(v.number()),
  }),
  words: defineTable({
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
  }).index("by_word_and_language", ["word", "language"]),
  dailyWords: defineTable({
    word: v.string(),
    language: v.string(),
    date: v.string(),
  }).index("by_language_and_date", ["language", "date"]),
});
