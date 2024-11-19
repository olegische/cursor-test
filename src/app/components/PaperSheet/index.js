'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStory } from '../../context/StoryContext';

export default function PaperSheet() {
  const [prompt, setPrompt] = useState('');
  const [displayPrompt, setDisplayPrompt] = useState('');
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [savedStoryId, setSavedStoryId] = useState(null);
  const [storyMeta, setStoryMeta] = useState(null);
  const textareaRef = useRef(null);
  const { triggerUpdate } = useStory();

  const eraseText = async (text) => {
    setIsErasing(true);
    let currentText = text;
    while (currentText.length > 0) {
      currentText = currentText.slice(0, -1);
      setDisplayPrompt(currentText);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    setIsErasing(false);
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!prompt.trim() || isGenerating || isErasing) return;
      
      await eraseText(prompt);
      
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
          setStoryMeta({
            number: savedStory.number,
            createdAt: new Date(savedStory.createdAt),
            model: savedStory.model
          });
          triggerUpdate();
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleReset = () => {
    setPrompt('');
    setDisplayPrompt('');
    setStory('');
    setSavedStoryId(null);
    setStoryMeta(null);
  };

  useEffect(() => {
    if (!isErasing) {
      setDisplayPrompt(prompt);
    }
  }, [prompt, isErasing]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [story, displayPrompt]);

  return (
    <motion.div 
      className="w-full bg-paper rounded-lg shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {storyMeta && (
        <motion.div 
          className="mb-4 text-sm text-gray-500 font-mono flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span>#{storyMeta.number}</span>
          <span>·</span>
          <span>{storyMeta.createdAt.toLocaleString()}</span>
          <span>·</span>
          <span>{storyMeta.model}</span>
          {savedStoryId && (
            <>
              <span>·</span>
              <a 
                href={`/story/${savedStoryId}`} 
                className="text-blue-500 hover:text-blue-600 transition-colors"
                title="Поделиться историей"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-4 h-4"
                >
                  <path fillRule="evenodd" d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z" clipRule="evenodd" />
                </svg>
              </a>
            </>
          )}
        </motion.div>
      )}

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={story || displayPrompt}
          onChange={(e) => !story && setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="О чем вы хотите услышать историю? Нажмите Enter для генерации"
          className={`w-full p-4 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
            ${story ? 'story-text' : 'font-neucha'} min-h-[120px]`}
          disabled={isGenerating || isErasing}
          style={{ overflow: 'hidden' }}
        />
        <AnimatePresence>
          {(isGenerating || isErasing) && (
            <motion.div
              className="absolute right-4 top-4 w-1 h-6 bg-blue-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1,
              }}
            />
          )}
        </AnimatePresence>
      </div>
      
      {story && (
        <motion.div 
          className="mt-4 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Новая история
          </button>
        </motion.div>
      )}
    </motion.div>
  );
} 