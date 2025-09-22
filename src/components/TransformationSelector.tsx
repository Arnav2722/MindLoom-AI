import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, Brain, BookOpen, Scale, Volume2, MessageSquare, Zap } from "lucide-react";

interface TransformationSelectorProps {
  onTransform: (types: string[]) => void;
  isProcessing: boolean;
  uploadedFiles: any[];
  showFileRequirement?: boolean;
}

export function TransformationSelector({ onTransform, isProcessing, uploadedFiles, showFileRequirement = true }: TransformationSelectorProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["summary"]);
  
  console.log('TransformationSelector props:', { uploadedFiles: uploadedFiles.length, showFileRequirement, isProcessing });

  const transformationTypes = [
    {
      id: "summary",
      label: "Summary",
      icon: FileText,
      description: "Get concise key points",
      color: "text-primary",
      available: true
    },
    {
      id: "mindmap",
      label: "Mind Map",
      icon: Brain,
      description: "Visual knowledge structure",
      color: "text-accent",
      available: true
    },
    {
      id: "notes",
      label: "Study Notes",
      icon: BookOpen,
      description: "Structured learning material",
      color: "text-secondary",
      available: true
    },
    {
      id: "legal",
      label: "Legal Analysis",
      icon: Scale,
      description: "Demystify legal documents",
      color: "text-destructive",
      available: true
    },
    {
      id: "podcast",
      label: "Podcast Script",
      icon: Volume2,
      description: "Audio content generation",
      color: "text-orange-500",
      available: false,
      comingSoon: true
    },
    {
      id: "chat",
      label: "Chat with Content",
      icon: MessageSquare,
      description: "Interactive Q&A",
      color: "text-blue-500",
      available: false,
      comingSoon: true
    }
  ];

  const handleTypeToggle = (typeId: string) => {
    const type = transformationTypes.find(t => t.id === typeId);
    if (!type?.available) return;

    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleTransform = () => {
    if (selectedTypes.length === 0) return;
    onTransform(selectedTypes);
  };

  return (
    <Card className="bg-background brutal-border brutal-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-black uppercase">
          Choose Transformations
        </CardTitle>
        <p className="text-sm text-muted-foreground font-bold">
          Select one or more transformation types for your content
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available Transformations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {transformationTypes.filter(type => type.available).map((type) => (
            <div
              key={type.id}
              className={`relative p-4 brutal-border cursor-pointer transition-all duration-100 ${
                selectedTypes.includes(type.id)
                  ? 'bg-primary text-primary-foreground brutal-shadow-lg'
                  : 'bg-muted hover:bg-muted/80'
              }`}
              onClick={() => handleTypeToggle(type.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedTypes.includes(type.id)}
                  onChange={() => handleTypeToggle(type.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <type.icon className={`w-5 h-5 ${selectedTypes.includes(type.id) ? 'text-primary-foreground' : type.color}`} />
                    <h3 className="font-black uppercase text-sm">{type.label}</h3>
                  </div>
                  <p className={`text-xs font-bold ${selectedTypes.includes(type.id) ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {type.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Features */}
        <div className="space-y-3">
          <h4 className="text-sm font-black uppercase text-muted-foreground">Coming Soon</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {transformationTypes.filter(type => type.comingSoon).map((type) => (
              <div
                key={type.id}
                className="relative p-4 brutal-border bg-muted/50 opacity-60"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <type.icon className={`w-5 h-5 ${type.color}`} />
                      <h3 className="font-black uppercase text-sm">{type.label}</h3>
                      <Badge variant="outline" className="text-xs">Soon</Badge>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transform Button */}
        <Button
          onClick={handleTransform}
          disabled={selectedTypes.length === 0 || isProcessing || (showFileRequirement && uploadedFiles.length === 0)}
          variant="brutal"
          size="lg"
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Zap className="w-5 h-5 mr-2 animate-brutal-shake" />
              PROCESSING {selectedTypes.length} TRANSFORMATION{selectedTypes.length > 1 ? 'S' : ''}...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              TRANSFORM WITH {selectedTypes.length} TYPE{selectedTypes.length > 1 ? 'S' : ''}
            </>
          )}
        </Button>

        {selectedTypes.length > 0 && (
          <div className="bg-accent/10 brutal-border p-3">
            <p className="text-xs font-bold text-accent">
              Selected: {selectedTypes.map(id => transformationTypes.find(t => t.id === id)?.label).join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}