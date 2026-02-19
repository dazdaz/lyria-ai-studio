import { GoogleGenAI, type LiveMusicSession, type LiveMusicServerMessage } from "@google/genai"
import { useAppStore } from "@/stores/app-store"
import { debugLog } from "./debug-logger"

export type LyriaModelType = "realtime" | "lyria2" | "lyria3"

export interface LyriaConfig {
  bpm: number
  key: string
  scale: string
  density: number
  brightness: number
  guidance: number
  temperature: number
  prompts: Array<{ text: string; weight: number }>
  negativePrompt: string
  instrumentMutes: Record<string, boolean>
}

const KEY_MAP: Record<string, string> = {
  C: "C",
  "C#": "C_SHARP",
  D: "D",
  "D#": "D_SHARP",
  E: "E",
  F: "F",
  "F#": "F_SHARP",
  G: "G",
  "G#": "G_SHARP",
  A: "A",
  "A#": "A_SHARP",
  B: "B",
}

export class LyriaClient {
  private apiKey: string
  private modelType: LyriaModelType
  private client: GoogleGenAI | null = null
  private session: LiveMusicSession | null = null
  private onAudioChunk: ((chunk: ArrayBuffer) => void) | null = null
  private onAudioChunkBase64: ((base64: string) => void) | null = null
  private onError: ((error: string) => void) | null = null
  private onStatusChange: ((status: string) => void) | null = null
  private isGenerating = false
  private currentConfig: LyriaConfig | null = null
  private isSessionReady = false
  private pendingConfig: LyriaConfig | null = null

  constructor(apiKey: string, modelType: LyriaModelType = "realtime") {
    this.apiKey = apiKey
    this.modelType = modelType
  }

  getModelType(): LyriaModelType {
    return this.modelType
  }

  async connect(): Promise<void> {
    if (this.session) {
      console.log("[Lyria] Already connected, reusing session")
      this.isSessionReady = true
      this.onStatusChange?.("Connected to Google Lyria Realtime")
      return
    }

    this.onStatusChange?.("Connecting to Lyria API...")
    this.isSessionReady = false

    try {
      if (this.modelType === "realtime") {
        this.client = new GoogleGenAI({
          apiKey: this.apiKey,
          httpOptions: { apiVersion: "v1alpha" },
        })

        this.session = await this.client.live.music.connect({
          model: "models/lyria-realtime-exp",
          callbacks: {
            onmessage: (message: LiveMusicServerMessage) => {
              this.handleMessage(message)
            },
            onerror: (error: ErrorEvent) => {
              console.error("[Lyria] Connection error:", error)
              this.onError?.("Google Lyria Realtime connection error")
            },
            onclose: (event: CloseEvent) => {
              this.isSessionReady = false
              if (event.code !== 1000) {
                this.onError?.(`Connection closed: ${event.reason || "Unknown error"}`)
              } else {
                this.onStatusChange?.("Disconnected")
              }
            },
          },
        })
        
        console.log("[Lyria] Session connected")
        this.onStatusChange?.("Connected to Google Lyria Realtime")
      } else {
        const modelLabel = this.modelType === "lyria3" ? "Google Lyria 3" : "Google Lyria 2"
        const store = useAppStore.getState()
        if (!store.vertexProjectId) {
          this.onError?.(`${modelLabel}: Enter Project ID in Settings`)
          this.onStatusChange?.("Missing Project ID")
          return
        }
        if (!store.vertexAccessToken) {
          this.onError?.(`${modelLabel}: Enter Access Token in Settings (run: gcloud auth print-access-token)`)
          this.onStatusChange?.("Missing Access Token")
          return
        }
        console.log(`${modelLabel} client ready (Vertex AI)`)
        this.onStatusChange?.(`Connected to ${modelLabel} (Vertex AI)`)
        this.isSessionReady = true
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Connection failed"
      console.error("Failed to connect to Lyria:", err)
      this.onError?.(errorMsg)
      this.onStatusChange?.("Connection failed")
    }
  }

  private handleMessage(message: LiveMusicServerMessage) {
    if (message.setupComplete) {
      this.isSessionReady = true
      this.onStatusChange?.("API ready - generating...")
      
      if (this.pendingConfig) {
        const config = this.pendingConfig
        this.pendingConfig = null
        this.executeGeneration(config)
      }
    }

    if (message.filteredPrompt) {
      const reason = message.filteredPrompt.filteredReason || "Content policy"
      this.onError?.(`Prompt rejected: ${reason}`)
      this.onStatusChange?.("Prompt rejected")
    }

    // Handle audio chunks - prefer base64 callback for native mode
    const audioChunk = message.audioChunk
    const audioChunks = message.serverContent?.audioChunks
    
    if (audioChunk?.data) {
      debugLog.info(`[Lyria] Received audio chunk, base64 length: ${audioChunk.data.length}`)
      if (this.onAudioChunkBase64) {
        this.onAudioChunkBase64(audioChunk.data)
      } else if (this.onAudioChunk) {
        debugLog.info(`[Lyria] Converting base64 to ArrayBuffer...`)
        const buffer = this.base64ToArrayBuffer(audioChunk.data)
        debugLog.info(`[Lyria] Calling onAudioChunk callback, buffer size: ${buffer.byteLength}`)
        this.onAudioChunk(buffer)
      }
    } else if (audioChunks && audioChunks.length > 0) {
      debugLog.info(`[Lyria] Received ${audioChunks.length} audio chunks in serverContent`)
      for (const chunk of audioChunks) {
        if (chunk.data) {
          if (this.onAudioChunkBase64) {
            this.onAudioChunkBase64(chunk.data)
          } else if (this.onAudioChunk) {
            const buffer = this.base64ToArrayBuffer(chunk.data)
            this.onAudioChunk(buffer)
          }
        }
      }
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const buffer = new ArrayBuffer(binary.length)
    const view = new Uint8Array(buffer)
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i)
    }
    return buffer
  }

  setOnAudioChunk(callback: (chunk: ArrayBuffer) => void) {
    this.onAudioChunk = callback
  }

  setOnAudioChunkBase64(callback: ((base64: string) => void) | null) {
    this.onAudioChunkBase64 = callback
  }

  setOnError(callback: (error: string) => void) {
    this.onError = callback
  }

  setOnStatusChange(callback: (status: string) => void) {
    this.onStatusChange = callback
  }

  async startGeneration(config: LyriaConfig) {
    this.currentConfig = config
    this.isGenerating = true

    if (this.modelType === "lyria2" || this.modelType === "lyria3") {
      await this.startVertexGeneration(config)
      return
    }

    if (!this.session) {
      this.onError?.("No Google Lyria Realtime session. Check your API key and try reconnecting.")
      this.onStatusChange?.("Not connected")
      return
    }

    // Don't wait for setupComplete - it arrives late or lazily.
    // Just start generation. If session is invalid, we'll get an error.
    if (!this.isSessionReady) {
      console.log("[Lyria] Session not flagged ready, but proceeding anyway for speed")
    }

    await this.executeGeneration(config)
  }

  private async executeGeneration(config: LyriaConfig) {
    if (!this.session) {
      return
    }

    try {
      this.onStatusChange?.("Starting generation...")
      
      // Apply config (prompts and BPM)
      await this.applyConfig(config)
      
      // Start playback
      console.log("[Lyria] Calling play()...")
      this.session.play()
      console.log("[Lyria] play() called successfully")
      this.onStatusChange?.("Generating music...")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Generation failed"
      console.error("[Lyria] Generation error:", err)
      this.onError?.(errorMsg)
      this.isGenerating = false
    }
  }

  private async startVertexGeneration(config: LyriaConfig) {
    const store = useAppStore.getState()
    const { vertexProjectId, vertexRegion, vertexAccessToken } = store
    const modelId = this.modelType === "lyria3" ? "lyria-003" : "lyria-002"
    const modelLabel = this.modelType === "lyria3" ? "Google Lyria 3" : "Google Lyria 2"
    const logTag = this.modelType === "lyria3" ? "[Lyria 3]" : "[Lyria 2]"

    if (!vertexProjectId || !vertexAccessToken) {
      this.onError?.(`${modelLabel}: Missing Project ID or Access Token in Settings`)
      this.onStatusChange?.("Missing credentials")
      return
    }

    const prompt = config.prompts
      .filter(p => p.text.trim())
      .map(p => p.text.trim())
      .join(", ")

    const negativePrompt = config.negativePrompt.trim() || undefined

    console.log(`${logTag} Starting generation`)
    console.log(`${logTag} Project:`, vertexProjectId)
    console.log(`${logTag} Region:`, vertexRegion)
    console.log(`${logTag} Prompt:`, prompt)

    this.onStatusChange?.(`${modelLabel}: Calling Vertex AI...`)

    const endpoint = `https://${vertexRegion}-aiplatform.googleapis.com/v1/projects/${vertexProjectId}/locations/${vertexRegion}/publishers/google/models/${modelId}:predict`

    const requestBody = {
      instances: [
        {
          prompt: prompt,
          ...(negativePrompt && { negative_prompt: negativePrompt }),
        },
      ],
      parameters: {
        sample_count: 1,
      },
    }

    console.log(`${logTag} Endpoint:`, endpoint)
    console.log(`${logTag} Request body:`, JSON.stringify(requestBody, null, 2))

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${vertexAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log(`${logTag} Response status:`, response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`${logTag} Error response:`, errorText)
        
        let errorMessage = `${modelLabel} API error (${response.status})`
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.error?.message) {
            errorMessage = errorJson.error.message
          }
        } catch {}
        
        if (response.status === 401 || response.status === 403) {
          errorMessage = "Authentication failed. Your access token may have expired. Run 'gcloud auth print-access-token' to get a new one."
        } else if (response.status === 404) {
          if (this.modelType === "lyria3") {
            errorMessage = `Google Lyria 3 (lyria-003) is not yet available on the Vertex AI API. It is currently only accessible via the Gemini app.\n\nUse Google Lyria 2 or Google Lyria Realtime instead.`
          } else {
            errorMessage = `${modelLabel} model not found in project '${vertexProjectId}'. Verify your Project ID and Region are correct, and that the Vertex AI API is enabled.\n\nSee: docs.cloud.google.com/vertex-ai/generative-ai/docs/music/generate-music`
          }
        }
        
        this.onError?.(errorMessage)
        this.onStatusChange?.("Generation failed")
        return
      }

      const data = await response.json()
      console.log(`${logTag} Response data:`, data)

      if (data.predictions?.[0]?.audio) {
        console.log(`${logTag} Got audio data!`)
        this.onStatusChange?.(`${modelLabel}: Processing audio...`)
        
        const audioBase64 = data.predictions[0].audio
        const audioBuffer = this.base64ToArrayBuffer(audioBase64)
        
        this.streamAudioBuffer(audioBuffer)
        this.onStatusChange?.(`${modelLabel}: Playing...`)
      } else if (data.predictions?.[0]?.audioData) {
        console.log(`${logTag} Got audioData!`)
        this.onStatusChange?.(`${modelLabel}: Processing audio...`)
        
        const audioBase64 = data.predictions[0].audioData
        const audioBuffer = this.base64ToArrayBuffer(audioBase64)
        
        this.streamAudioBuffer(audioBuffer)
        this.onStatusChange?.(`${modelLabel}: Playing...`)
      } else {
        console.error(`${logTag} Unexpected response format:`, data)
        this.onError?.(`${modelLabel}: Unexpected response format from API`)
        this.onStatusChange?.("Generation failed")
      }
    } catch (err) {
      console.error(`${logTag} Fetch error:`, err)
      const errorMsg = err instanceof Error ? err.message : "Network error"
      this.onError?.(`${modelLabel}: ${errorMsg}`)
      this.onStatusChange?.("Generation failed")
    }
  }

  private streamAudioBuffer(buffer: ArrayBuffer) {
    const chunkSize = 48000 * 2 * 2 * 0.2
    let offset = 0

    const sendChunk = () => {
      if (offset >= buffer.byteLength || !this.isGenerating) {
        this.onStatusChange?.("Stopped")
        return
      }

      const chunk = buffer.slice(offset, offset + chunkSize)
      this.onAudioChunk?.(chunk)
      offset += chunkSize

      if (offset < buffer.byteLength && this.isGenerating) {
        setTimeout(sendChunk, 180)
      } else {
        this.onStatusChange?.("Generation complete")
      }
    }

    sendChunk()
  }

  private async applyConfig(config: LyriaConfig) {
    if (!this.session) return

    try {
      const prompts = config.prompts || []
      
      const validPrompts = prompts
        .filter((p) => p && p.text && p.text.trim())
        .map((p) => ({
          text: p.text.trim(),
          weight: typeof p.weight === 'number' ? p.weight : 1.0,
        }))

      if (validPrompts.length === 0) {
        validPrompts.push({
          text: "ambient electronic music",
          weight: 1.0,
        })
      }

      await this.session.setWeightedPrompts({ 
        weightedPrompts: validPrompts 
      })

      await this.session.setMusicGenerationConfig({
        musicGenerationConfig: {
          bpm: Math.round(config.bpm || 120),
        }
      })
    } catch (err) {
      console.error("[Lyria] Config error:", err)
      throw err
    }
  }

  async pause() {
    if (this.session) {
      this.session.pause()
    }
    this.isGenerating = false
    this.onStatusChange?.("Paused")
  }

  async resume() {
    if (this.session) {
      this.session.play()
      this.isGenerating = true
      this.onStatusChange?.("Generating music...")
    }
  }

  async stop() {
    console.log("[Lyria] stop() called", new Error().stack)
    this.isGenerating = false
    if (this.session) {
      this.session.pause()
    }
    this.onStatusChange?.("Stopped")
  }

  stopGeneration() {
    console.log("[Lyria] stopGeneration() called", new Error().stack)
    this.isGenerating = false
    if (this.session) {
      this.session.pause()
    }
    this.onStatusChange?.("Stopped")
  }

  async disconnect() {
    this.isGenerating = false
    if (this.session) {
      this.session.close()
      this.session = null
    }
    this.client = null
    this.onStatusChange?.("Disconnected")
  }

  isConnected(): boolean {
    if (this.modelType === "lyria2" || this.modelType === "lyria3") {
      const store = useAppStore.getState()
      return !!(store.vertexProjectId && store.vertexAccessToken)
    }
    return this.session !== null
  }
}

let clientInstance: LyriaClient | null = null

export function getLyriaClient(apiKey: string, modelType: LyriaModelType = "realtime"): LyriaClient {
  if (!clientInstance || clientInstance["apiKey"] !== apiKey || clientInstance.getModelType() !== modelType) {
    if (clientInstance) {
      clientInstance.disconnect()
    }
    clientInstance = new LyriaClient(apiKey, modelType)
  }
  return clientInstance
}

export function buildConfigFromStore(): LyriaConfig {
  const state = useAppStore.getState()
  return {
    bpm: state.bpm,
    key: state.key,
    scale: state.scale,
    density: state.density,
    brightness: state.brightness,
    guidance: state.guidance,
    temperature: state.temperature,
    prompts: state.prompts,
    negativePrompt: state.negativePrompt,
    instrumentMutes: state.instrumentMutes,
  }
}
