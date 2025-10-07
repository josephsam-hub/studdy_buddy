import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useApp } from '@/contexts/AppContext';
import { TrendingUp, Calendar, BookOpen, Heart } from 'lucide-react';

const MoodTrendChart: React.FC = () => {
  const { currentUser, getStudentMoodTrend, students } = useApp();
  
  const currentStudent = students.find(s => s.registrationNumber === currentUser?.registrationNumber);
  const moodData = getStudentMoodTrend(currentStudent?.id || '');

  // Convert mood to numeric values for charting
  const moodToValue = (mood: string) => {
    const moodMap = { happy: 4, neutral: 3, concerned: 2, burnout: 1 };
    return moodMap[mood as keyof typeof moodMap] || 3;
  };

  // Prepare data for charts
  const chartData = moodData.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: moodToValue(item.mood),
    moodLabel: item.mood,
    type: item.type,
    index
  }));

  // Academic performance trend
  const academicData = currentStudent?.subjects.map((subject, index) => ({
    subject: subject.name.length > 10 ? subject.name.substring(0, 10) + '...' : subject.name,
    marks: subject.marks,
    attendance: subject.attendance,
    mood: moodToValue(subject.mood),
    index
  })) || [];

  // Mood distribution
  const moodDistribution = moodData.reduce((acc, item) => {
    acc[item.mood] = (acc[item.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const distributionData: { mood: string; count: number; emoji: string }[] = Object.entries(moodDistribution).map(([mood, count]) => ({
    mood: mood.charAt(0).toUpperCase() + mood.slice(1),
    count: count as number,
    emoji: ({ happy: '😊', neutral: '😐', concerned: '😟', burnout: '😰' }[mood] || '😐') as string
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Mood: {payload[0]?.payload?.moodLabel || 'Unknown'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Mood & Academic Trends
        </h2>
        <p className="text-muted-foreground">Track your wellbeing and performance over time</p>
      </div>

      {moodData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Trend Over Time */}
          <Card className="dashboard-tile">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Mood Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[1, 4]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const labels = { 1: '😰', 2: '😟', 3: '😐', 4: '😊' };
                      return labels[value as keyof typeof labels] || '';
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Mood Distribution */}
          <Card className="dashboard-tile">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Mood Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="mood"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Count']}
                    labelFormatter={(label) => `${label} Days`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Academic Performance */}
          {academicData.length > 0 && (
            <Card className="dashboard-tile lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Academic Performance vs Mood
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={academicData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="subject"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'marks' ? `${value}%` : 
                        name === 'attendance' ? `${value}%` : value,
                        name === 'marks' ? 'Marks' : 
                        name === 'attendance' ? 'Attendance' : 'Mood Score'
                      ]}
                    />
                    <Bar dataKey="marks" fill="hsl(var(--primary))" name="marks" />
                    <Bar dataKey="attendance" fill="hsl(var(--lavender))" name="attendance" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="mood-card">
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Data Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start adding subject data and journal entries to see your trends!
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>💡 Add subject performance to track academic mood</p>
              <p>📝 Log daily journal entries to monitor wellbeing</p>
              <p>📈 Watch your progress grow over time</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {moodData.length > 0 && (
        <Card className="mood-card border-success/20 bg-success-soft/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              Insights & Encouragement
            </h3>
            <div className="space-y-2 text-sm">
              {(() => {
                const happyCount = distributionData.find(d => d.mood === 'Happy')?.count || 0;
                return happyCount > 0 && (
                  <p>🌟 Great job! You've had {happyCount} happy days recently.</p>
                );
              })()}
              {currentStudent?.subjects && currentStudent.subjects.length > 0 && (
                <p>📚 You're tracking {currentStudent.subjects.length} subjects - consistency is key to success!</p>
              )}
              <p>💪 Remember: Every challenge is an opportunity to grow. You've got this!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MoodTrendChart;