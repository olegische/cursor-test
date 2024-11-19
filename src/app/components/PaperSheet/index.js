'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStory } from '../../context/StoryContext';

export default function PaperSheet() {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedStoryId, setSavedStoryId] = useState(null);
  const { triggerUpdate } = useStory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generateStory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate story');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let storyText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        storyText += chunk;
        setStory(storyText);
      }

      // Сохраняем историю после генерации
      const saveResponse = await fetch('/api/saveStory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Новая история',
          content: storyText,
          prompt: prompt,
          model: 'mistralai/mixtral-8x7b-instruct',
        }),
      });

      if (saveResponse.ok) {
        const savedStory = await saveResponse.json();
        setSavedStoryId(savedStory.id);
        triggerUpdate(); // Триггерим обновление последней истории
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setStory('');
    setSavedStoryId(null);
  };

  return (
    <motion.div 
      className="w-full bg-white rounded-lg shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="О чем вы хотите услышать историю?"
          className="w-full p-4 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={isGenerating}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isGenerating ? 'Генерация...' : 'Создать историю'}
          </button>
          {story && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Новая история
            </button>
          )}
        </div>
      </form>
      
      {story && (
        <motion.div 
          className="mt-6 p-4 bg-gray-50 rounded-lg story-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {savedStoryId && (
            <div className="text-sm text-gray-500 mb-2">
              История сохранена. ID: {savedStoryId}
            </div>
          )}
          {story}
        </motion.div>
      )}
    </motion.div>
  );
} 