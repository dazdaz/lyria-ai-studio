import { useEffect, useRef, useCallback } from "react"
import { invoke } from "@tauri-apps/api/core"
import { useAppStore, type Preset } from "@/stores/app-store"

const isTauri = () => "__TAURI_INTERNALS__" in window

export function useSettings() {
  // Select state individually to avoid re-renders on unrelated state changes (like analyzerData)
  const apiKey = useAppStore((state) => state.apiKey)
  const showApiKey = useAppStore((state) => state.showApiKey)
  const theme = useAppStore((state) => state.theme)
  const presets = useAppStore((state) => state.presets)
  
  const setApiKey = useAppStore((state) => state.setApiKey)
  const setShowApiKey = useAppStore((state) => state.setShowApiKey)
  const setTheme = useAppStore((state) => state.setTheme)
  const setPresets = useAppStore((state) => state.setPresets)

  const loadAttempted = useRef(false)

  // Memoize loadSettings to prevent infinite loops in effects
  const loadSettings = useCallback(async () => {
    if (!isTauri()) {
      document.documentElement.setAttribute("data-theme", theme)
      return
    }
    
    try {
      const settingsJson = await invoke<string>("load_settings")
      const settings = JSON.parse(settingsJson)
      
      if (settings.theme) {
        setTheme(settings.theme)
      }
      if (settings.show_api_key !== undefined) {
        setShowApiKey(settings.show_api_key)
      }
      if (settings.presets) {
        setPresets(settings.presets)
      }

      const key = await invoke<string | null>("get_api_key")
      if (key) {
        setApiKey(key)
      }
    } catch (err) {
      console.error("Failed to load settings:", err)
    }
  }, [theme, setApiKey, setShowApiKey, setTheme, setPresets])

  useEffect(() => {
    if (!loadAttempted.current) {
      loadAttempted.current = true
      loadSettings()
    }
  }, [loadSettings])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  const saveApiKey = useCallback(async (key: string) => {
    if (!isTauri()) {
      setApiKey(key)
      return
    }
    try {
      await invoke("save_api_key", { apiKey: key })
      setApiKey(key)
    } catch (err) {
      console.error("Failed to save API key:", err)
      throw err
    }
  }, [setApiKey])

  const saveSettings = useCallback(async () => {
    if (!isTauri()) return
    try {
      const settings = {
        show_api_key: showApiKey,
        theme,
        presets,
      }
      await invoke("save_settings", { settingsJson: JSON.stringify(settings) })
    } catch (err) {
      console.error("Failed to save settings:", err)
      throw err
    }
  }, [showApiKey, theme, presets])

  const savePreset = useCallback(async (preset: Preset) => {
    // Note: We can't use 'presets' from closure here if we want to avoid dependency loop
    // But since we update store immediately, we can use functional update or get fresh state
    // For simplicity, we'll rely on the component re-rendering with fresh presets
    
    const updatedPresets = presets.some((p) => p.id === preset.id)
      ? presets.map((p) => (p.id === preset.id ? preset : p))
      : [...presets, preset]
    setPresets(updatedPresets)
    
    if (!isTauri()) return
    try {
      await invoke("save_preset", { presetJson: JSON.stringify(preset) })
    } catch (err) {
      console.error("Failed to save preset:", err)
      throw err
    }
  }, [presets, setPresets])

  const deletePreset = useCallback(async (presetId: string) => {
    setPresets(presets.filter((p) => p.id !== presetId))
    
    if (!isTauri()) return
    try {
      await invoke("delete_preset", { presetId })
    } catch (err) {
      console.error("Failed to delete preset:", err)
      throw err
    }
  }, [presets, setPresets])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    // We can't call saveSettings() directly here because it depends on the *new* theme
    // which hasn't propagated yet. 
    // Instead, we should rely on the effect or pass the new theme.
    // For now, we'll just update the store. The user can save settings manually or we can add an effect.
    // But wait, saveSettings uses 'theme' from scope.
    
    if (isTauri()) {
       const settings = {
        show_api_key: showApiKey,
        theme: newTheme,
        presets,
      }
      invoke("save_settings", { settingsJson: JSON.stringify(settings) }).catch(console.error)
    }
  }, [theme, setTheme, showApiKey, presets])

  return {
    apiKey,
    showApiKey,
    theme,
    presets,
    setShowApiKey,
    setTheme,
    saveApiKey,
    saveSettings,
    savePreset,
    deletePreset,
    loadSettings,
    toggleTheme
  }
}
