export type MagnetRecord = {
  magnetLink: string;
  infohash: string;
  name: string | null;
  date: string;
  source: string;
};

export type MagnetStashItem = {
  id: string;
  collectedAt: string;
  data: MagnetRecord;
}

export type RawMagnetLinkData = {
  magnetLink: string;
  name: string;
};

export type Options = {
  minimalCollectionMode: boolean;
  collectTorrentNames: boolean;
  rollingCollection: boolean;
  rollingCollectionMaxSize?: number;
  adapters: string[];
};

export type SourceAdapter = (
  document: Document,
  location: Location
) => RawMagnetLinkData[];
