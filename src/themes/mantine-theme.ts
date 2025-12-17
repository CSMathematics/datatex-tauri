import { createTheme, rem } from "@mantine/core";

export const mantineTheme = createTheme({
  primaryColor: "blue",
  defaultRadius: "sm",
  fontFamily: "Inter, sans-serif",
  colors: {
    dark: [
      "#C1C2C5", "#A6A7AB", "#909296", "#5c5f66", "#373A40",
      "#2C2E33", "#25262b", "#1A1B1E", "#141517", "#101113",
    ],
  },
  components: {
    Switch: {
      defaultProps: {
        thumbIcon: null 
      },
      styles: {
        root: { display: 'flex', alignItems: 'center' },
        track: {
          border: '1px solid #4A4B50', 
          backgroundColor: '#2C2E33', 
          cursor: 'pointer',
          height: rem(22),
          minWidth: rem(42), 
          padding: 2, 
          transition: 'background-color 0.2s, border-color 0.2s',
          '&[data-checked]': { 
            backgroundColor: 'var(--mantine-color-blue-6)',
            borderColor: 'var(--mantine-color-blue-6)',
          },
        },
        thumb: {
          height: rem(16), 
          width: rem(16),
          backgroundColor: '#fff', 
          borderRadius: '50%',
          border: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
        },
        label: { paddingLeft: 10, fontWeight: 500, color: '#C1C2C5' }
      }
    }
  }
});