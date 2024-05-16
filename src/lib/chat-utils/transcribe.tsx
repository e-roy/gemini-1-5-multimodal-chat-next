import fetch from "node-fetch";
import FormData from "form-data";

export async function transcribeAudio(audioBase64: string): Promise<string> {
  const audioBuffer = Buffer.from(audioBase64, "base64");

  const form = new FormData();
  form.append("file", audioBuffer, {
    filename: "recording.mp3",
    contentType: "audio/mp3",
  });
  form.append("model", "whisper-1");
  form.append("language", "en");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.text;
}
