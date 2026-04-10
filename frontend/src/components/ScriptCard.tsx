import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Collapsible,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleSaveScript } from "../api/client";
import type { Script } from "../api/client";

interface ScriptCardProps {
  script: Script;
}

export default function ScriptCard({ script }: ScriptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: () => toggleSaveScript(script.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scripts"] });
    },
  });

  return (
    <Box
      bg="gray.900"
      border="1px solid"
      borderColor={script.is_saved ? "brand.600" : "gray.800"}
      borderRadius="xl"
      p={4}
      _hover={{ borderColor: "brand.500" }}
      transition="all 0.2s"
    >
      <VStack align="stretch" gap={3}>
        {/* Header */}
        <HStack justify="space-between" wrap="wrap">
          <VStack align="start" gap={1} flex={1}>
            <Text fontWeight="semibold" fontSize="sm" color="gray.100">
              {script.title}
            </Text>
            <HStack gap={2}>
              {script.platform && (
                <Badge colorScheme="blue" borderRadius="full" fontSize="xs">
                  {script.platform}
                </Badge>
              )}
              {script.niche && (
                <Badge colorScheme="purple" borderRadius="full" fontSize="xs">
                  {script.niche}
                </Badge>
              )}
              <Text fontSize="xs" color="gray.500">
                {new Date(script.created_at).toLocaleDateString("pt-BR")}
              </Text>
            </HStack>
          </VStack>

          <HStack gap={2}>
            <Button
              size="xs"
              variant={script.is_saved ? "solid" : "outline"}
              colorScheme="brand"
              loading={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {script.is_saved ? "★ Saved" : "☆ Save"}
            </Button>
            <Button
              size="xs"
              variant="ghost"
              colorScheme="gray"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "▲ Less" : "▼ More"}
            </Button>
          </HStack>
        </HStack>

        {/* Hook preview */}
        {script.hook && (
          <Box bg="gray.800" borderRadius="md" px={3} py={2}>
            <Text fontSize="xs" color="brand.300" fontWeight="semibold" mb={1}>
              Hook
            </Text>
            <Text fontSize="sm" color="gray.300" fontStyle="italic">
              "{script.hook}"
            </Text>
          </Box>
        )}

        {/* Expanded full script */}
        <Collapsible.Root open={expanded}>
          <Collapsible.Content>
            <VStack align="stretch" gap={3} pt={2}>
              {script.script_body && (
                <Box>
                  <Text fontSize="xs" color="gray.400" fontWeight="semibold" mb={1}>
                    Full Script
                  </Text>
                  <Text fontSize="sm" color="gray.300" whiteSpace="pre-wrap">
                    {script.script_body}
                  </Text>
                </Box>
              )}
              {script.thumbnail_suggestion && (
                <Box>
                  <Text fontSize="xs" color="gray.400" fontWeight="semibold" mb={1}>
                    Thumbnail
                  </Text>
                  <Text fontSize="sm" color="yellow.300">
                    {script.thumbnail_suggestion}
                  </Text>
                </Box>
              )}
              {script.hashtags && script.hashtags.length > 0 && (
                <Box>
                  <Text fontSize="xs" color="gray.400" fontWeight="semibold" mb={1}>
                    Hashtags
                  </Text>
                  <Text fontSize="sm" color="brand.300">
                    {script.hashtags.join(" ")}
                  </Text>
                </Box>
              )}
            </VStack>
          </Collapsible.Content>
        </Collapsible.Root>
      </VStack>
    </Box>
  );
}
