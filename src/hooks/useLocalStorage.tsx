import { useState, useEffect, useCallback } from 'react';

interface TransformationResult {
  id: string;
  url?: string;
  title: string;
  transformationType: string;
  result: any;
  timestamp: number;
  content?: string;
}

export function useLocalStorage() {
  const [transformationHistory, setTransformationHistory] = useState<TransformationResult[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mindloom-transformations');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTransformationHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load transformation history:', error);
    }
  }, []);

  // Save transformation result
  const saveTransformation = useCallback((
    url: string | undefined,
    title: string,
    transformationType: string,
    result: any,
    content?: string
  ) => {
    const newTransformation: TransformationResult = {
      id: Date.now().toString(),
      url,
      title,
      transformationType,
      result,
      timestamp: Date.now(),
      content,
    };

    setTransformationHistory(prev => {
      const updated = [newTransformation, ...prev.slice(0, 49)]; // Keep only 50 most recent
      try {
        localStorage.setItem('mindloom-transformations', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save transformation:', error);
      }
      return updated;
    });

    return newTransformation.id;
  }, []);

  // Get transformation by ID
  const getTransformation = useCallback((id: string) => {
    return transformationHistory.find(t => t.id === id);
  }, [transformationHistory]);

  // Delete transformation
  const deleteTransformation = useCallback((id: string) => {
    setTransformationHistory(prev => {
      const updated = prev.filter(t => t.id !== id);
      try {
        localStorage.setItem('mindloom-transformations', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to delete transformation:', error);
      }
      return updated;
    });
  }, []);

  // Clear all transformations
  const clearHistory = useCallback(() => {
    setTransformationHistory([]);
    try {
      localStorage.removeItem('mindloom-transformations');
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, []);

  // Export transformations
  const exportTransformations = useCallback(() => {
    const dataStr = JSON.stringify(transformationHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindloom-transformations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [transformationHistory]);

  return {
    transformationHistory,
    saveTransformation,
    getTransformation,
    deleteTransformation,
    clearHistory,
    exportTransformations,
  };
}