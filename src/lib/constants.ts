export const MODEL_CONFIG = {
  realtime: {
    label: "Google Lyria Realtime",
    provider: "Google",
    description: "Streaming, interactive generation",
    maxPromptLength: 200,
    promptTip: "Keep prompts short and simple. Best: 'ambient electronic chill 90 bpm'",
    requiresVertexAI: false,
    pricing: "free",
    pricingNote: "Free tier: 60 req/min",
  },
  lyria2: {
    label: "Google Lyria 2 (Vertex AI)",
    provider: "Google",
    description: "Batch generation - requires Google Cloud",
    maxPromptLength: 500,
    promptTip: "Supports longer, more detailed prompts with style descriptions",
    requiresVertexAI: true,
    pricing: "paid",
    pricingNote: "Requires GCP billing",
  },
  lyria3: {
    label: "Google Lyria 3 (Vertex AI)",
    provider: "Google",
    description: "Latest model - highest quality, longer generation",
    maxPromptLength: 1000,
    promptTip: "Supports rich, detailed prompts with style, mood, instrumentation, and structure",
    requiresVertexAI: true,
    pricing: "paid",
    pricingNote: "Requires GCP billing",
  },
  musicgen: {
    label: "MusicGen",
    provider: "Meta (Hugging Face)",
    description: "Open source - requires self-hosting or HF Pro",
    maxPromptLength: 500,
    promptTip: "Describe genre, mood, instruments. Example: 'upbeat electronic dance music with synths'",
    requiresVertexAI: false,
    pricing: "paid",
    pricingNote: "Requires Hugging Face Pro, Replicate API, or self-hosting with GPU",
  },
} as const

export type ModelKey = keyof typeof MODEL_CONFIG

export const MUSICGEN_MODELS = {
  small: {
    label: "MusicGen Small",
    modelId: "facebook/musicgen-small",
    description: "Fast, lower quality (~300M params)",
  },
  medium: {
    label: "MusicGen Medium", 
    modelId: "facebook/musicgen-medium",
    description: "Balanced speed/quality (~1.5B params)",
  },
  large: {
    label: "MusicGen Large",
    modelId: "facebook/musicgen-large",
    description: "Best quality, slower (~3.3B params)",
  },
} as const

export type MusicGenModelSize = keyof typeof MUSICGEN_MODELS

// Legacy export for backwards compatibility
export const LYRIA_MODEL_CONFIG = MODEL_CONFIG
export type LyriaModelKey = ModelKey
