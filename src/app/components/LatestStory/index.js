'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function LatestStory() {
  const [latestStory, setLatestStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestStory = async () => {
      try {
        const response = await fetch('/api/getLatestStory');
        if (response.ok) {
          const data = await response.json();
          setLatestStory(data);
        }
      } catch (error) {
        console.error('Error fetching latest story:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestStory();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Загрузка последней истории...</div>;
  }

  if (!latestStory) {
    return null;
  }

  return (
    <motion.div
      className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-sm text-gray-500 mb-2">
        Последняя сохраненная история #{latestStory.number}
      </div>
      <h2 className="text-xl font-bold mb-4">{latestStory.title}</h2>
      <div className="story-text">{latestStory.content}</div>
      <div className="mt-4 text-sm text-gray-500">
        <div>Промпт: {latestStory.prompt}</div>
        <div>Дата создания: {new Date(latestStory.createdAt).toLocaleString()}</div>
        <div>Модель: {latestStory.model}</div>
      </div>
    </motion.div>
  );
} 