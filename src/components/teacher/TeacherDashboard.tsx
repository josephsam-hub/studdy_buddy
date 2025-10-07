import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { 
  Users, 
  BookOpen, 
  Heart, 
  AlertTriangle, 
  TrendingUp, 
  LogOut, 
  Upload,
  Filter,
  FileText,
  MessageSquare
} from 'lucide-react';
import ExcelUpload from './ExcelUpload';
import TeacherNotes from './TeacherNotes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TeacherDashboard: React.FC = () => {
  const { currentUser, logout, getAllStudentsData } = useApp();
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedMood, setSelectedMood] = useState('all');
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const allStudents = getAllStudentsData();
  
  // Filter students based on selections
  const filteredStudents = allStudents.filter(student => {
    const classMatch = selectedClass === 'all' || student.class === selectedClass;
    
    if (selectedMood === 'all') return classMatch;
    
    // Check if student has any subjects with the selected mood
    const hasMood = student.subjects.some(subject => subject.mood === selectedMood);
    return classMatch && hasMood;
  });

  // Calculate statistics
  const totalStudents = filteredStudents.length;
  const studentsWithData = filteredStudents.filter(s => s.subjects.length > 0).length;
  
  // Mood distribution across all students
  const moodDistribution = filteredStudents.reduce((acc, student) => {
    student.subjects.forEach(subject => {
      acc[subject.mood] = (acc[subject.mood] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const moodChartData = Object.entries(moodDistribution).map(([mood, count]) => ({
    mood: mood.charAt(0).toUpperCase() + mood.slice(1),
    count,
    fill: {
      happy: 'hsl(var(--success))',
      neutral: 'hsl(var(--warning))', 
      concerned: 'hsl(var(--gentle-orange))',
      burnout: 'hsl(var(--destructive))'
    }[mood] || 'hsl(var(--muted))'
  }));

  // Early warning system - students with concerning patterns
  const warningStudents = filteredStudents.filter(student => {
    const recentSubjects = student.subjects.slice(-3);
    const concerningMoods = recentSubjects.filter(s => s.mood === 'concerned' || s.mood === 'burnout');
    const lowPerformance = recentSubjects.filter(s => s.marks < 60 || s.attendance < 70);
    
    return concerningMoods.length >= 2 || lowPerformance.length >= 2;
  });

  // Performance statistics
  const performanceData = ['Mathematics', 'Science', 'English', 'History', 'Geography'].map(subject => {
    const subjectData = filteredStudents.flatMap(s => 
      s.subjects.filter(sub => sub.name.toLowerCase().includes(subject.toLowerCase()))
    );
    
    if (subjectData.length === 0) return null;
    
    const avgMarks = subjectData.reduce((sum, s) => sum + s.marks, 0) / subjectData.length;
    const avgAttendance = subjectData.reduce((sum, s) => sum + s.attendance, 0) / subjectData.length;
    
    return {
      subject,
      avgMarks: Math.round(avgMarks),
      avgAttendance: Math.round(avgAttendance),
      studentCount: subjectData.length
    };
  }).filter(Boolean);

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

  const getOverallStudentMood = (student: any) => {
    if (!student.subjects.length) return 'neutral';
    
    const moodCounts = student.subjects.reduce((acc: any, subject: any) => {
      acc[subject.mood] = (acc[subject.mood] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(moodCounts).reduce((a: any, b: any) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    )[0];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-lavender/20 rounded-full p-2">
              <Users className="h-6 w-6 text-lavender" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Teacher Dashboard - {currentUser?.name}</h1>
              <p className="text-sm text-muted-foreground">Monitor student wellbeing and academic progress</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <Card className="mood-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filters:</span>
              </div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="Class A">Class A</SelectItem>
                  <SelectItem value="Class B">Class B</SelectItem>
                  <SelectItem value="Class C">Class C</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedMood} onValueChange={setSelectedMood}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Mood Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  <SelectItem value="happy">😊 Happy</SelectItem>
                  <SelectItem value="neutral">😐 Neutral</SelectItem>
                  <SelectItem value="concerned">😟 Concerned</SelectItem>
                  <SelectItem value="burnout">😰 Burnout</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowExcelUpload(true)}
              >
                <Upload className="h-4 w-4" />
                Upload Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="dashboard-tile">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-primary">{totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-tile">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">With Data</p>
                  <p className="text-2xl font-bold text-primary">{studentsWithData}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-tile">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Need Attention</p>
                  <p className="text-2xl font-bold text-destructive">{warningStudents.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-tile">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subjects Tracked</p>
                  <p className="text-2xl font-bold text-primary">
                    {filteredStudents.reduce((sum, s) => sum + s.subjects.length, 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="warnings">Early Warnings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mood Distribution */}
              <Card className="dashboard-tile">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Class Mood Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {moodChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={moodChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {moodChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, 'Students']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No mood data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subject Performance */}
              <Card className="dashboard-tile">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subject Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {performanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="avgMarks" fill="hsl(var(--primary))" name="Avg Marks" />
                        <Bar dataKey="avgAttendance" fill="hsl(var(--lavender))" name="Avg Attendance" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No performance data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => {
                const overallMood = getOverallStudentMood(student);
                const avgMarks = student.subjects.length > 0 
                  ? Math.round(student.subjects.reduce((sum, s) => sum + s.marks, 0) / student.subjects.length)
                  : 0;
                
                return (
                  <Card key={student.id} className="mood-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">{student.registrationNumber}</p>
                          <p className="text-xs text-muted-foreground">{student.class}</p>
                        </div>
                        <span className="text-2xl">{getMoodEmoji(overallMood)}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Subjects:</span>
                          <span className="font-medium">{student.subjects.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Avg Marks:</span>
                          <span className="font-medium">{avgMarks}%</span>
                        </div>
                        <Badge className={`${getMoodColor(overallMood)} w-full justify-center`}>
                          Overall: {overallMood.charAt(0).toUpperCase() + overallMood.slice(1)}
                        </Badge>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 flex items-center gap-2"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <MessageSquare className="h-3 w-3" />
                          View Notes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="warnings" className="space-y-6">
            <Card className="mood-card border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Students Requiring Attention ({warningStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {warningStudents.length > 0 ? (
                  <div className="space-y-4">
                    {warningStudents.map((student) => {
                      const recentSubjects = student.subjects.slice(-3);
                      const overallMood = getOverallStudentMood(student);
                      
                      return (
                        <div key={student.id} className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{student.name}</h4>
                              <p className="text-sm text-muted-foreground">{student.registrationNumber} • {student.class}</p>
                            </div>
                            <Badge className={getMoodColor(overallMood)}>
                              {overallMood}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <p>Recent Performance Issues:</p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {recentSubjects.filter(s => s.marks < 60).map(s => (
                                <li key={s.id}>Low marks in {s.name}: {s.marks}%</li>
                              ))}
                              {recentSubjects.filter(s => s.attendance < 70).map(s => (
                                <li key={s.id}>Poor attendance in {s.name}: {s.attendance}%</li>
                              ))}
                              {recentSubjects.filter(s => s.mood === 'concerned' || s.mood === 'burnout').map(s => (
                                <li key={s.id}>{s.mood} mood in {s.name}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No students require immediate attention</p>
                    <p className="text-sm text-muted-foreground">Great job supporting your class! 🎉</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="dashboard-tile">
                <CardHeader>
                  <CardTitle>Class Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Students with Happy Mood:</span>
                      <Badge className="mood-happy">
                        {filteredStudents.filter(s => getOverallStudentMood(s) === 'happy').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Students Needing Support:</span>
                      <Badge className="mood-concerned">
                        {filteredStudents.filter(s => ['concerned', 'burnout'].includes(getOverallStudentMood(s))).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Class Performance:</span>
                      <span className="font-medium">
                        {filteredStudents.length > 0 
                          ? Math.round(
                              filteredStudents
                                .flatMap(s => s.subjects)
                                .reduce((sum, s) => sum + s.marks, 0) / 
                              Math.max(1, filteredStudents.flatMap(s => s.subjects).length)
                            )
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-tile">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload Student Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Class Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Send Wellbeing Survey
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showExcelUpload && (
        <ExcelUpload onClose={() => setShowExcelUpload(false)} />
      )}
      
      {selectedStudent && (
        <TeacherNotes 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
};

export default TeacherDashboard;