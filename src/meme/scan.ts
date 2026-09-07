import { applyNarrativeHardFilter } from "./filter.js";
import type {
  ChainVolumeRow,
  MemeProviderKind,
  MemeScanResult,
  NarrativeCandidate,
  NewPoolSignal,
} from "./types.js";

const STANDARD =
  "先有鏈下／社群討論、能持續共鳴；排除純熱榜、付費 boost、無二創、分身農場、一波流。對齊 PEPE／WIF／Neiro／哈基米／牛來（文化先於幣）。篩選：鏈量排名→高量鏈新池→敘事硬過濾。";

export async function scanMemeNarrative(
  provider: MemeProviderKind = "mock",
): Promise<MemeScanResult> {
  if (provider === "live") {
    return scanLive();
  }
  return scanMock();
}

function scanMock(): MemeScanResult {
  const chainRanking: ChainVolumeRow[] = [
    { chainId: "solana", label: "Solana", volumeUsd24h: 2_100_000_000 },
    { chainId: "bsc", label: "BNB Chain", volumeUsd24h: 1_400_000_000 },
    { chainId: "base", label: "Base", volumeUsd24h: 900_000_000 },
    { chainId: "ethereum", label: "Ethereum", volumeUsd24h: 800_000_000 },
  ];

  const newPools: NewPoolSignal[] = [
    {
      chainId: "bsc",
      pairAddress: "0xmock",
      baseSymbol: "牛来",
      quoteSymbol: "WBNB",
      volumeUsd24h: 4_200_000,
      liquidityUsd: 1_100_000,
      note: "mock",
    },
    {
      chainId: "solana",
      pairAddress: "mockpump",
      baseSymbol: "PUMPNOISE",
      quoteSymbol: "SOL",
      volumeUsd24h: 9_000_000,
      liquidityUsd: 200_000,
      note: "mock washy",
    },
  ];

  const hints: NarrativeCandidate[] = [
    {
      name: "牛来",
      chainId: "bsc",
      symbol: "牛来",
      narrative: "國產動畫翻車梗＋諧音牛市來了；電影→梗→鏈上（mock 範例）。",
      discussion: "中文社群與研究文持續覆蓋（mock）。",
      resonance: "上線後仍有輪動討論（mock）。",
      onchain: "mock pair on BNB；僅供格式測試",
    },
  ];

  const { passed, rejected } = applyNarrativeHardFilter(newPools, hints);
  return {
    provider: "mock",
    standardLine: STANDARD,
    chainRanking,
    newPools,
    passed,
    rejected,
  };
}

async function scanLive(): Promise<MemeScanResult> {
  const chainRanking = await fetchDexScreenerChainProxy();
  const newPools = await fetchDexScreenerNewPairs(chainRanking.slice(0, 3));
  const { passed, rejected } = applyNarrativeHardFilter(newPools, []);
  return {
    provider: "live",
    standardLine: STANDARD,
    chainRanking,
    newPools,
    passed,
    rejected,
    emptyReason:
      passed.length === 0
        ? "live 模式已抓鏈量／新池，但無足夠敘事證據通過硬過濾（可再人工補社群訊號）。"
        : undefined,
  };
}

async function fetchDexScreenerChainProxy(): Promise<ChainVolumeRow[]> {
  try {
    const res = await fetch("https://api.dexscreener.com/token-boosts/top/v1", {
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      return fallbackChains(`token-boosts HTTP ${res.status}`);
    }
    const data = (await res.json()) as Array<{ chainId?: string }>;
    const counts = new Map<string, number>();
    for (const row of data) {
      const id = row.chainId ?? "unknown";
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([chainId, score]) => ({
        chainId,
        label: chainId,
        volumeUsd24h: score * 1_000_000,
      }));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return fallbackChains(message);
  }
}

function fallbackChains(reason: string): ChainVolumeRow[] {
  return [
    {
      chainId: "solana",
      label: `Solana (fallback: ${reason})`,
      volumeUsd24h: 0,
    },
  ];
}

async function fetchDexScreenerNewPairs(
  topChains: ChainVolumeRow[],
): Promise<NewPoolSignal[]> {
  const out: NewPoolSignal[] = [];
  for (const chain of topChains) {
    try {
      const url = "https://api.dexscreener.com/token-profiles/latest/v1";
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) continue;
      const data = (await res.json()) as Array<{
        chainId?: string;
        tokenAddress?: string;
        url?: string;
        description?: string;
      }>;
      for (const row of data) {
        if (row.chainId !== chain.chainId) continue;
        out.push({
          chainId: row.chainId ?? chain.chainId,
          pairAddress: row.tokenAddress ?? "unknown",
          baseSymbol: (row.tokenAddress ?? "UNK").slice(0, 6),
          quoteSymbol: "?",
          volumeUsd24h: 0,
          liquidityUsd: 0,
          url: row.url,
          note: row.description?.slice(0, 80),
        });
        if (out.length >= 15) return out;
      }
    } catch {
      // keep going
    }
  }
  return out;
}
