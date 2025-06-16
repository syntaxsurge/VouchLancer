import OpenAI from 'openai'

import {
  strictGraderMessages,
  summariseProfileMessages,
  candidateFitMessages,
} from '@/lib/ai/prompts'
import { validateCandidateFitJson, validateQuizScoreResponse } from '@/lib/ai/validators'
import { OPENAI_API_KEY } from '@/lib/config'

/**
 * Singleton OpenAI client configured with the platform API key.
 */
export const openAiClient = new OpenAI({ apiKey: OPENAI_API_KEY })

/* -------------------------------------------------------------------------- */
/*                               core wrapper                                 */
/* -------------------------------------------------------------------------- */

/**
 * Thin wrapper around {@link OpenAI.Chat.Completions.create} with built-in
 * validation and automatic retries for non-streaming requests.
 *
 * When {@link options.stream} is `true`, the raw `ChatCompletion` object is
 * returned; otherwise the assistant’s `content` string is extracted. If a
 * `validate` callback is provided its return value must be `null` (success) or
 * an error message string. Failed validations are automatically retried up to
 * `maxRetries` times.
 *
 * @template Stream Return type selector (`true` → `ChatCompletion`, else `string`).
 * @param messages   Conversation history.
 * @param options    OpenAI parameters plus `stream`, `validate`, and `maxRetries`.
 */
export async function chatCompletion<Stream extends boolean = false>(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  {
    model = 'gpt-4o',
    stream = false as Stream,
    validate,
    maxRetries = 1,
    ...opts
  }: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParams> & {
    stream?: Stream
    validate?: (raw: string) => string | null
    maxRetries?: number
  } = {},
): Promise<Stream extends true ? OpenAI.Chat.Completions.ChatCompletion : string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured or missing.')
  }

  /* ------------------------ streaming: passthrough ------------------------ */
  if (stream) {
    return (await openAiClient.chat.completions.create({
      model,
      messages,
      stream: true,
      ...opts,
    })) as any
  }

  /* ---------------- non-streaming: validate with retries ------------------ */
  const retries = Math.max(1, maxRetries)
  let lastError = 'Validation failed'

  for (let attempt = 1; attempt <= retries; attempt++) {
    const completion = (await openAiClient.chat.completions.create({
      model,
      messages,
      ...opts,
    })) as OpenAI.Chat.Completions.ChatCompletion

    const raw = (completion.choices[0]?.message?.content ?? '').trim()

    if (!validate) {
      return raw as any
    }

    try {
      const validationMsg = validate(raw)
      if (!validationMsg) return raw as any
      lastError = validationMsg
    } catch (err: any) {
      lastError = err?.message ?? lastError
    }
  }

  throw new Error(
    `OpenAI returned an invalid response after ${retries} retries. Last error: ${lastError}`,
  )
}

/* -------------------------------------------------------------------------- */
/*                            domain-specific APIs                            */
/* -------------------------------------------------------------------------- */

/**
 * Assess a quiz answer and return the AI score (0-100).
 */
export async function openAIAssess(
  answer: string,
  quizTitle: string,
): Promise<{ aiScore: number }> {
  const raw = await chatCompletion(strictGraderMessages(quizTitle, answer), {
    maxRetries: 3,
    validate: validateQuizScoreResponse,
  })

  return { aiScore: parseInt(raw.replace(/[^0-9]/g, ''), 10) }
}

export async function buildProfileContext(_userId: number): Promise<string> {
  try {
    const result = null
    return JSON.stringify(result).slice(0, 1000)
  } catch (err) {
    console.error('buildProfileContext error:', err)
    return ''
  }
}

/**
 * Generate a concise candidate profile summary (~`words` words).
 */
export async function summariseCandidateProfile(
  profile: string,
  words = 120,
  userId?: number,
): Promise<string> {
  const context = typeof userId === 'number' ? await buildProfileContext(userId) : ''
  const input = context ? `${context}\n\n${profile}` : profile
  return chatCompletion(summariseProfileMessages(input, words))
}

/**
 * Produce a structured "Why Hire" JSON summary for recruiters.
 */
export async function generateCandidateFitSummary(
  pipelinesStr: string,
  profileStr: string,
): Promise<string> {
  return chatCompletion(candidateFitMessages(pipelinesStr, profileStr), {
    maxRetries: 3,
    validate: validateCandidateFitJson,
  })
}
