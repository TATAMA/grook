export type MemeProviderKind = "mock" | "live";

export interface ChainVolumeRow {
  chainId: string;
  label: string;
  volumeUsd24h: number;
}

export interface NewPoolSignal {
  chainId: string;
  pairAddress: string;
  baseSymbol: string;
  quoteSymbol: string;
  volumeUsd24h: number;
  liquidityUsd: number;
  url?: string;
  note?: string;
}

export interface NarrativeCandidate {
  name: string;
  chainId: string;
  symbol?: string;
  narrative: string;
  discussion: string;
  resonance: string;
  onchain: string;
  url?: string;
}

export interface RejectedNoise {
  name: string;
  reason: string;
}

export interface MemeScanResult {
  provider: MemeProviderKind;
  standardLine: string;
  chainRanking: ChainVolumeRow[];
  newPools: NewPoolSignal[];
  passed: NarrativeCandidate[];
  rejected: RejectedNoise[];
  emptyReason?: string;
}
