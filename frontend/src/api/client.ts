import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Types ---------------------------------------------------------------

export interface Trend {
  id: number;
  title: string;
  platform: "youtube" | "tiktok" | "reels" | "google";
  score: number;
  category?: string;
  view_count?: number;
  tags?: string[];
  collected_at: string;
  raw_data?: Record<string, unknown>;
}

export interface Script {
  id: number;
  trend_id?: number;
  title: string;
  hook?: string;
  script_body?: string;
  thumbnail_suggestion?: string;
  estimated_duration?: string;
  hashtags?: string[];
  platform?: string;
  niche?: string;
  created_at: string;
  is_saved: boolean;
}

export interface GenerateScriptRequest {
  trend_id?: number;
  topic?: string;
  niche?: string;
  platform?: string;
}

// ---- Trends API ----------------------------------------------------------

export const fetchTrends = async (platform?: string): Promise<Trend[]> => {
  const params = platform ? { platform } : {};
  const { data } = await apiClient.get<Trend[]>("/trends/", { params });
  return data;
};

export const triggerCollection = async (): Promise<{ status: string; saved: number }> => {
  const { data } = await apiClient.post("/trends/collect");
  return data;
};

// ---- Scripts API ---------------------------------------------------------

export const fetchScripts = async (savedOnly = false): Promise<Script[]> => {
  const { data } = await apiClient.get<Script[]>("/scripts/", {
    params: { saved_only: savedOnly },
  });
  return data;
};

export const generateScript = async (req: GenerateScriptRequest): Promise<Script> => {
  const { data } = await apiClient.post<Script>("/scripts/generate", req);
  return data;
};

export const toggleSaveScript = async (scriptId: number): Promise<Script> => {
  const { data } = await apiClient.patch<Script>(`/scripts/${scriptId}/save`);
  return data;
};
