const tintColorLight = "#00bcd4"; // Deeper cyan for contrast
const tintColorDark = "#9effff"; // Glow for dark mode

export const Colors = {
  light: {
    text: "#004e5a", // Dark teal for text visibility
    background: "#e0f7fa", // Soft cyan background
    tint: tintColorLight,
    icon: "#007c91", // Mid cyan for icons
    tabIconDefault: "#007c91",
    tabIconSelected: tintColorLight,
    border: "#b2ebf2", // Lighter border color
    secondaryText: "#006064", // Slightly lighter than text for secondary elements
    tabBackgroundColor: "#ffffff",
  },
  dark: {
    text: "#c2fcff",
    background: "#0b1c26",
    tint: tintColorDark,
    icon: "#69d2e7",
    tabIconDefault: "#69d2e7",
    tabIconSelected: tintColorDark,
    border: "#143544", // Darker border color for dark mode
    secondaryText: "#8ceff5", // Slightly dimmer than text for secondary elements
    tabBackgroundColor: "#143544",
  },
};
