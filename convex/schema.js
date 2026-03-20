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
});
