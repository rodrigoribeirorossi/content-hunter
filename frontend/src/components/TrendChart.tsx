import { Box, Text } from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Trend } from "../api/client";

interface TrendChartProps {
  trends: Trend[];
}

/**
 * Groups trends by platform and renders a multi-line chart showing
 * average scores over collection dates.
 */
export default function TrendChart({ trends }: TrendChartProps) {
  if (!trends.length) {
    return (
      <Box bg="gray.900" borderRadius="xl" p={6} textAlign="center">
        <Text color="gray.500" fontSize="sm">
          No trend data to display. Click "Collect Now" to gather trends.
        </Text>
      </Box>
    );
  }

  // Build date → platform → [scores] aggregation
  const dateMap: Record<string, Record<string, number[]>> = {};

  for (const t of trends) {
    const date = new Date(t.collected_at).toLocaleDateString("pt-BR");
    if (!dateMap[date]) dateMap[date] = {};
    if (!dateMap[date][t.platform]) dateMap[date][t.platform] = [];
    dateMap[date][t.platform].push(t.score);
  }

  const chartData = Object.entries(dateMap)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, platforms]) => {
      const entry: Record<string, string | number> = { date };
      for (const [platform, scores] of Object.entries(platforms)) {
        entry[platform] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
      return entry;
    });

  const platforms = [...new Set(trends.map((t) => t.platform))];
  const COLORS: Record<string, string> = {
    youtube: "#f87171",
    tiktok: "#a3e635",
    reels: "#c084fc",
    google: "#60a5fa",
  };

  return (
    <Box bg="gray.900" borderRadius="xl" p={5}>
      <Text fontWeight="semibold" mb={4} fontSize="sm" color="gray.300">
        Trend Scores Over Time
      </Text>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#f9fafb" }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
          {platforms.map((p) => (
            <Line
              key={p}
              type="monotone"
              dataKey={p}
              stroke={COLORS[p] ?? "#6b7280"}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
