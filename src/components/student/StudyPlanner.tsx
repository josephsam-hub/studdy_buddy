import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause, Square, Plus, Calendar, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudySession {
  id: string;
  subject: string;
  plannedDuration: number; // in minutes
  actualDuration: number; // in seconds
  completed: boolean;
  createdAt: Date;
}

interface StudyTimer {
  isRunning: boolean;
  currentTime: number; // in seconds
  currentSubject: string;
  startTime?: Date;
}

const StudyPlanner: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [timer, setTimer] = useState<StudyTimer>({
    isRunning: false,
    currentTime: 0,
    currentSubject: ''
  });
  const [newSubject, setNewSubject] = useState('');
  const [plannedDuration, setPlannedDuration] = useState(25); // Default Pomodoro time
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer.isRunning) {
      interval = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          currentTime: prev.currentTime + 1
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!timer.currentSubject) {
      toast({
        title: "Select a subject",
        description: "Please choose a subject to study",
        variant: "destructive"
      });
      return;
    }

    setTimer(prev => ({
      ...prev,
      isRunning: true,
      startTime: new Date()
    }));
    
    toast({
      title: "Study session started! 📚",
      description: `Good luck with ${timer.currentSubject}!`
    });
  };

  const pauseTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: false
    }));
  };

  const stopTimer = () => {
    if (timer.currentTime > 0) {
      const newSession: StudySession = {
        id: Date.now().toString(),
        subject: timer.currentSubject,
        plannedDuration: plannedDuration,
        actualDuration: timer.currentTime,
        completed: timer.currentTime >= plannedDuration * 60,
        createdAt: new Date()
      };
      
      setSessions(prev => [newSession, ...prev]);
      
      toast({
        title: "Session completed! 🎉",
        description: `You studied ${timer.currentSubject} for ${formatTime(timer.currentTime)}`
      });
    }

    setTimer({
      isRunning: false,
      currentTime: 0,
      currentSubject: ''
    });
  };

  const addStudyPlan = () => {
    if (!newSubject.trim()) {
      toast({
        title: "Enter subject name",
        description: "Please enter a subject to study",
        variant: "destructive"
      });
      return;
    }

    setTimer(prev => ({
      ...prev,
      currentSubject: newSubject.trim()
    }));
    setNewSubject('');
    
    toast({
      title: "Study plan created! 📝",
      description: `Ready to study ${newSubject} for ${plannedDuration} minutes`
    });
  };

  const getTotalStudyTime = () => {
    return sessions.reduce((total, session) => total + session.actualDuration, 0);
  };

  const getSubjectStats = () => {
    const subjectMap = sessions.reduce((acc, session) => {
      if (!acc[session.subject]) {
        acc[session.subject] = { time: 0, sessions: 0 };
      }
      acc[session.subject].time += session.actualDuration;
      acc[session.subject].sessions += 1;
      return acc;
    }, {} as Record<string, { time: number; sessions: number }>);

    return Object.entries(subjectMap).map(([subject, stats]) => ({
      subject,
      ...stats
    }));
  };

  return (
    <div className="space-y-6">
      {/* Study Timer */}
      <Card className="dashboard-tile">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Study Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-primary mb-4">
              {formatTime(timer.currentTime)}
            </div>
            {timer.currentSubject && (
              <Badge className="mb-4 bg-primary-soft text-primary">
                Studying: {timer.currentSubject}
              </Badge>
            )}
          </div>

          <div className="flex gap-2 justify-center">
            {!timer.isRunning ? (
              <Button onClick={startTimer} className="bg-success hover:bg-success/90">
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={pauseTimer} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={stopTimer} variant="outline">
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Study Plan */}
      <Card className="mood-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Create Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Enter subject name"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Select value={plannedDuration.toString()} onValueChange={(value) => setPlannedDuration(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="25">25 minutes (Pomodoro)</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addStudyPlan} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Set Timer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="mood-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-success" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-success">
                {formatTime(getTotalStudyTime())}
              </div>
              <p className="text-sm text-muted-foreground">Total study time</p>
              <Badge className="bg-success-soft text-success-foreground">
                {sessions.length} sessions completed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="mood-card">
          <CardHeader>
            <CardTitle>Subject Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getSubjectStats().map((stat) => (
                <div key={stat.subject} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{stat.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.sessions} sessions
                    </p>
                  </div>
                  <Badge variant="outline">
                    {formatTime(stat.time)}
                  </Badge>
                </div>
              ))}
              {getSubjectStats().length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No study sessions yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <Card className="mood-card">
          <CardHeader>
            <CardTitle>Recent Study Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{session.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.createdAt.toLocaleDateString()} at {session.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={session.completed ? "bg-success-soft text-success-foreground" : "bg-warning-soft text-warning-foreground"}>
                      {formatTime(session.actualDuration)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: {session.plannedDuration}min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudyPlanner;