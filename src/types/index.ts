export type MessageData = {
  image?: string;
  audio?: string;
};

export type MediaType = "image/jpeg" | "audio/mpeg";

export type MediaData = {
  data: string;
  mimeType: string;
};

export type GeneralSettings = {
  temperature: number;
  maxLength: number;
  topP: number;
  topK: number;
};

export type SafetySettings = {
  harassment: number;
  hateSpeech: number;
  sexuallyExplicit: number;
  dangerousContent: number;
};
