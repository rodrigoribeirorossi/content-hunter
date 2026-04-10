import { Box, Flex, VStack, HStack, Text, Button, Icon } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdEditNote, MdBookmarks } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { triggerCollection } from "../api/client";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: MdDashboard },
  { label: "Script Studio", path: "/studio", icon: MdEditNote },
  { label: "Saved Content", path: "/saved", icon: MdBookmarks },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const queryClient = useQueryClient();

  const collectMutation = useMutation({
    mutationFn: triggerCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trends"] });
    },
  });

  return (
    <Flex minH="100vh" bg="gray.950">
      {/* Sidebar */}
      <Box
        w="240px"
        minH="100vh"
        bg="gray.900"
        borderRight="1px solid"
        borderColor="gray.800"
        p={4}
        flexShrink={0}
      >
        {/* Logo */}
        <Text
          fontSize="xl"
          fontWeight="bold"
          color="brand.400"
          mb={8}
          textAlign="center"
          letterSpacing="wide"
        >
          🎯 Content Hunter
        </Text>

        {/* Navigation */}
        <VStack gap={1} align="stretch">
          {NAV_ITEMS.map(({ label, path, icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link key={path} to={path} style={{ textDecoration: "none" }}>
                <HStack
                  px={3}
                  py={2}
                  borderRadius="md"
                  bg={isActive ? "brand.700" : "transparent"}
                  color={isActive ? "white" : "gray.400"}
                  _hover={{ bg: isActive ? "brand.700" : "gray.800", color: "white" }}
                  transition="all 0.15s"
                  gap={3}
                >
                  <Icon as={icon} boxSize={5} />
                  <Text fontSize="sm" fontWeight={isActive ? "semibold" : "normal"}>
                    {label}
                  </Text>
                </HStack>
              </Link>
            );
          })}
        </VStack>
      </Box>

      {/* Main area */}
      <Flex direction="column" flex={1} overflow="hidden">
        {/* Top bar */}
        <HStack
          px={6}
          py={3}
          bg="gray.900"
          borderBottom="1px solid"
          borderColor="gray.800"
          justify="space-between"
        >
          <Text fontSize="sm" color="gray.400">
            Analyze trends · Generate scripts · Grow your channel
          </Text>
          <Button
            size="sm"
            colorScheme="brand"
            loading={collectMutation.isPending}
            onClick={() => collectMutation.mutate()}
          >
            ⚡ Collect Now
          </Button>
        </HStack>

        {/* Page content */}
        <Box flex={1} p={6} overflowY="auto">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
