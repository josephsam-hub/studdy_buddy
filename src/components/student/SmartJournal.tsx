import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { Heart, Plus, BookOpen, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SmartJournal: React.FC = () => {
  const { currentUser, students, addJournalEntry } = useApp();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mood: 'neutral' as 'happy' | 'neutral' | 'concerned' | 'burnout',
    notes: '',
    activities: [] as string[]
  });

  const currentStudent = students.find(s => s.registrationNumber === currentUser?.registrationNumber);

  const moodOptions = [
    { value: 'happy', label: 'Happy', emoji: '😊', color: 'mood-happy' },
    { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'mood-neutral' },
    { value: 'concerned', label: 'Concerned', emoji: '😟', color: 'mood-concerned' },
    { value: 'burnout', label: 'Burned Out', emoji: '😰', color: 'mood-burnout' }
  ];

  const activitySuggestions = [
    'Studied well', 'Felt overwhelmed', 'Had good friends time', 'Slept well',
    'Exercise/Sports', 'Felt stressed', 'Family time', 'Creative activities',
    'Social media', 'Outdoor activities', 'Reading', 'Music/Entertainment'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addJournalEntry({
      date: new Date().toISOString().split('T')[0],
      mood: formData.mood,
      notes: formData.notes,
      activities: formData.activities
    });

    toast({
      title: "Journal entry saved! 📝",
      description: "Thank you for sharing how you're feeling today.",
    });

    setFormData({ mood: 'neutral', notes: '', activities: [] });
    setShowForm(false);
  };

  const toggleActivity = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Smart Mood Journal
          </h2>
          <p className="text-muted-foreground">Track your daily emotions and activities</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      {showForm && (
        <Card className="mood-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mood Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Today's Mood</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {moodOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, mood: option.value as any }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.mood === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.emoji}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Today's Activities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {activitySuggestions.map((activity) => (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => toggleActivity(activity)}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        formData.activities.includes(activity)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Additional Notes (Optional)</label>
                <Textarea
                  placeholder="Share anything else about your day..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Entry</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Entries</h3>
        {currentStudent?.journalEntries.length ? (
          <div className="space-y-4">
            {currentStudent.journalEntries
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((entry) => {
                const moodOption = moodOptions.find(m => m.value === entry.mood);
                return (
                  <Card key={entry.id} className="mood-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{moodOption?.emoji}</span>
                          <div>
                            <Badge className={moodOption?.color}>
                              {moodOption?.label}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(entry.date)}
                            </p>
                          </div>
                        </div>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      {entry.activities.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">Activities:</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.activities.map((activity, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {entry.notes && (
                        <div>
                          <p className="text-sm font-medium mb-1">Notes:</p>
                          <p className="text-sm text-muted-foreground">{entry.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        ) : (
          <Card className="mood-card">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Start Your Journey</h3>
              <p className="text-muted-foreground mb-4">
                Your mood journal is empty. Start tracking your daily emotions and activities!
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Entry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SmartJournal;