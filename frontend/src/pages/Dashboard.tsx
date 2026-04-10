import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  HStack,
  VStack,
  Text,
  Button,
  Spinner,
  Alert,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { fetchTrends } from "../api/client";
import type { Trend } from "../api/client";
import TrendCard from "../components/TrendCard";
import TrendChart from "../components/TrendChart";

const PLATFORMS = [
  { key: "all", label: "All" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "reels", label: "Reels" },
  { key: "google", label: "Google" },
];

export default function Dashboard() {
  const [activePlatform, setActivePlatform] = useState("all");
  const navigate = useNavigate();

  const { data: trends = [], isLoading, isError } = useQuery<Trend[]>({
    queryKey: ["trends", activePlatform],
    queryFn: () => fetchTrends(activePlatform === "all" ? undefined : activePlatform),
  });

  const handleGenerateScript = (trend: Trend) => {
    navigate("/studio", { state: { trend } });
  };

  return (
    <VStack align="stretch" gap={6}>
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" color="gray.50">
          🔥 Trending Now
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Latest trends collected from YouTube, TikTok, Reels and Google.
        </Text>
      </Box>

      {/* Platform filter */}
      <HStack gap={2} wrap="wrap">
        {PLATFORMS.map(({ key, label }) => (
          <Button
            key={key}
            size="sm"
            variant={activePlatform === key ? "solid" : "outline"}
            colorScheme={activePlatform === key ? "brand" : "gray"}
            borderRadius="full"
            onClick={() => setActivePlatform(key)}
          >
            {label}
          </Button>
        ))}
      </HStack>

      {/* Chart */}
      <TrendChart trends={trends} />

      {/* Trend grid */}
      {isLoading && (
        <HStack justify="center" py={10}>
          <Spinner color="brand.400" />
          <Text color="gray.400">Loading trends…</Text>
        </HStack>
      )}

      {isError && (
        <Alert.Root status="error" borderRadius="xl">
          <Alert.Indicator />
          <Alert.Description>
            Failed to load trends. Make sure the backend is running on port 8000.
          </Alert.Description>
        </Alert.Root>
      )}

      {!isLoading && !isError && trends.length === 0 && (
        <Box textAlign="center" py={12}>
          <Text fontSize="3xl" mb={3}>📡</Text>
          <Text color="gray.400">No trends yet. Click "Collect Now" to gather data.</Text>
        </Box>
      )}

      {!isLoading && trends.length > 0 && (
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
          gap={4}
        >
          {trends.map((trend) => (
            <TrendCard
              key={trend.id}
              trend={trend}
              onGenerateScript={handleGenerateScript}
            />
          ))}
        </Grid>
      )}
    </VStack>
  );
}
