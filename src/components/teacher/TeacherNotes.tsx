import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { Student } from '@/contexts/AppContext';
import { Save, X, FileText, Plus } from 'lucide-react';

interface TeacherNotesProps {
  student: Student;
  onClose: () => void;
}

const TeacherNotes: React.FC<TeacherNotesProps> = ({ student, onClose }) => {
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { addTeacherNote, getTeacherNotes } = useApp();
  
  const existingNotes = getTeacherNotes(student.id);

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note before saving.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    try {
      await addTeacherNote(student.id, noteText.trim());
      setNoteText('');
      toast({
        title: "Note Saved",
        description: "Your note has been added to the student's record.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const emojiMap = {
      happy: '😊',
      neutral: '😐',
      concerned: '😟',
      burnout: '😰'
    };
    return emojiMap[mood as keyof typeof emojiMap] || '😐';
  };

  const getOverallMood = () => {
    if (!student.subjects.length) return 'neutral';
    
    const moodCounts = student.subjects.reduce((acc, subject) => {
      acc[subject.mood] = (acc[subject.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    )[0];
  };

  const overallMood = getOverallMood();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Teacher Notes - {student.name}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Info Summary */}
          <Card className="mood-card">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getMoodEmoji(overallMood)}</span>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.registrationNumber}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Subjects</p>
                  <p className="text-lg font-semibold">{student.subjects.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Overall Mood</p>
                  <Badge className={`${overallMood === 'happy' ? 'mood-happy' : 
                    overallMood === 'neutral' ? 'mood-neutral' : 
                    overallMood === 'concerned' ? 'mood-concerned' : 'mood-burnout'}`}>
                    {overallMood.charAt(0).toUpperCase() + overallMood.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add New Note */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Note
            </h3>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your observations, concerns, or recommendations for this student..."
              className="min-h-[120px]"
            />
            <Button 
              onClick={handleSaveNote} 
              disabled={saving || !noteText.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Note'}
            </Button>
          </div>

          {/* Existing Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Previous Notes ({existingNotes.length})</h3>
            {existingNotes.length > 0 ? (
              <div className="space-y-3">
                {existingNotes.map((note) => (
                  <Card key={note.id} className="mood-card">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">Note #{note.id}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(note.timestamp).toLocaleDateString()} at{' '}
                          {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{note.content}</p>
                      {note.priority && (
                        <Badge className="mt-2" variant="secondary">
                          {note.priority} Priority
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="mood-card">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No previous notes for this student</p>
                  <p className="text-sm text-muted-foreground">Add your first note above to get started!</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherNotes;
