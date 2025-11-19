// Shared OpenAI client utilities for edge functions

export interface OpenAIConfig {
  apiKey: string;
}

/**
 * Get OpenAI API key from environment
 */
export function getOpenAIConfig(): OpenAIConfig {
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  return { apiKey };
}

/**
 * Call OpenAI Chat Completion API
 */
export async function createChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = "gpt-4o",
  temperature: number = 0.7
): Promise<any> {
  const config = getOpenAIConfig();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  return await response.json();
}

/**
 * Upload file to OpenAI
 */
export async function uploadFile(
  file: Blob,
  filename: string,
  purpose: string = "assistants"
): Promise<string> {
  const config = getOpenAIConfig();

  const formData = new FormData();
  formData.append("file", file, filename);
  formData.append("purpose", purpose);

  const response = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload file to OpenAI: ${error}`);
  }

  const fileData = await response.json();
  return fileData.id;
}

/**
 * Delete file from OpenAI
 */
export async function deleteFile(fileId: string): Promise<void> {
  const config = getOpenAIConfig();

  try {
    await fetch(`https://api.openai.com/v1/files/${fileId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
      },
    });
  } catch (error) {
    console.warn(`Failed to delete file ${fileId}:`, error);
  }
}
