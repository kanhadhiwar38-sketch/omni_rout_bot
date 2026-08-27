import type { AISettings } from '../types/chat';

export async function fetchAvailableModels(baseUrl: string, apiKey?: string): Promise<string[]> {
  try {
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    const url = `${cleanUrl}/models`;
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) return [];
    const data = await response.json();
    if (Array.isArray(data.data)) {
      return data.data.map((m: { id: string }) => m.id).filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}

export async function sendChatMessageStream(
  settings: AISettings,
  messages: { role: string; content: string }[],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const url = `${settings.baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const requestBody = {
    model: settings.model || 'omniroute/auto',
    messages: [
      { role: 'system', content: settings.systemPrompt },
      ...messages,
    ],
    temperature: settings.temperature,
    max_tokens: settings.maxTokens,
    stream: true,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (settings.apiKey) {
    headers['Authorization'] = `Bearer ${settings.apiKey}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `API Request Failed (${response.status}): ${errorText || response.statusText}`
    );
  }

  if (!response.body) {
    throw new Error('Response body is null, streaming not supported');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue; // Skip comments/empty lines

      if (trimmed.startsWith('data: ')) {
        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') {
          return;
        }
        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            onChunk(delta);
          }
        } catch {
          // Ignore JSON parse errors for incomplete chunks
        }
      }
    }
  }

  if (buffer.length > 0) {
    const trimmed = buffer.trim();
    if (trimmed.startsWith('data: ') && trimmed.slice(6) !== '[DONE]') {
      try {
        const parsed = JSON.parse(trimmed.slice(6));
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          onChunk(delta);
        }
      } catch {
        // ignore
      }
    }
  }
}