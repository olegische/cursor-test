'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStory } from '../../context/StoryContext';

export default function LastStory() {
  const [previousStory, setPreviousStory] = useState(null);
  const { lastStoryUpdate } = useStory();

  useEffect(() => {
    const fetchPreviousStory = async () => {
      try {
        const response = await fetch('/api/getPreviousStory');
        if (response.ok) {
          const data = await response.json();
          setPreviousStory(data);
        }
      } catch (error) {
        console.error('Error fetching previous story:', error);
      }
    };

    fetchPreviousStory();
  }, [lastStoryUpdate]);

  if (!previousStory) return null;

  return (
    <motion.div 
      className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 mt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-sm text-gray-500 mb-4">
        <div>Предыдущая история #{previousStory.number}</div>
        <div>Создана: {new Date(previousStory.createdAt).toLocaleString()}</div>
        <div>Модель: {previousStory.model}</div>
      </div>
      <div className="story-text">{previousStory.content}</div>
      <div className="mt-4 text-sm text-gray-500">
        <div>Промпт: {previousStory.prompt}</div>
      </div>
    </motion.div>
  );
} 