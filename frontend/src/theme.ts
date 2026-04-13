import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  globalCss: {
    body: {
      bg: "gray.950",
      color: "gray.50",
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#e8f4fd" },
          100: { value: "#c5e2fa" },
          200: { value: "#9ecef7" },
          300: { value: "#70b8f3" },
          400: { value: "#4aa7ef" },
          500: { value: "#2196eb" },
          600: { value: "#1a7bd4" },
          700: { value: "#1460b8" },
          800: { value: "#0d469c" },
          900: { value: "#062e80" },
        },
      },
    },
    semanticTokens: {
      colors: {
        "bg.canvas": {
          value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}" },
        },
        "bg.surface": {
          value: { _light: "white", _dark: "{colors.gray.900}" },
        },
        "bg.subtle": {
          value: { _light: "{colors.gray.100}", _dark: "{colors.gray.800}" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
