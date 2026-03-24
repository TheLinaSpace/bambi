"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const wordDetailsSchema = {
  type: "object" as const,
  properties: {
    translation: { type: "string" as const, description: "English translation of the word" },
    type: { type: "string" as const, description: "Word type, e.g. Verben, Nomen, Adjektiv" },
    example: { type: "string" as const, description: "Example sentence using the word" },
    conjugation: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          pronoun: { type: "string" as const },
          present: { type: "string" as const },
          past: { type: "string" as const },
        },
        required: ["pronoun", "present", "past"],
      },
      description: "Verb conjugation table. Only for verbs, otherwise empty array.",
    },
    prepositions: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const, description: "Preposition with case, e.g. Mit (DAT)" },
          explanation: { type: "string" as const, description: "When and how to use it" },
          example: { type: "string" as const, description: "Example sentence" },
        },
        required: ["name", "explanation", "example"],
      },
      description: "Common prepositions used with this word. Empty array if none.",
    },
  },
  required: ["translation", "type", "example", "conjugation", "prepositions"],
};

const scanResultSchema = {
  type: "object" as const,
  properties: {
    words: {
      type: "array" as const,
      items: { type: "string" as const },
      description: "Array of words found in the image",
    },
  },
  required: ["words"],
};

function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });
}

export const scanWordsFromImage = action({
  args: { imageBase64: v.string(), language: v.string() },
  handler: async (_ctx, args): Promise<string[]> => {
    const client = getClient();

    const response = await client.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "scan_result",
          strict: true,
          schema: scanResultSchema,
        },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${args.imageBase64}`,
              },
            },
            {
              type: "text",
              text: `Look at this image and extract individual ${args.language} words from it. These could be words on a sign, in a book, on a menu, etc.

Rules:
- Only include words that are actually in ${args.language}.
- Return the base/dictionary form of each word when possible.
- Maximum 20 words.
- If no ${args.language} words are found, return an empty array.`,
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const data = JSON.parse(content);
    return data.words || [];
  },
});

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

    const client = getClient();

    const response = await client.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "word_details",
          strict: true,
          schema: wordDetailsSchema,
        },
      },
      messages: [
        {
          role: "system",
          content: `You are a language learning assistant. Given a word in ${args.language}, provide detailed information about it.

Rules:
- "conjugation" should only be populated if the word is a verb. For nouns/adjectives, return an empty array.
- "prepositions" should list common prepositions used with this word. If none, return an empty array.
- Use the conventions of ${args.language} for pronouns and grammatical terms.
- The example sentence should be natural and useful for a learner.`,
        },
        {
          role: "user",
          content: `Provide detailed information for the ${args.language} word: "${args.word}"`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(content);

    const wordData = {
      word: args.word,
      language: args.language,
      translation: data.translation || "...",
      type: data.type || "--",
      example: data.example || "...",
      conjugation: data.conjugation?.length ? data.conjugation : undefined,
      prepositions: data.prepositions?.length ? data.prepositions : undefined,
    };

    await ctx.runMutation(internal.words.storeWord, wordData);

    return wordData;
  },
});

const quizSchema = {
  type: "object" as const,
  properties: {
    questions: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          word: { type: "string" as const },
          correctAnswer: { type: "string" as const },
          wrongAnswers: {
            type: "array" as const,
            items: { type: "string" as const },
          },
        },
        required: ["word", "correctAnswer", "wrongAnswers"],
      },
    },
  },
  required: ["questions"],
};

export const generateQuiz = action({
  args: { words: v.array(v.string()), language: v.string() },
  handler: async (_ctx, args): Promise<
    { word: string; correctAnswer: string; options: string[] }[]
  > => {
    const client = getClient();

    const response = await client.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "quiz",
          strict: true,
          schema: quizSchema,
        },
      },
      messages: [
        {
          role: "system",
          content: `You are a language quiz generator. Given a list of ${args.language} words, generate a multiple choice quiz. For each word, provide the correct English translation and exactly 2 plausible but wrong English translations.`,
        },
        {
          role: "user",
          content: `Generate quiz questions for these ${args.language} words: ${args.words.join(", ")}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    const data = JSON.parse(content);
    return data.questions.map(
      (q: { word: string; correctAnswer: string; wrongAnswers: string[] }) => {
        const options = [q.correctAnswer, ...q.wrongAnswers.slice(0, 2)];
        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }
        return { word: q.word, correctAnswer: q.correctAnswer, options };
      }
    );
  },
});
