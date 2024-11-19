'use client';

import { createContext, useContext, useState } from 'react';

const StoryContext = createContext();

export function StoryProvider({ children }) {
  const [lastStoryUpdate, setLastStoryUpdate] = useState(0);

  const triggerUpdate = () => {
    setLastStoryUpdate(Date.now());
  };

  return (
    <StoryContext.Provider value={{ lastStoryUpdate, triggerUpdate }}>
      {children}
    </StoryContext.Provider>
  );
}

export function useStory() {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
} 