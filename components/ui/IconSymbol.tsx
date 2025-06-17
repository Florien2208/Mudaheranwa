import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<
  SymbolViewProps["name"],
  ComponentProps<typeof MaterialIcons>["name"]
>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Existing icons
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chart.bar.fill": "bar-chart",
  "person.3.fill": "people",
  "books.vertical.fill": "library-books",
  "bell.fill": "notifications",
  "star.fill": "star",
  "person.fill": "person",
  "pause.fill": "pause",
  "backward.fill": "fast-rewind",
  "forward.fill": "fast-forward",

  // New icon mappings for LibraryScreen
  "music.note": "music-note",
  "music.note.list": "queue-music",
  "play.fill": "play-arrow",
  "heart.fill": "favorite",
  waveform: "equalizer",
  "doc.text": "description",
  "chart.bar": "bar-chart",
  "exclamationmark.triangle": "warning",
  plus: "add",
  pencil: "edit",
  trash: "delete",
  "arrow.up": "arrow-upward",
  xmark: "close",
  photo: "photo",
  clock: "access-time",
  play: "play-arrow",
  "bubble.left.fill": "chat",
  calendar: "event",
  "person.2.fill": "group",
  "dollarsign.circle.fill": "monetization-on",
  "arrow.up.circle": "cloud-upload",
  "dollarsign.square": "account-balance-wallet",
  "megaphone.fill": "campaign",
  "person.badge.plus": "person-add",
  "dollarsign.circle": "payments",
  "text.bubble": "comment",
  "person.crop.circle": "account-circle",
  // Account screen icon mappings

  creditcard: "credit-card",
  "creditcard.fill": "credit-card",
  "lock.fill": "lock",
  "questionmark.circle": "help",
  "info.circle": "info",
  "book.fill": "menu-book",
  headphones: "headphones",
  "phone.fill": "phone",
  globe: "public",
  "map.fill": "map",
  "person.circle": "account-circle",
  "crown.fill": "workspace-premium", // Premium/pro icon
  "checkmark.circle.fill": "check-circle",
  "xmark.circle": "cancel",
  "chevron.left": "chevron-left",
  gear: "settings",
  "play.rectangle.fill": "smart-display",
  "sun.max.fill": "light-mode",
  "moon.fill": "dark-mode",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // Add fallback for icons not in mapping
  const iconName = MAPPING[name] || "help";

  return (
    <MaterialIcons color={color} size={size} name={iconName} style={style} />
  );
}
