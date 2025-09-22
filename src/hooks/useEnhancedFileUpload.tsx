import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FileUploadOptions {
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

interface UploadedFile {
  id: string;
  file: File;
  content: string;
  type: 'text' | 'pdf' | 'document' | 'audio' | 'video' | 'image' | 'json';
  storagePath?: string;
  contentPreview?: string;
}

export function useEnhancedFileUpload(options: FileUploadOptions = {}) {
  const { 
    maxSize = 15, 
    allowedTypes = [
      'text/plain', 
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'application/json',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ] 
  } = options;
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const validateFile = useCallback(async (file: File): Promise<string | null> => {
    // File size validation (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      return 'File size must be less than 15MB';
    }
    
    // Empty file validation
    if (file.size === 0) {
      return 'File is empty';
    }
    
    // Type validation
    if (!allowedTypes.includes(file.type) && !allowedTypes.includes('*/*')) {
      return `File type ${file.type} is not supported. Allowed types: ${allowedTypes.join(', ')}`;
    }
    
    // File name validation
    if (file.name.length > 255) {
      return 'File name is too long (max 255 characters)';
    }
    
    // Enhanced security check for malicious files
    const suspiciousExtensions = [
      '.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.msi', '.dll', 
      '.app', '.deb', '.rpm', '.dmg', '.pkg', '.ps1', '.sh', '.vbs', 
      '.js', '.jar', '.apk', '.ipa'
    ];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (suspiciousExtensions.includes(fileExtension)) {
      return 'File type not allowed for security reasons';
    }
    
    // Content-based validation for common file types
    try {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // Check for common file signatures (magic numbers)
      if (file.type.startsWith('image/')) {
        const isValidImage = validateImageSignature(uint8Array, file.type);
        if (!isValidImage) {
          return 'Invalid image file format';
        }
      }
      
      if (file.type === 'application/pdf') {
        const isValidPdf = validatePdfSignature(uint8Array);
        if (!isValidPdf) {
          return 'Invalid PDF file format';
        }
      }
    } catch (error) {
      console.error('File validation error:', error);
      return 'Error validating file content';
    }
    
    return null;
  }, [allowedTypes]);

  const validateImageSignature = (bytes: Uint8Array, mimeType: string): boolean => {
    // Check for common image file signatures
    const signatures = {
      'image/jpeg': [[0xFF, 0xD8, 0xFF]],
      'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
      'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
      'image/webp': [[0x52, 0x49, 0x46, 0x46]]
    };

    const fileSignatures = signatures[mimeType as keyof typeof signatures];
    if (!fileSignatures) return true; // Allow if no signature check available

    return fileSignatures.some(signature => 
      signature.every((byte, index) => bytes[index] === byte)
    );
  };

  const validatePdfSignature = (bytes: Uint8Array): boolean => {
    // PDF files start with %PDF-
    const pdfSignature = [0x25, 0x50, 0x44, 0x46, 0x2D];
    return pdfSignature.every((byte, index) => bytes[index] === byte);
  };

  const getFileType = (file: File): UploadedFile['type'] => {
    if (file.type.includes('pdf')) return 'pdf';
    if (file.type.includes('word') || file.type.includes('document')) return 'document';
    if (file.type.includes('audio')) return 'audio';
    if (file.type.includes('video')) return 'video';
    if (file.type.includes('image')) return 'image';
    if (file.type.includes('json')) return 'json';
    return 'text';
  };

  const readFileContent = useCallback(async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (file.type === 'text/plain' || file.type === 'application/json' || file.type === 'text/csv') {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        } else if (file.type === 'application/pdf' || file.type.includes('word') || file.type.includes('document')) {
          // Use server-side processing for better extraction
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
            // Enhanced fallback extraction
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
            
            if (file.type === 'application/pdf') {
              let extractedText = '';
              const streamMatches = text.match(/stream([\s\S]*?)endstream/g) || [];
              
              for (const stream of streamMatches) {
                const textMatches = stream.match(/\(([^)]+)\)/g) || [];
                for (const match of textMatches) {
                  const cleanText = match.slice(1, -1)
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '\r')
                    .replace(/\\t/g, '\t')
                    .replace(/\\\\/g, '\\')
                    .replace(/\\\(/g, '(')
                    .replace(/\\\)/g, ')');
                  extractedText += cleanText + ' ';
                }
              }
              
              const tjMatches = text.match(/\(([^)]+)\)\s*Tj/g) || [];
              for (const match of tjMatches) {
                const textContent = match.match(/\(([^)]+)\)/)?.[1];
                if (textContent) {
                  extractedText += textContent + ' ';
                }
              }
              
              resolve(extractedText.trim() || `PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)\nBasic extraction - server processing recommended`);
            } else {
              const textMatches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
              const paragraphMatches = text.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
              
              let extractedText = '';
              for (const paragraph of paragraphMatches) {
                const pTextMatches = paragraph.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
                const paragraphText = pTextMatches
                  .map(match => match.replace(/<[^>]*>/g, ''))
                  .join('')
                  .trim();
                if (paragraphText) {
                  extractedText += paragraphText + '\n';
                }
              }
              
              resolve(extractedText.trim() || `DOCX: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)\nBasic extraction - server processing recommended`);
            }
          }
        } else if (file.type.includes('image')) {
          // For images, provide metadata and note OCR capability
          resolve(`Image: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nThis image can be processed for:\n• OCR text extraction\n• Visual content analysis\n• Object detection\n\nUpload to enable AI-powered image analysis.`);
        } else if (file.type.includes('audio')) {
          // For audio files, provide metadata
          resolve(`Audio: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nThis audio file can be processed for:\n• Speech-to-text transcription\n• Audio content analysis\n• Language detection\n\nUpload to enable AI-powered audio processing.`);
        } else if (file.type.includes('video')) {
          // For video files, provide metadata
          resolve(`Video: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nThis video file can be processed for:\n• Audio transcription\n• Visual content analysis\n• Scene detection\n\nUpload to enable AI-powered video processing.`);
        } else {
          // For other file types
          resolve(`File: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nThis file type requires specialized processing. Supported formats:\n• Documents: PDF, DOCX, TXT\n• Media: MP3, MP4, JPG, PNG\n• Data: JSON, CSV`);
        }
      } catch (error) {
        reject(new Error(`Failed to process ${file.name}: ${error.message}`));
      }
    });
  }, []);

  const uploadToStorage = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    try {
      const { error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (error) throw error;
      return fileName;
    } catch (error) {
      console.error('Storage upload error:', error);
      return null;
    }
  }, [user]);

  const saveFileRecord = useCallback(async (
    file: File,
    storagePath: string,
    contentPreview?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('file_uploads')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          content_preview: contentPreview
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Database insert error:', error);
      return null;
    }
  }, [user]);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setIsUploading(true);
    
    try {
      // Check daily upload limits for authenticated users
      if (user) {
        try {
          const totalSize = fileArray.reduce((total, file) => total + file.size, 0);
          const { data: canUpload, error } = await supabase.rpc('check_upload_limits', {
            p_file_size: totalSize
          });
          
          if (error || !canUpload) {
            toast({
              title: "Upload limit exceeded",
              description: "You have reached your daily upload limit. Please try again tomorrow.",
              variant: "destructive",
            });
            setIsUploading(false);
            return;
          }
        } catch (error) {
          console.error('Error checking upload limits:', error);
        }
      }

      const processedFiles: UploadedFile[] = [];
      
      // Validate file count (reduced for security)
      if (fileArray.length > 5) {
        toast({
          title: "Too Many Files",
          description: "Maximum 5 files allowed at once",
          variant: "destructive",
        });
        return;
      }
      
      for (const file of fileArray) {
        const validationError = await validateFile(file);
        if (validationError) {
          toast({
            title: "Invalid File",
            description: `${file.name}: ${validationError}`,
            variant: "destructive",
          });
          continue;
        }
        
        try {
          const content = await readFileContent(file);
          const fileType = getFileType(file);
          
          // Upload to storage if user is authenticated
          let storagePath: string | undefined;
          let fileId: string | null = null;
          
          if (user) {
            storagePath = await uploadToStorage(file);
            if (storagePath) {
              // Create content preview for text files
              const contentPreview = fileType === 'text' || fileType === 'json' 
                ? content.substring(0, 500) 
                : undefined;
              
              fileId = await saveFileRecord(file, storagePath, contentPreview);
            }
            
            if (!fileId) {
              toast({
                title: "Upload Failed",
                description: `Failed to save ${file.name} to database`,
                variant: "destructive",
              });
              continue;
            }
          } else {
            // For non-authenticated users, create a temporary ID
            fileId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            toast({
              title: "Limited Mode",
              description: "Sign in to save files permanently and access full features",
              variant: "default",
            });
          }
          
          processedFiles.push({
            id: fileId,
            file,
            content,
            type: fileType,
            storagePath,
            contentPreview: fileType === 'text' || fileType === 'json' ? content.substring(0, 500) : undefined
          });
        } catch (error) {
          console.error('File processing error:', error);
          toast({
            title: "File Processing Error",
            description: `Failed to process ${file.name}: ${error.message}`,
            variant: "destructive",
          });
        }
      }
      
      if (processedFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...processedFiles]);
        toast({
          title: "Files Processed",
          description: `Successfully processed ${processedFiles.length} file(s)`,
        });
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, readFileContent, uploadToStorage, saveFileRecord, toast, user]);

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