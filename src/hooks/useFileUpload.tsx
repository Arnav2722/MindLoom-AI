import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const { maxSize = 10, allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] } = options;
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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        // For other file types, we'll read as text for now
        // In a real app, you'd use proper PDF/DOCX parsers
        reader.readAsText(file);
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