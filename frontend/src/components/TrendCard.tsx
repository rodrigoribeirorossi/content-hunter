import {
  Box,
  Badge,
  Text,
  HStack,
  VStack,
  Button,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import type { Trend } from "../api/client";

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "red",
  tiktok: "gray",
  reels: "purple",
  google: "blue",
};

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  reels: "Reels",
  google: "Google",
};

function scoreColor(score: number): string {
  if (score >= 70) return "green";
  if (score >= 40) return "yellow";
  return "red";
}

function formatViews(count?: number): string {
  if (!count) return "";
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K views`;
  return `${count} views`;
}

interface TrendCardProps {
  trend: Trend;
  onGenerateScript?: (trend: Trend) => void;
}

export default function TrendCard({ trend, onGenerateScript }: TrendCardProps) {
  return (
    <Box
      bg="gray.900"
      border="1px solid"
      borderColor="gray.800"
      borderRadius="xl"
      p={4}
      _hover={{ borderColor: "brand.500", shadow: "lg" }}
      transition="all 0.2s"
    >
      <VStack align="stretch" gap={3}>
        {/* Platform + Score row */}
        <HStack justify="space-between">
          <Badge colorScheme={PLATFORM_COLORS[trend.platform] ?? "gray"} borderRadius="full" px={3}>
            {PLATFORM_LABELS[trend.platform] ?? trend.platform}
          </Badge>
          <Badge colorScheme={scoreColor(trend.score)} borderRadius="full" px={2}>
            {trend.score.toFixed(0)} / 100
          </Badge>
        </HStack>

        {/* Title */}
        <Text fontWeight="semibold" fontSize="sm" color="gray.100" lineClamp={2}>
          {trend.title}
        </Text>

        {/* View count */}
        {trend.view_count ? (
          <Text fontSize="xs" color="gray.400">
            {formatViews(trend.view_count)}
          </Text>
        ) : null}

        {/* Tags */}
        {trend.tags && trend.tags.length > 0 && (
          <Wrap gap={1}>
            {trend.tags.slice(0, 4).map((tag) => (
              <WrapItem key={tag}>
                <Badge
                  variant="subtle"
                  colorScheme="gray"
                  borderRadius="full"
                  fontSize="xs"
                  px={2}
                >
                  #{tag}
                </Badge>
              </WrapItem>
            ))}
          </Wrap>
        )}

        {/* Action */}
        <Button
          size="sm"
          variant="outline"
          colorScheme="brand"
          onClick={() => onGenerateScript?.(trend)}
        >
          ✍️ Generate Script
        </Button>
      </VStack>
    </Box>
  );
}
