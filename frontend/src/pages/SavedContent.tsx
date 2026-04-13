import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Alert,
  Switch,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchScripts, toggleSaveScript } from "../api/client";
import type { Script } from "../api/client";
import ScriptCard from "../components/ScriptCard";

export default function SavedContent() {
  const [savedOnly, setSavedOnly] = useState(true);
  const queryClient = useQueryClient();

  const { data: scripts = [], isLoading, isError } = useQuery<Script[]>({
    queryKey: ["scripts", savedOnly],
    queryFn: () => fetchScripts(savedOnly),
  });

  return (
    <VStack align="stretch" gap={6} maxW="860px" mx="auto">
      {/* Header */}
      <HStack justify="space-between" wrap="wrap">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.50">
            📚 Saved Content
          </Text>
          <Text fontSize="sm" color="gray.400" mt={1}>
            Your library of generated video scripts and ideas.
          </Text>
        </Box>

        <HStack gap={3}>
          <Text fontSize="sm" color="gray.400">
            Saved only
          </Text>
          <Switch.Root
            checked={savedOnly}
            onCheckedChange={(e) => setSavedOnly(e.checked)}
            colorPalette="brand"
          >
            <Switch.HiddenInput />
            <Switch.Control />
          </Switch.Root>
        </HStack>
      </HStack>

      {/* Content */}
      {isLoading && (
        <HStack justify="center" py={10}>
          <Spinner color="brand.400" />
          <Text color="gray.400">Loading scripts…</Text>
        </HStack>
      )}

      {isError && (
        <Alert.Root status="error" borderRadius="xl">
          <Alert.Indicator />
          <Alert.Description>
            Failed to load scripts. Make sure the backend is running.
          </Alert.Description>
        </Alert.Root>
      )}

      {!isLoading && !isError && scripts.length === 0 && (
        <Box textAlign="center" py={12}>
          <Text fontSize="3xl" mb={3}>📝</Text>
          <Text color="gray.400">
            {savedOnly
              ? "No saved scripts yet. Go to Script Studio and save some!"
              : "No scripts generated yet. Head to Script Studio to create one."}
          </Text>
        </Box>
      )}

      {!isLoading && scripts.length > 0 && (
        <VStack gap={3} align="stretch">
          {scripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </VStack>
      )}
    </VStack>
  );
}
