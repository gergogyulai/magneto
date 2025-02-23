export type SavedMagnetLinks = {
  magnetLinks: MagnetRecord[]
}

export type MagnetRecord = {
  magnetLink: string
  name: string | null
  date: string
  source: string
}
