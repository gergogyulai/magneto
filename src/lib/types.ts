export type SavedMagnetLinks = {
  magnetLinks: MagnetRecord[];
};

export type MagnetRecord = {
  magnetLink: string;
  name: string | null;
  date: string;
  source: string;
};

export type RawMagnetLinkData = {
  magnetLink: string;
  name: string;
};

export type SourceAdapter = (
  document: Document,
  location: Location
) => RawMagnetLinkData[];