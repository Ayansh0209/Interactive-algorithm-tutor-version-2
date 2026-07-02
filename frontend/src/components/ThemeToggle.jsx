// Light/dark toggle button. Reads/writes the theme via ThemeContext.

import { useTheme } from "../contexts/ThemeContext";
import { IconButton, Icon } from "./ui";

export default function ThemeToggle({ size = "md" }) {
  const { isDark, toggle } = useTheme();
  return (
    <IconButton size={size} title={isDark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggle}>
      <Icon name={isDark ? "sun" : "moon"} size={17} />
    </IconButton>
  );
}
