import { useState, useEffect } from "react"
import { Settings, Eye, EyeOff, ExternalLink } from "lucide-react"
import { open } from "@tauri-apps/plugin-shell"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { useSettings } from "@/hooks/useSettings"
import { useAppStore } from "@/stores/app-store"
import { MODEL_CONFIG, MUSICGEN_MODELS } from "@/lib/constants"

const VERTEX_REGIONS = [
  { value: "us-central1", label: "US Central (Iowa)" },
  { value: "us-east1", label: "US East (South Carolina)" },
  { value: "us-west1", label: "US West (Oregon)" },
  { value: "europe-west1", label: "Europe West (Belgium)" },
  { value: "europe-west4", label: "Europe West (Netherlands)" },
  { value: "asia-northeast1", label: "Asia Northeast (Tokyo)" },
]

function SettingRow({ 
  title, 
  description, 
  badge,
  link,
  children 
}: { 
  title: string
  description?: string
  badge?: { text: string; variant: "success" | "warning" | "info" }
  link?: { url: string; text: string }
  children: React.ReactNode 
}) {
  const handleOpenLink = async (url: string) => {
    try {
      await open(url)
    } catch (err) {
      console.error("Failed to open link:", err)
      window.open(url, "_blank")
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{title}</span>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
              badge.variant === "success" ? "bg-success/20 text-success" :
              badge.variant === "warning" ? "bg-warning/20 text-warning" :
              "bg-accent/20 text-accent"
            }`}>
              {badge.text}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-text-muted break-words">{description}</p>
        )}
        {link && (
          <button 
            onClick={() => handleOpenLink(link.url)}
            className="text-xs text-accent hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            {link.text}
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="flex items-start min-w-0">
        {children}
      </div>
    </div>
  )
}

function SectionDivider({ 
  title, 
  subtitle,
  variant = "default" 
}: { 
  title?: string
  subtitle?: string
  variant?: "default" | "prominent" | "model-specific"
}) {
  if (variant === "model-specific") {
    return (
      <div className="bg-warning/10 border-y-4 border-warning/50 py-4 px-4 mt-6 mb-2 -mx-4 rounded">
        {title && (
          <h3 className="text-sm font-bold text-warning">{title}</h3>
        )}
        {subtitle && (
          <p className="text-xs text-text-muted mt-1 break-words">{subtitle}</p>
        )}
      </div>
    )
  }
  
  if (variant === "prominent") {
    return (
      <div className="bg-surface-elevated border-y-2 border-border py-3 px-4 mt-4 -mx-4 rounded">
        {title && (
          <h3 className="text-sm font-bold text-text">{title}</h3>
        )}
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5 break-words">{subtitle}</p>
        )}
      </div>
    )
  }
  
  return (
    <div className="border-t-2 border-border pt-4 mt-2">
      {title && (
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</span>
      )}
    </div>
  )
}

export function SettingsPanel() {
  const { 
    settingsOpen, setSettingsOpen, 
    selectedModel, setSelectedModel,
    lyriaModel, setLyriaModel,
    vertexProjectId, setVertexProjectId,
    vertexRegion, setVertexRegion,
    vertexAccessToken, setVertexAccessToken,
    huggingFaceToken, setHuggingFaceToken,
    musicgenModelSize, setMusicgenModelSize,
  } = useAppStore()
  const {
    apiKey,
    theme,
    setTheme,
    saveApiKey,
    saveSettings,
  } = useSettings()

  const [localApiKey, setLocalApiKey] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showAccessToken, setShowAccessToken] = useState(false)
  const [showHfToken, setShowHfToken] = useState(false)

  useEffect(() => {
    if (settingsOpen && apiKey) {
      setLocalApiKey(apiKey)
    }
  }, [apiKey, settingsOpen])

  const handleSaveChanges = async () => {
    setIsSaving(true)
    setError(null)
    setSaved(false)

    try {
      if (localApiKey.trim()) {
        await saveApiKey(localApiKey)
      }
      await saveSettings()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto overflow-x-hidden pr-4 scrollbar-thin">
          
          {/* MODEL SELECTION */}
          <SectionDivider 
            title="MODEL SELECTION" 
            subtitle="Choose which AI model to use for music generation."
            variant="prominent"
          />

          <SettingRow
            title="AI Model"
            description={MODEL_CONFIG[selectedModel]?.description || ""}
            badge={
              selectedModel === "realtime" 
                ? { text: "Free", variant: "success" }
                : { text: "Paid", variant: "warning" }
            }
          >
            <Select 
              value={selectedModel} 
              onValueChange={(v) => {
                setSelectedModel(v as "realtime" | "lyria2" | "lyria3" | "musicgen")
                if (v === "realtime" || v === "lyria2" || v === "lyria3") {
                  setLyriaModel(v as "realtime" | "lyria2" | "lyria3")
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MODEL_CONFIG).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          {selectedModel === "musicgen" && (
            <SettingRow
              title="Model Size"
              description="Larger models produce higher quality but are slower."
            >
              <Select 
                value={musicgenModelSize} 
                onValueChange={(v) => setMusicgenModelSize(v as "small" | "medium" | "large")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MUSICGEN_MODELS).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
          )}

          {/* API KEYS - LYRIA REALTIME */}
          <SectionDivider 
            title="⚠️ LYRIA REALTIME MODEL ONLY" 
            subtitle="This API key is ONLY required if you select Google Lyria Realtime above. Skip this section for Google Lyria 2 or MusicGen."
            variant="model-specific"
          />

          <SettingRow
            title="Gemini API Key"
            description="Required for Google Lyria Realtime. Free tier available."
            link={{ url: "https://aistudio.google.com/apikey", text: "Get API Key" }}
          >
            <div className="relative w-full">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder="AIza..."
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </SettingRow>

          {selectedModel === "musicgen" && (
            <SettingRow
              title="Hugging Face Token"
              description="Optional. For higher rate limits with HF Pro."
              badge={{ text: "MusicGen", variant: "warning" }}
              link={{ url: "https://huggingface.co/settings/tokens", text: "Get Token" }}
            >
              <div className="relative w-full">
                <Input
                  type={showHfToken ? "text" : "password"}
                  placeholder="hf_xxxxxxx..."
                  value={huggingFaceToken}
                  onChange={(e) => setHuggingFaceToken(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  className="pr-10"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowHfToken(!showHfToken)}
                >
                  {showHfToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </SettingRow>
          )}

          {/* VERTEX AI */}
          <SectionDivider 
            title="⚠️ LYRIA 2 / LYRIA 3 MODELS ONLY" 
            subtitle="These settings are ONLY required if you select Google Lyria 2 or Lyria 3 above. Skip this section for Google Lyria Realtime or MusicGen."
            variant="model-specific"
          />

          <SettingRow
            title="Project ID"
            description="Your Google Cloud project identifier."
          >
            <Input
              placeholder="my-project-id"
              value={vertexProjectId}
              onChange={(e) => setVertexProjectId(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              className="w-full"
            />
          </SettingRow>

          <SettingRow
            title="Region"
            description="Select the nearest region for lower latency."
          >
            <Select value={vertexRegion} onValueChange={setVertexRegion}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERTEX_REGIONS.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            title="Access Token"
            description="Run: gcloud auth print-access-token"
            link={{ url: "https://docs.cloud.google.com/vertex-ai/generative-ai/docs/music/generate-music", text: "Setup Guide" }}
          >
            <div className="relative w-full">
              <Input
                type={showAccessToken ? "text" : "password"}
                placeholder="ya29.xxx..."
                value={vertexAccessToken}
                onChange={(e) => setVertexAccessToken(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                className="pr-10"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowAccessToken(!showAccessToken)}
              >
                {showAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </SettingRow>

          {/* APPEARANCE */}
          <SectionDivider 
            title="APPEARANCE" 
            variant="prominent"
          />

          <SettingRow
            title="Theme"
            description="Choose your preferred color scheme."
          >
            <Select 
              value={theme} 
              onValueChange={(v) => setTheme(v as "tokyo-night" | "dark" | "light")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tokyo-night">Tokyo Night</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          {/* SAVE */}
          <div className="pt-6 pb-2">
            {error && <p className="text-sm text-error mb-2">{error}</p>}
            {saved && <p className="text-sm text-success mb-2">Settings saved successfully</p>}
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
              variant="accent"
              className="w-full"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
