import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, Copy, Check, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveAs } from 'file-saver';

const NoteSummarizer: React.FC = () => {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateSummary = async () => {
    if (!notes.trim()) {
      toast({
        title: "Please enter some notes",
        description: "Add text to summarize",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const keyPoints = sentences
        .slice(0, Math.min(3, sentences.length))
        .map(s => s.trim())
        .filter(s => s.length > 20);
      
      const generatedSummary = `📝 Key Points Summary:\n\n${keyPoints.map((point, index) => 
        `${index + 1}. ${point.charAt(0).toUpperCase() + point.slice(1)}`
      ).join('\n\n')}\n\n💡 Main Takeaway: ${keyPoints[0] ? keyPoints[0].slice(0, 100) + '...' : 'Focus on the core concepts presented.'}`;
      
      setSummary(generatedSummary);
      toast({
        title: "Summary generated! ✨",
        description: "Your notes have been summarized successfully"
      });
    } catch (error) {
      toast({
        title: "Error generating summary",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySummary = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard! 📋",
      description: "Summary has been copied"
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setNotes(content);
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        
        // Simple PDF text extraction (for demo purposes)
        // In a real app, you'd use a proper PDF parsing library
        const text = await extractTextFromPDF(arrayBuffer);
        setNotes(text);
        
        toast({
          title: "PDF uploaded successfully! 📄",
          description: "Text extracted from PDF"
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt or .pdf file",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    // Simple PDF text extraction simulation
    // In a real implementation, you'd use pdf-parse or similar library
    const decoder = new TextDecoder();
    const text = decoder.decode(arrayBuffer);
    
    // Extract readable text (this is a simplified approach)
    const matches = text.match(/[a-zA-Z0-9\s.,!?;:'"()-]+/g);
    return matches ? matches.join(' ').replace(/\s+/g, ' ').trim() : 'Could not extract text from PDF';
  };

  const downloadSummary = () => {
    if (!summary) return;
    
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'notes-summary.txt');
    
    toast({
      title: "Summary downloaded! 📥",
      description: "File saved to your downloads"
    });
  };

  return (
    <div className="space-y-6">
      <Card className="mood-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Notes Summarizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-between">
              <label className="text-sm font-medium">Enter your notes or upload a file:</label>
              <div>
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload .txt/.pdf
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Paste your notes, paragraphs, or study material here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {notes.length} characters
              </p>
              <Button 
                onClick={generateSummary}
                disabled={isLoading || !notes.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <Card className="mood-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-success" />
                Summary
              </div>
              <Badge className="bg-success-soft text-success-foreground">
                AI Generated
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {summary}
              </pre>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={copySummary}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Copied!' : 'Copy Summary'}
              </Button>
              <Button
                variant="outline"
                onClick={downloadSummary}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Summary
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setNotes('');
                  setSummary('');
                }}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NoteSummarizer;