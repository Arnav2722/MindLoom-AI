import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, FileText, CheckCircle, Circle } from "lucide-react";

interface StudyNotesGeneratorProps {
  content: string;
  title?: string;
}

interface StudyNote {
  id: string;
  type: 'heading' | 'keypoint' | 'definition' | 'example' | 'question';
  content: string;
  completed?: boolean;
}

export function StudyNotesGenerator({ content, title = "Study Material" }: StudyNotesGeneratorProps) {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  const generateStudyNotes = () => {
    const lines = content.split('\n').filter(line => line.trim());
    const generatedNotes: StudyNote[] = [];
    let noteId = 0;

    // Add title as main heading
    generatedNotes.push({
      id: `note-${noteId++}`,
      type: 'heading',
      content: title
    });

    // Process content into structured notes
    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('##') || trimmed.startsWith('**')) {
        // Section headings
        generatedNotes.push({
          id: `note-${noteId++}`,
          type: 'heading',
          content: trimmed.replace(/[#*]/g, '').trim()
        });
      } else if (trimmed.includes(':') && trimmed.length < 100) {
        // Definitions
        generatedNotes.push({
          id: `note-${noteId++}`,
          type: 'definition',
          content: trimmed
        });
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
        // Key points
        generatedNotes.push({
          id: `note-${noteId++}`,
          type: 'keypoint',
          content: trimmed.replace(/^[-•]\s*/, ''),
          completed: false
        });
      } else if (trimmed.length > 20 && trimmed.length < 200) {
        // Examples or important sentences
        generatedNotes.push({
          id: `note-${noteId++}`,
          type: 'example',
          content: trimmed
        });
      }
    });

    // Generate study questions
    const keyPoints = generatedNotes.filter(note => note.type === 'keypoint');
    keyPoints.slice(0, 3).forEach(point => {
      generatedNotes.push({
        id: `note-${noteId++}`,
        type: 'question',
        content: `What is the significance of: ${point.content.substring(0, 50)}...?`,
        completed: false
      });
    });

    setNotes(generatedNotes);
    setIsGenerated(true);
  };

  const toggleNoteCompletion = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, completed: !note.completed }
        : note
    ));
  };

  const exportNotes = () => {
    const notesText = notes.map(note => {
      switch (note.type) {
        case 'heading':
          return `# ${note.content}\n`;
        case 'keypoint':
          return `- ${note.content}\n`;
        case 'definition':
          return `**${note.content}**\n`;
        case 'example':
          return `> ${note.content}\n`;
        case 'question':
          return `Q: ${note.content}\n`;
        default:
          return `${note.content}\n`;
      }
    }).join('\n');

    const blob = new Blob([notesText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_study_notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const completedCount = notes.filter(note => note.completed).length;
  const totalCheckable = notes.filter(note => note.type === 'keypoint' || note.type === 'question').length;
  const progress = totalCheckable > 0 ? (completedCount / totalCheckable) * 100 : 0;

  return (
    <Card className="bg-background brutal-border brutal-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Study Notes Generator
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isGenerated ? (
              <Button variant="brutal" size="sm" onClick={generateStudyNotes}>
                <FileText className="w-4 h-4 mr-2" />
                Generate Notes
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={exportNotes}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
        {isGenerated && totalCheckable > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">Study Progress</span>
              <span className="font-bold">{Math.round(progress)}% Complete</span>
            </div>
            <div className="bg-muted brutal-border h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!isGenerated ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground font-bold">
              Click "Generate Notes" to create structured study materials from your content
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notes.map(note => (
              <div key={note.id} className="space-y-2">
                {note.type === 'heading' && (
                  <h3 className="text-lg font-black uppercase text-primary border-b-2 border-primary pb-1">
                    {note.content}
                  </h3>
                )}
                
                {note.type === 'keypoint' && (
                  <div className="flex items-start gap-3 p-3 bg-muted brutal-border">
                    <button
                      onClick={() => toggleNoteCompletion(note.id)}
                      className="mt-1 flex-shrink-0"
                    >
                      {note.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1">
                      <Badge variant="secondary" className="text-xs mb-2">Key Point</Badge>
                      <p className={`font-bold ${note.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {note.content}
                      </p>
                    </div>
                  </div>
                )}
                
                {note.type === 'definition' && (
                  <div className="p-3 bg-accent/10 brutal-border">
                    <Badge variant="outline" className="text-xs mb-2">Definition</Badge>
                    <p className="font-bold text-accent">{note.content}</p>
                  </div>
                )}
                
                {note.type === 'example' && (
                  <div className="p-3 bg-secondary/10 brutal-border">
                    <Badge variant="outline" className="text-xs mb-2">Example</Badge>
                    <p className="font-medium italic">{note.content}</p>
                  </div>
                )}
                
                {note.type === 'question' && (
                  <div className="flex items-start gap-3 p-3 bg-primary/10 brutal-border">
                    <button
                      onClick={() => toggleNoteCompletion(note.id)}
                      className="mt-1 flex-shrink-0"
                    >
                      {note.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1">
                      <Badge variant="outline" className="text-xs mb-2">Study Question</Badge>
                      <p className={`font-bold text-primary ${note.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {note.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {isGenerated && (
          <div className="mt-4 p-3 bg-muted brutal-border">
            <p className="text-xs font-bold text-muted-foreground">
              📚 Study Tips: Check off completed items, export notes for offline study, 
              and use the questions to test your understanding.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}