// client/src/theme/CustomThemeProvider.js
import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getDesignTokens } from './theme';

const ColorModeContext = createContext();

export const CustomThemeProvider = ({ children }) => {
  // On init, attempt to read 'mode' from localStorage (default to 'light' if none).
  const [mode, setMode] = useState(() => {
    const storedMode = localStorage.getItem('colorMode');
    return storedMode || 'light';
  });

  // When mode changes, store it in localStorage.
  useEffect(() => {
    localStorage.setItem('colorMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

// Hook to use the color mode
export const useColorMode = () => useContext(ColorModeContext);
