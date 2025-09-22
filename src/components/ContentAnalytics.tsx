import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Clock, BookOpen, Target, TrendingUp, Eye, Zap } from "lucide-react";

interface ContentAnalyticsProps {
  content: string;
  title?: string;
}

interface AnalyticsData {
  readingTime: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  complexity: 'Easy' | 'Medium' | 'Hard';
  keyTopics: string[];
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  readabilityScore: number;
}

export function ContentAnalytics({ content, title = "Content" }: ContentAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContent = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const words = content.split(/\s+/).filter(word => word.length > 0);
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      
      // Calculate reading time (average 200 words per minute)
      const readingTime = Math.ceil(words.length / 200);
      
      // Calculate complexity based on average sentence length and word length
      const avgSentenceLength = words.length / sentences.length;
      const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
      
      let complexity: 'Easy' | 'Medium' | 'Hard' = 'Easy';
      if (avgSentenceLength > 20 || avgWordLength > 6) complexity = 'Hard';
      else if (avgSentenceLength > 15 || avgWordLength > 5) complexity = 'Medium';
      
      // Extract key topics (most frequent meaningful words)
      const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
      const wordFreq = {};
      
      words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
        if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
          wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
        }
      });
      
      const keyTopics = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);
      
      // Simple sentiment analysis
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'success', 'benefit', 'advantage'];
      const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'problem', 'issue', 'disadvantage', 'failure', 'error'];
      
      const positiveCount = positiveWords.reduce((count, word) => 
        count + (content.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0);
      const negativeCount = negativeWords.reduce((count, word) => 
        count + (content.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0);
      
      let sentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
      if (positiveCount > negativeCount + 2) sentiment = 'Positive';
      else if (negativeCount > positiveCount + 2) sentiment = 'Negative';
      
      // Calculate readability score (simplified Flesch Reading Ease)
      const avgWordsPerSentence = words.length / sentences.length;
      const avgSyllablesPerWord = avgWordLength * 0.5; // Rough approximation
      const readabilityScore = Math.max(0, Math.min(100, 
        206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
      ));
      
      setAnalytics({
        readingTime,
        wordCount: words.length,
        sentenceCount: sentences.length,
        paragraphCount: paragraphs.length,
        complexity,
        keyTopics,
        sentiment,
        readabilityScore: Math.round(readabilityScore)
      });
      
      setIsAnalyzing(false);
    }, 1500);
  };

  useEffect(() => {
    if (content) {
      analyzeContent();
    }
  }, [content]);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Easy': return 'text-green-500 bg-green-50';
      case 'Medium': return 'text-orange-500 bg-orange-50';
      case 'Hard': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'text-green-500 bg-green-50';
      case 'Neutral': return 'text-blue-500 bg-blue-50';
      case 'Negative': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getReadabilityLevel = (score: number) => {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  };

  return (
    <Card className="bg-background brutal-border brutal-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Content Analytics
        </CardTitle>
        <p className="text-sm text-muted-foreground font-bold">
          Analyzing: {title}
        </p>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary animate-pulse" />
              <span className="font-bold">Analyzing content...</span>
            </div>
            <Progress value={undefined} className="brutal-border" />
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted brutal-border p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-black">{analytics.readingTime}</div>
                <div className="text-xs text-muted-foreground font-bold">MIN READ</div>
              </div>
              
              <div className="bg-muted brutal-border p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-2xl font-black">{analytics.wordCount}</div>
                <div className="text-xs text-muted-foreground font-bold">WORDS</div>
              </div>
              
              <div className="bg-muted brutal-border p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div className="text-2xl font-black">{analytics.sentenceCount}</div>
                <div className="text-xs text-muted-foreground font-bold">SENTENCES</div>
              </div>
              
              <div className="bg-muted brutal-border p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-black">{analytics.paragraphCount}</div>
                <div className="text-xs text-muted-foreground font-bold">PARAGRAPHS</div>
              </div>
            </div>

            {/* Complexity & Sentiment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-black uppercase text-sm">Complexity Level</h4>
                <div className="flex items-center gap-3">
                  <Badge className={`${getComplexityColor(analytics.complexity)} font-bold`}>
                    {analytics.complexity}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Based on sentence structure and vocabulary
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-black uppercase text-sm">Sentiment</h4>
                <div className="flex items-center gap-3">
                  <Badge className={`${getSentimentColor(analytics.sentiment)} font-bold`}>
                    {analytics.sentiment}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Overall tone of the content
                  </span>
                </div>
              </div>
            </div>

            {/* Readability Score */}
            <div className="space-y-3">
              <h4 className="font-black uppercase text-sm">Readability Score</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{getReadabilityLevel(analytics.readabilityScore)}</span>
                  <span className="text-sm font-bold">{analytics.readabilityScore}/100</span>
                </div>
                <Progress value={analytics.readabilityScore} className="brutal-border" />
                <p className="text-xs text-muted-foreground">
                  Higher scores indicate easier reading. Based on Flesch Reading Ease formula.
                </p>
              </div>
            </div>

            {/* Key Topics */}
            <div className="space-y-3">
              <h4 className="font-black uppercase text-sm">Key Topics</h4>
              <div className="flex flex-wrap gap-2">
                {analytics.keyTopics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="font-bold">
                    #{topic}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-primary/10 brutal-border p-4">
              <h4 className="font-black uppercase text-sm mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Content Insights
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    This content has a <strong>{analytics.complexity.toLowerCase()}</strong> reading level 
                    and takes approximately <strong>{analytics.readingTime} minute{analytics.readingTime > 1 ? 's' : ''}</strong> to read.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    The overall sentiment is <strong>{analytics.sentiment.toLowerCase()}</strong> 
                    with a readability score of <strong>{analytics.readabilityScore}</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    Main topics include: <strong>{analytics.keyTopics.slice(0, 3).join(', ')}</strong>.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground font-bold">
              No content to analyze
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}