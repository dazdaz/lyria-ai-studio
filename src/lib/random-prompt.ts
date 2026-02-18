const INSTRUMENTS = [
  "303 Acid Bass", "808 Hip Hop Beat", "Accordion", "Alto Saxophone", "Bagpipes",
  "Banjo", "Bass Clarinet", "Bongos", "Cello", "Conga Drums", "Didgeridoo",
  "Djembe", "Dulcimer", "Fiddle", "Flamenco Guitar", "Funk Drums", "Glockenspiel",
  "Guitar", "Hang Drum", "Harmonica", "Harp", "Harpsichord", "Kalimba", "Koto",
  "Mandolin", "Marimba", "Mbira", "Mellotron", "Moog Synth", "Ocarina", "Piano",
  "Rhodes Piano", "Shamisen", "Sitar", "Slide Guitar", "Steel Drum", "Synth Pads",
  "Tabla", "TR-909 Drums", "Trumpet", "Tuba", "Vibraphone", "Viola", "Woodwinds"
]

const GENRES = [
  "Acid Jazz", "Afrobeat", "Ambient", "Baroque", "Bluegrass", "Blues",
  "Bossa Nova", "Breakbeat", "Celtic Folk", "Chillout", "Chiptune", "Classic Rock",
  "Deep House", "Disco Funk", "Drum & Bass", "Dubstep", "EDM", "Electro Swing",
  "Funk", "G-funk", "Glitch Hop", "Grime", "Hyperpop", "Indian Classical",
  "Indie Electronic", "Indie Folk", "Indie Pop", "Irish Folk", "Jazz Fusion",
  "Latin Jazz", "Lo-Fi Hip Hop", "Minimal Techno", "Neo-Soul", "Orchestral",
  "Piano Ballad", "Post-Punk", "Psytrance", "R&B", "Reggae", "Reggaeton",
  "Salsa", "Shoegaze", "Ska", "Surf Rock", "Synthpop", "Techno", "Trance",
  "Trap", "Trip Hop", "Vaporwave"
]

const MOODS = [
  "ambient", "bright", "chill", "danceable", "dreamy", "emotional", "ethereal",
  "experimental", "funky", "groovy", "hypnotic", "intense", "lo-fi", "melancholic",
  "peaceful", "psychedelic", "relaxing", "upbeat", "uplifting", "dark", "energetic"
]

const TEMPOS = [
  "slow tempo", "medium tempo", "fast tempo", "upbeat tempo", "relaxed tempo"
]

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function generateRandomPrompt(): string {
  const genre = pickOne(GENRES)
  const mood = pickOne(MOODS)
  
  const useInstruments = Math.random() > 0.4
  const useTempo = Math.random() > 0.5
  
  const parts: string[] = [genre]
  
  if (useInstruments) {
    const instruments = pickRandom(INSTRUMENTS, Math.random() > 0.5 ? 2 : 1)
    parts.push(instruments.join(" and "))
  }
  
  parts.push(mood)
  
  if (useTempo) {
    parts.push(pickOne(TEMPOS))
  }
  
  return parts.join(", ")
}

export function generateSimpleRandomPrompt(): string {
  const genre = pickOne(GENRES)
  const mood = pickOne(MOODS)
  return `${genre}, ${mood}`
}

