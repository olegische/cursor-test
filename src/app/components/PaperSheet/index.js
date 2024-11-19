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
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const { triggerUpdate } = useStory();
  const [title, setTitle] = useState('');
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [displayTitle, setDisplayTitle] = useState('');

  const eraseText = async (text) => {
    setIsErasing(true);
    let currentText = text;
    while (currentText.length > 0) {
      currentText = currentText.slice(0, -1);
      setDisplayPrompt(currentText);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    setIsErasing(false);
    setPrompt('');
  };

  const animateText = async (text, setter, delay = 30) => {
    let current = '';
    for (let i = 0; i < text.length; i++) {
      current += text[i];
      setter(current);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

  const generateTitle = async (content) => {
    setIsGeneratingTitle(true);
    setDisplayTitle('Придумываю название...');

    try {
      const response = await fetch('/api/generateTitle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to generate title');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let titleText = '';

      await animateText('', setDisplayTitle);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        titleText += chunk;
        setTitle(titleText);
        setDisplayTitle(titleText);
      }

    } catch (error) {
      console.error('Error:', error);
      setDisplayTitle('Ошибка генерации названия');
    } finally {
      setIsGeneratingTitle(false);
    }
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

        await generateTitle(storyText);

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
    setTitle('');
    setDisplayTitle('');
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

  const Cursor = () => (
    <motion.div
      className="inline-block w-2 h-5 bg-blue-500 ml-0.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{
        repeat: Infinity,
        duration: 1,
        times: [0, 0.2, 0.8, 1]
      }}
    />
  );

  return (
    <motion.div 
      className="w-full bg-paper rounded-lg shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {storyMeta && (
        <motion.div 
          className="meta-container"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-sm font-medium">
            История #{storyMeta.number}
          </div>
          <div className="meta-center text-sm">
            {storyMeta.createdAt.toLocaleString()}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">{storyMeta.model}</span>
            {savedStoryId && (
              <a 
                href={`/story/${savedStoryId}`} 
                className="share-button"
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
                <span className="text-xs">Поделиться</span>
              </a>
            )}
          </div>
        </motion.div>
      )}

      <div className="p-6">
        {(displayTitle || isGeneratingTitle) && (
          <motion.div 
            className="mb-4 text-lg font-neucha leading-snug"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="whitespace-pre-wrap break-words max-w-full">
              {displayTitle}
              {isGeneratingTitle && <Cursor />}
            </div>
          </motion.div>
        )}

        <div className="relative">
          <div className={`w-full p-4 text-lg border rounded-lg min-h-[120px] bg-white
            ${story ? 'story-text' : 'font-neucha'} transition-all duration-200 hover:border-gray-300`}
          >
            <span>{story || displayPrompt}</span>
            {!story && !isGenerating && isFocused && <Cursor />}
          </div>
          <textarea
            ref={textareaRef}
            value={story || displayPrompt}
            onChange={(e) => !story && setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="О чем вы хотите услышать историю? Нажмите Enter для генерации"
            className="absolute inset-0 w-full h-full p-4 text-lg opacity-0"
            disabled={isGenerating || isErasing}
          />
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
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Новая история
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 