import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Textarea,
  Badge,
  Separator,
  Field,
  NativeSelect,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateScript, toggleSaveScript } from "../api/client";
import type { Script, Trend } from "../api/client";

const NICHES = [
  "Football curiosities",
  "Tech reviews",
  "Health & wellness",
  "Finance tips",
  "Humor & memes",
  "Travel",
  "Cooking",
  "Gaming",
  "General",
];

const PLATFORMS = ["youtube", "tiktok", "reels"];

export default function ScriptStudio() {
  const location = useLocation();
  const queryClient = useQueryClient();

  // Pre-fill topic if navigated from a TrendCard
  const incomingTrend = (location.state as { trend?: Trend } | null)?.trend;

  const [topic, setTopic] = useState(incomingTrend?.title ?? "");
  const [trendId, setTrendId] = useState<number | undefined>(incomingTrend?.id);
  const [niche, setNiche] = useState("Football curiosities");
  const [platform, setPlatform] = useState("youtube");
  const [result, setResult] = useState<Script | null>(null);

  // Update fields if navigating here with a different trend
  useEffect(() => {
    if (incomingTrend) {
      setTopic(incomingTrend.title);
      setTrendId(incomingTrend.id);
    }
  }, [incomingTrend?.id]);

  const generateMutation = useMutation({
    mutationFn: generateScript,
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["scripts"] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (id: number) => toggleSaveScript(id),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["scripts"] });
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({ topic, trend_id: trendId, niche, platform });
  };

  return (
    <VStack align="stretch" gap={6} maxW="860px" mx="auto">
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" color="gray.50">
          ✍️ Script Studio
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Generate AI-powered video scripts using your local Ollama model.
        </Text>
      </Box>

      {/* Form */}
      <Box bg="gray.900" borderRadius="xl" p={5} border="1px solid" borderColor="gray.800">
        <VStack gap={4} align="stretch">
          <Field.Root>
            <Field.Label fontSize="sm" color="gray.300">
              Topic / Trend
            </Field.Label>
            <Input
              placeholder="e.g. Best goals of the week — Ronaldo vs Messi"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setTrendId(undefined); // clear FK when manually typing
              }}
              bg="gray.800"
              border="1px solid"
              borderColor="gray.700"
              _focus={{ borderColor: "brand.500" }}
              color="gray.100"
            />
          </Field.Root>

          <HStack gap={4} wrap="wrap">
            <Field.Root flex={1} minW="160px">
              <Field.Label fontSize="sm" color="gray.300">
                Niche / Category
              </Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  bg="gray.800"
                  borderColor="gray.700"
                  color="gray.100"
                >
                  {NICHES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root flex={1} minW="140px">
              <Field.Label fontSize="sm" color="gray.300">
                Platform
              </Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  bg="gray.800"
                  borderColor="gray.700"
                  color="gray.100"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
          </HStack>

          <Button
            colorScheme="brand"
            onClick={handleGenerate}
            loading={generateMutation.isPending}
            loadingText="Generating with Ollama…"
            disabled={!topic.trim()}
          >
            🤖 Generate Script
          </Button>

          {generateMutation.isError && (
            <Text color="red.400" fontSize="sm">
              Error generating script. Make sure Ollama is running (
              <code>ollama serve</code>).
            </Text>
          )}
        </VStack>
      </Box>

      {/* Result */}
      {result && (
        <Box bg="gray.900" borderRadius="xl" p={5} border="1px solid" borderColor="brand.700">
          <VStack align="stretch" gap={4}>
            <HStack justify="space-between" wrap="wrap">
              <Text fontWeight="bold" fontSize="lg" color="gray.50">
                {result.title}
              </Text>
              <Button
                size="sm"
                colorScheme="brand"
                variant={result.is_saved ? "solid" : "outline"}
                loading={saveMutation.isPending}
                onClick={() => saveMutation.mutate(result.id)}
              >
                {result.is_saved ? "★ Saved" : "☆ Save Script"}
              </Button>
            </HStack>

            <Separator borderColor="gray.700" />

            {/* Hook */}
            <Box bg="gray.800" borderRadius="md" px={4} py={3}>
              <Text fontSize="xs" color="brand.300" fontWeight="bold" mb={2}>
                🎬 HOOK (First 3 seconds)
              </Text>
              <Text fontSize="sm" color="gray.200" fontStyle="italic">
                "{result.hook}"
              </Text>
            </Box>

            {/* Full Script */}
            <Box>
              <Text fontSize="xs" color="gray.400" fontWeight="bold" mb={2}>
                📄 FULL SCRIPT
              </Text>
              <Textarea
                value={result.script_body ?? ""}
                readOnly
                rows={12}
                bg="gray.800"
                borderColor="gray.700"
                color="gray.200"
                fontSize="sm"
                resize="vertical"
              />
            </Box>

            {/* Thumbnail + Duration */}
            <HStack gap={4} wrap="wrap">
              {result.thumbnail_suggestion && (
                <Box flex={1} minW="200px">
                  <Text fontSize="xs" color="gray.400" fontWeight="bold" mb={1}>
                    🖼️ THUMBNAIL TEXT
                  </Text>
                  <Text fontSize="sm" color="yellow.300" fontWeight="semibold">
                    {result.thumbnail_suggestion}
                  </Text>
                </Box>
              )}
              {result.estimated_duration && (
                <Box>
                  <Text fontSize="xs" color="gray.400" fontWeight="bold" mb={1}>
                    ⏱️ DURATION
                  </Text>
                  <Badge colorScheme="green">{result.estimated_duration}</Badge>
                </Box>
              )}
            </HStack>

            {/* Hashtags */}
            {result.hashtags && result.hashtags.length > 0 && (
              <Box>
                <Text fontSize="xs" color="gray.400" fontWeight="bold" mb={2}>
                  🏷️ HASHTAGS
                </Text>
                <Text fontSize="sm" color="brand.300">
                  {result.hashtags.join(" ")}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </VStack>
  );
}
