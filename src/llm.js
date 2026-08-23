// OpenAI Chat Completions への薄いラッパー
import axios from 'axios';
import { config } from './config.js';

export const isLlmEnabled = () => Boolean(config.openai.apiKey);

export async function chat({ messages, model, temperature = 0.3, json = false, maxTokens }) {
  if (!isLlmEnabled()) {
    throw new Error('OPENAI_API_KEY が未設定です');
  }

  const payload = {
    model: model || config.openai.model,
    messages,
    temperature
  };
  if (json) payload.response_format = { type: 'json_object' };
  if (maxTokens) payload.max_tokens = maxTokens;

  const response = await axios.post(`${config.openai.baseUrl}/chat/completions`, payload, {
    headers: {
      Authorization: `Bearer ${config.openai.apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: config.openai.timeoutMs
  });

  return response.data?.choices?.[0]?.message?.content || '';
}

// LLM が ```json ... ``` で包んで返してくることがあるので剥がしてから JSON 化する
export function parseJsonLoose(text) {
  if (!text) return null;
  const stripped = String(text)
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/, '')
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const start = stripped.search(/[[{]/);
    const end = Math.max(stripped.lastIndexOf(']'), stripped.lastIndexOf('}'));
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(stripped.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}
