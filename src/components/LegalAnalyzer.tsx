import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, AlertTriangle, FileText, Download, Eye } from "lucide-react";

interface LegalAnalyzerProps {
  content: string;
  title?: string;
}

interface LegalSection {
  id: string;
  type: 'clause' | 'obligation' | 'right' | 'risk' | 'definition' | 'deadline';
  content: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

export function LegalAnalyzer({ content, title = "Legal Document" }: LegalAnalyzerProps) {
  const [analysis, setAnalysis] = useState<LegalSection[]>([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const analyzeLegalContent = () => {
    const lines = content.split('\n').filter(line => line.trim());
    const legalSections: LegalSection[] = [];
    let sectionId = 0;

    lines.forEach(line => {
      const trimmed = line.trim().toLowerCase();
      
      // Identify legal clauses and obligations
      if (trimmed.includes('shall') || trimmed.includes('must') || trimmed.includes('required')) {
        legalSections.push({
          id: `legal-${sectionId++}`,
          type: 'obligation',
          content: line.trim(),
          severity: trimmed.includes('immediately') || trimmed.includes('within') ? 'high' : 'medium',
          explanation: 'This creates a binding obligation that must be fulfilled.'
        });
      }
      
      if (trimmed.includes('may') || trimmed.includes('entitled') || trimmed.includes('right to')) {
        legalSections.push({
          id: `legal-${sectionId++}`,
          type: 'right',
          content: line.trim(),
          severity: 'low',
          explanation: 'This grants a right or permission that can be exercised.'
        });
      }
      
      if (trimmed.includes('penalty') || trimmed.includes('breach') || trimmed.includes('violation') || trimmed.includes('liable')) {
        legalSections.push({
          id: `legal-${sectionId++}`,
          type: 'risk',
          content: line.trim(),
          severity: 'high',
          explanation: 'This identifies potential legal risks or penalties.'
        });
      }
      
      if (trimmed.includes('means') || trimmed.includes('defined as') || trimmed.includes('refers to')) {
        legalSections.push({
          id: `legal-${sectionId++}`,
          type: 'definition',
          content: line.trim(),
          severity: 'low',
          explanation: 'This provides a legal definition of terms used in the document.'
        });
      }
      
      if (trimmed.includes('days') || trimmed.includes('date') || trimmed.includes('deadline') || trimmed.includes('expire')) {
        legalSections.push({
          id: `legal-${sectionId++}`,
          type: 'deadline',
          content: line.trim(),
          severity: 'high',
          explanation: 'This establishes important time limits or deadlines.'
        });
      }
      
      if (trimmed.includes('clause') || trimmed.includes('section') || trimmed.includes('article')) {
        legalSections.push({
          id: `legal-${sectionId++}`,
          type: 'clause',
          content: line.trim(),
          severity: 'medium',
          explanation: 'This is a structural element of the legal document.'
        });
      }
    });

    setAnalysis(legalSections);
    setIsAnalyzed(true);
  };

  const filteredAnalysis = selectedFilter === 'all' 
    ? analysis 
    : analysis.filter(item => item.type === selectedFilter);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-orange-500 bg-orange-50';
      case 'low': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'obligation': return '⚖️';
      case 'right': return '✅';
      case 'risk': return '⚠️';
      case 'definition': return '📖';
      case 'deadline': return '⏰';
      case 'clause': return '📄';
      default: return '📋';
    }
  };

  const exportAnalysis = () => {
    const analysisText = `# Legal Analysis: ${title}\n\n` +
      analysis.map(item => 
        `## ${getTypeIcon(item.type)} ${item.type.toUpperCase()} (${item.severity.toUpperCase()})\n` +
        `**Content:** ${item.content}\n` +
        `**Explanation:** ${item.explanation}\n\n`
      ).join('');

    const blob = new Blob([analysisText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_legal_analysis.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const riskCount = analysis.filter(item => item.severity === 'high').length;
  const obligationCount = analysis.filter(item => item.type === 'obligation').length;

  return (
    <Card className="bg-background brutal-border brutal-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Legal Document Analyzer
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isAnalyzed ? (
              <Button variant="brutal" size="sm" onClick={analyzeLegalContent}>
                <Eye className="w-4 h-4 mr-2" />
                Analyze
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={exportAnalysis}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
        {isAnalyzed && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="font-bold">{riskCount} High Risk Items</span>
            </div>
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-orange-500" />
              <span className="font-bold">{obligationCount} Obligations</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!isAnalyzed ? (
          <div className="text-center py-8">
            <Scale className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground font-bold">
              Click "Analyze" to break down legal language into understandable terms
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              ⚠️ This is for informational purposes only and does not constitute legal advice
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {['all', 'obligation', 'right', 'risk', 'deadline', 'definition'].map(filter => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "brutal" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className="text-xs"
                >
                  {filter === 'all' ? 'All Items' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>

            {/* Analysis results */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAnalysis.map(item => (
                <div key={item.id} className="p-4 brutal-border bg-muted/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(item.type)}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.type.toUpperCase()}
                      </Badge>
                      <Badge className={`text-xs ${getSeverityColor(item.severity)}`}>
                        {item.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-bold text-sm">{item.content}</p>
                    <p className="text-xs text-muted-foreground italic">
                      💡 {item.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredAnalysis.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground font-bold">
                  No items found for the selected filter
                </p>
              </div>
            )}
          </div>
        )}
        
        {isAnalyzed && (
          <div className="mt-4 p-3 bg-yellow-50 brutal-border">
            <p className="text-xs font-bold text-yellow-800">
              ⚖️ Legal Disclaimer: This analysis is for informational purposes only. 
              Always consult with a qualified attorney for legal advice.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}