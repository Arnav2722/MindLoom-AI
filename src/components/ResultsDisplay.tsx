import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Share2, 
  Copy, 
  ExternalLink, 
  Clock, 
  FileText,
  Brain,
  Headphones,
  Scale,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResultsDisplayProps {
  result: {
    transformedContent: string;
    transformationType: string;
    title: string;
    url?: string;
    timestamp?: number;
    relatedQuestions?: string[];
  };
  onClose?: () => void;
}

export function ResultsDisplay({ result, onClose }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState('content');
  const { toast } = useToast();

  const getTransformationIcon = (type: string) => {
    switch (type) {
      case 'summary': return FileText;
      case 'mindmap': return Brain;
      case 'podcast': return Headphones;
      case 'legal': return Scale;
      default: return FileText;
    }
  };

  const getTransformationLabel = (type: string) => {
    switch (type) {
      case 'summary': return 'Summary';
      case 'mindmap': return 'Mindmap';
      case 'podcast': return 'Podcast Script';
      case 'legal': return 'Legal Analysis';
      default: return 'Content';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.transformedContent);
      toast({
        title: "Copied to Clipboard",
        description: "Content has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result.transformedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${result.transformationType}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Your content is being downloaded",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: result.title,
          text: result.transformedContent.substring(0, 200) + '...',
          url: result.url,
        });
      } catch (error) {
        // Fallback to copy
        handleCopy();
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  const Icon = getTransformationIcon(result.transformationType);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-background brutal-border brutal-shadow-lg mb-8">
            <div className="p-6 border-b border-muted">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground brutal-border p-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black uppercase mb-2">
                      {getTransformationLabel(result.transformationType)} RESULT
                    </h1>
                    <h2 className="text-lg font-bold text-muted-foreground mb-2">
                      {result.title}
                    </h2>
                    {result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {result.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {result.timestamp && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="w-3 h-3" />
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                
                {onClose && (
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="p-6 flex flex-wrap gap-3">
              <Button variant="default" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="secondary" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="brutal-border mb-8">
              <TabsTrigger value="content">Transformed Content</TabsTrigger>
              {result.relatedQuestions && result.relatedQuestions.length > 0 && (
                <TabsTrigger value="questions">Related Questions</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="content">
              <Card className="brutal-border brutal-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {getTransformationLabel(result.transformationType)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {result.transformedContent}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {result.relatedQuestions && result.relatedQuestions.length > 0 && (
              <TabsContent value="questions">
                <Card className="brutal-border brutal-shadow">
                  <CardHeader>
                    <CardTitle>Related Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.relatedQuestions.map((question, index) => (
                        <div key={index} className="p-4 bg-muted brutal-border">
                          <p className="font-medium">{question}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}