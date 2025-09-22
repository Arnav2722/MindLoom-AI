import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadOptions {
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

interface UploadedFile {
  file: File;
  content: string;
  type: 'text' | 'pdf' | 'document';
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const { maxSize = 15, allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] } = options;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Allowed types: ${allowedTypes.join(', ')}`;
    }
    
    return null;
  }, [maxSize, allowedTypes]);

  const readFileContent = useCallback(async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (file.type === 'text/plain' || file.type === 'application/json') {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        } else if (file.type === 'application/pdf' || file.type.includes('word') || file.type.includes('document')) {
          // For PDF/DOCX files, use server-side processing
          try {
            const formData = new FormData();
            formData.append('file', file);
            
            const { data, error } = await supabase.functions.invoke('file-processor', {
              body: formData
            });
            
            if (error || !data?.success) {
              throw new Error(data?.error || 'Server processing failed');
            }
            
            resolve(data.extractedText || `Processed ${file.name}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
          } catch (serverError) {
            // Fallback to basic client-side extraction
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
            
            if (file.type === 'application/pdf') {
              const textMatches = text.match(/BT[\s\S]*?ET/g) || [];
              let extractedText = '';
              for (const match of textMatches) {
                const textContent = match.match(/\(([^)]+)\)/g);
                if (textContent) {
                  extractedText += textContent.map(t => t.slice(1, -1)).join(' ') + '\n';
                }
              }
              resolve(extractedText || `PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)\nBasic extraction - upload for full processing`);
            } else {
              const xmlMatches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
              const extractedText = xmlMatches.map(match => match.replace(/<[^>]*>/g, '')).join(' ').trim();
              resolve(extractedText || `DOCX: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)\nBasic extraction - upload for full processing`);
            }
          }
        } else {
          // For other file types, provide metadata
          resolve(`File: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nThis file type requires specialized processing.`);
        }
      } catch (error) {
        reject(new Error(`Failed to process ${file.name}: ${error.message}`));
      }
    });
  }, []);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setIsUploading(true);
    
    try {
      const processedFiles: UploadedFile[] = [];
      
      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          toast({
            title: "Invalid File",
            description: validationError,
            variant: "destructive",
          });
          continue;
        }
        
        try {
          const content = await readFileContent(file);
          const fileType = file.type.includes('pdf') ? 'pdf' : 
                          file.type.includes('word') ? 'document' : 'text';
          
          processedFiles.push({
            file,
            content,
            type: fileType,
          });
        } catch (error) {
          toast({
            title: "File Read Error",
            description: `Failed to read ${file.name}`,
            variant: "destructive",
          });
        }
      }
      
      setUploadedFiles(prev => [...prev, ...processedFiles]);
      
      if (processedFiles.length > 0) {
        toast({
          title: "Files Uploaded",
          description: `Successfully uploaded ${processedFiles.length} file(s)`,
        });
      }
      
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, readFileContent, toast]);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  return {
    uploadFiles,
    removeFile,
    clearFiles,
    uploadedFiles,
    isUploading,
    validateFile,
  };
}