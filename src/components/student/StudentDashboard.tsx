import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { BookOpen, Heart, TrendingUp, Plus, LogOut, Calendar, FileText, Clock, Bot } from 'lucide-react';
import StudentDataForm from './StudentDataForm';
import SmartJournal from './SmartJournal';
import MoodTrendChart from './MoodTrendChart';
import NoteSummarizer from './NoteSummarizer';
import StudyPlanner from './StudyPlanner';
import EmotionChatbot from './EmotionChatbot';

const StudentDashboard: React.FC = () => {
  const { currentUser, logout, students } = useApp();
  const [showDataForm, setShowDataForm] = useState(false);
  
  const currentStudent = students.find(s => s.registrationNumber === currentUser?.registrationNumber);
  
  const getMoodEmoji = (mood: string) => {
    const emojiMap = {
      happy: '😊',
      neutral: '😐',
      concerned: '😟',
      burnout: '😰'
    };
    return emojiMap[mood as keyof typeof emojiMap] || '😐';
  };

  const getMoodColor = (mood: string) => {
    const colorMap = {
      happy: 'mood-happy',
      neutral: 'mood-neutral', 
      concerned: 'mood-concerned',
      burnout: 'mood-burnout'
    };
    return colorMap[mood as keyof typeof colorMap] || 'mood-neutral';
  };

  const getOverallMood = () => {
    if (!currentStudent?.subjects.length) return 'neutral';
    
    const moodCounts = currentStudent.subjects.reduce((acc, subject) => {
      acc[subject.mood] = (acc[subject.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    )[0];
  };

  const getAveragePerformance = () => {
    if (!currentStudent?.subjects.length) return { marks: 0, attendance: 0 };
    
    const totals = currentStudent.subjects.reduce((acc, subject) => ({
      marks: acc.marks + subject.marks,
      attendance: acc.attendance + subject.attendance
    }), { marks: 0, attendance: 0 });
    
    return {
      marks: Math.round(totals.marks / currentStudent.subjects.length),
      attendance: Math.round(totals.attendance / currentStudent.subjects.length)
    };
  };

  const overallMood = getOverallMood();
  const avgPerformance = getAveragePerformance();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Welcome back, {currentUser?.name}! 🌟</h1>
              <p className="text-sm text-muted-foreground">You're doing amazing - keep it up!</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="dashboard-tile">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Mood</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl">{getMoodEmoji(overallMood)}</span>
                    <Badge className={getMoodColor(overallMood)}>
                      {overallMood.charAt(0).toUpperCase() + overallMood.slice(1)}
                    </Badge>
                  </div>
                </div>
                <Heart className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-tile">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Marks</p>
                  <p className="text-2xl font-bold text-primary">{avgPerformance.marks}%</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-tile">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Attendance</p>
                  <p className="text-2xl font-bold text-primary">{avgPerformance.attendance}%</p>
                </div>
                <Calendar className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">My Subjects</TabsTrigger>
            <TabsTrigger value="journal">Mood Journal</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="notes">AI Notes</TabsTrigger>
            <TabsTrigger value="study">Study Planner</TabsTrigger>
            <TabsTrigger value="chatbot">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="mood-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Recent Subject Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentStudent?.subjects.slice(-3).map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Marks: {subject.marks}% • Attendance: {subject.attendance}%
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getMoodEmoji(subject.mood)}</span>
                        <Badge className={getMoodColor(subject.mood)}>
                          {subject.mood}
                        </Badge>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No subjects added yet</p>
                      <p className="text-sm text-muted-foreground">Add your first subject to get started!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mood-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setShowDataForm(true)}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject Data
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {/* Navigate to journal */}}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Log Today's Mood
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {/* Navigate to trends */}}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Progress
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {/* Navigate to notes */}}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    AI Notes Summarizer
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {/* Navigate to study */}}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Study Planner
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {/* Navigate to chatbot */}}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Emotion Assistant
                  </Button>
                </CardContent>
              </Card>
            </div>

            {avgPerformance.marks > 0 && (
              <Card className="mood-card">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="bg-success-soft rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl">🎉</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      You're doing great, {currentUser?.name}!
                    </h3>
                    <p className="text-muted-foreground">
                      Keep up the excellent work. Remember, every step forward is progress! 💪
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="subjects">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Subjects</h2>
                <Button onClick={() => setShowDataForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentStudent?.subjects.map((subject) => (
                  <Card key={subject.id} className="mood-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold">{subject.name}</h3>
                        <span className="text-2xl">{getMoodEmoji(subject.mood)}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Marks:</span>
                          <span className="font-medium">{subject.marks}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Attendance:</span>
                          <span className="font-medium">{subject.attendance}%</span>
                        </div>
                        <Badge className={`${getMoodColor(subject.mood)} w-full justify-center`}>
                          {subject.mood.charAt(0).toUpperCase() + subject.mood.slice(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="journal">
            <SmartJournal />
          </TabsContent>

          <TabsContent value="trends">
            <MoodTrendChart />
          </TabsContent>

          <TabsContent value="notes">
            <NoteSummarizer />
          </TabsContent>

          <TabsContent value="study">
            <StudyPlanner />
          </TabsContent>

          <TabsContent value="chatbot">
            <EmotionChatbot />
          </TabsContent>
        </Tabs>
      </div>

      {showDataForm && (
        <StudentDataForm onClose={() => setShowDataForm(false)} />
      )}
    </div>
  );
};

export default StudentDashboard;