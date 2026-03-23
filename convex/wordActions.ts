"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

export const generateWordDetails = action({
  args: { word: v.string(), language: v.string() },
  handler: async (ctx, args): Promise<{
    word: string;
    language: string;
    translation: string;
    type: string;
    example: string;
    conjugation?: { pronoun: string; present: string; past: string }[];
    prepositions?: { name: string; explanation: string; example: string }[];
  }> => {
    const existing = await ctx.runQuery(internal.words.getWord, {
      word: args.word,
      language: args.language,
    });

    if (existing) {
      return existing;
    }

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a language learning assistant. Given a word in ${args.language}, provide detailed information about it. Return ONLY valid JSON with this exact structure:

{
  "translation": "English translation",
  "type": "word type (e.g. Verben, Nomen, Adjektiv)",
  "example": "An example sentence using the word in ${args.language}",
  "conjugation": [
    {"pronoun": "Ich", "present": "...", "past": "..."},
    {"pronoun": "Du", "present": "...", "past": "..."},
    {"pronoun": "Er/sie/es", "present": "...", "past": "..."},
    {"pronoun": "wir", "present": "...", "past": "..."},
    {"pronoun": "ihr", "present": "...", "past": "..."},
    {"pronoun": "Sie", "present": "...", "past": "..."}
  ],
  "prepositions": [
    {"name": "Preposition (CASE)", "explanation": "When and how to use it", "example": "Example sentence"}
  ]
}

Rules:
- "conjugation" should only be included if the word is a verb. For nouns/adjectives, omit it or set to null.
- "prepositions" should list common prepositions used with this word, if any. Otherwise omit or set to null.
- Use the conventions of ${args.language} for pronouns and grammatical terms.
- The example sentence should be natural and useful for a learner.

The word is: "${args.word}"`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const data = JSON.parse(jsonMatch[0]);

    const wordData = {
      word: args.word,
      language: args.language,
      translation: data.translation || "...",
      type: data.type || "--",
      example: data.example || "...",
      conjugation: data.conjugation || undefined,
      prepositions: data.prepositions || undefined,
    };

    await ctx.runMutation(internal.words.storeWord, wordData);

    return wordData;
  },
});
