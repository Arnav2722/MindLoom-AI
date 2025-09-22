import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, Languages, ArrowRight, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MultiLanguageSupportProps {
  content: string;
  title?: string;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' }
];

export function MultiLanguageSupport({ content, title = "Content" }: MultiLanguageSupportProps) {
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translatedContent, setTranslatedContent] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const { toast } = useToast();

  // Simple language detection based on common words
  const detectLanguage = (text: string): string => {
    const samples = {
      en: ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'],
      es: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'],
      fr: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'],
      de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'],
      it: ['il', 'di', 'che', 'e', 'la', 'per', 'in', 'un', 'è', 'con'],
      pt: ['o', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é'],
      ru: ['в', 'и', 'не', 'на', 'я', 'быть', 'он', 'с', 'что', 'а'],
      zh: ['的', '一', '是', '在', '不', '了', '有', '和', '人', '这'],
      ja: ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し'],
      ar: ['في', 'من', 'إلى', 'على', 'هذا', 'هذه', 'التي', 'التي', 'كان', 'لم']
    };

    const lowerText = text.toLowerCase();
    let maxMatches = 0;
    let detectedLang = 'en';

    Object.entries(samples).forEach(([lang, words]) => {
      const matches = words.reduce((count, word) => {
        return count + (lowerText.split(' ').filter(w => w.includes(word)).length);
      }, 0);
      
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedLang = lang;
      }
    });

    return detectedLang;
  };

  // Simple translation simulation (in real app, would use translation API)
  const translateContent = async () => {
    setIsTranslating(true);
    
    try {
      // Detect source language if not specified
      if (!detectedLanguage) {
        const detected = detectLanguage(content);
        setDetectedLanguage(detected);
        setSourceLanguage(detected);
      }

      // Simulate translation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simple translation simulation
      const targetLang = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage);
      const sourceLang = SUPPORTED_LANGUAGES.find(l => l.code === sourceLanguage);
      
      // In a real implementation, this would call a translation API
      const mockTranslation = `[TRANSLATED TO ${targetLang?.name.toUpperCase()}]\n\n` +
        `${targetLang?.flag} This is a simulated translation of your content from ${sourceLang?.name} to ${targetLang?.name}.\n\n` +
        `Original title: "${title}"\n\n` +
        `Content preview: ${content.substring(0, 200)}...\n\n` +
        `🔄 In a production environment, this would be translated using advanced AI translation services like:\n` +
        `• Google Translate API\n` +
        `• Microsoft Translator\n` +
        `• DeepL API\n` +
        `• OpenAI GPT translation\n\n` +
        `The translation would maintain:\n` +
        `✓ Context and meaning\n` +
        `✓ Technical terminology\n` +
        `✓ Cultural nuances\n` +
        `✓ Formatting and structure\n\n` +
        `Word count: ${content.split(' ').length} words\n` +
        `Estimated translation accuracy: 95%+`;

      setTranslatedContent(mockTranslation);
      
      toast({
        title: "Translation Complete",
        description: `Content translated to ${targetLang?.name}`,
      });
      
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const copyTranslation = async () => {
    try {
      await navigator.clipboard.writeText(translatedContent);
      toast({
        title: "Copied",
        description: "Translation copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadTranslation = () => {
    const blob = new Blob([translatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}_translated_${targetLanguage}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLanguageByCode = (code: string) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code);
  };

  return (
    <Card className="bg-background brutal-border brutal-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Multi-Language Translation
        </CardTitle>
        <p className="text-sm text-muted-foreground font-bold">
          Translate content to 20+ languages
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-bold">From Language</label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger className="brutal-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {detectedLanguage && (
              <Badge variant="outline" className="text-xs">
                Auto-detected: {getLanguageByCode(detectedLanguage)?.flag} {getLanguageByCode(detectedLanguage)?.name}
              </Badge>
            )}
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">To Language</label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="brutal-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.filter(l => l.code !== sourceLanguage).map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Translation Button */}
        <Button
          onClick={translateContent}
          disabled={isTranslating || !content}
          variant="brutal"
          size="lg"
          className="w-full"
        >
          {isTranslating ? (
            <>
              <Languages className="w-5 h-5 mr-2 animate-spin" />
              TRANSLATING...
            </>
          ) : (
            <>
              <Languages className="w-5 h-5 mr-2" />
              TRANSLATE CONTENT
            </>
          )}
        </Button>

        {/* Translation Result */}
        {translatedContent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black uppercase text-sm">Translation Result</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyTranslation}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadTranslation}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="bg-muted brutal-border p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {translatedContent}
              </pre>
            </div>
          </div>
        )}

        {/* Supported Languages Grid */}
        <div className="space-y-3">
          <h4 className="font-black uppercase text-sm">Supported Languages ({SUPPORTED_LANGUAGES.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {SUPPORTED_LANGUAGES.map(lang => (
              <div key={lang.code} className="flex items-center gap-2 p-2 bg-muted/50 brutal-border text-xs">
                <span>{lang.flag}</span>
                <span className="font-bold">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Notice */}
        <div className="bg-blue-50 brutal-border p-4">
          <p className="text-xs font-bold text-blue-800">
            🌍 Multi-Language Feature: This demonstrates translation capabilities. 
            In production, this would integrate with professional translation APIs 
            for accurate, context-aware translations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}