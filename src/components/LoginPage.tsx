import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { Heart, BookOpen, Users } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [studentData, setStudentData] = useState({ name: '', registrationNumber: '' });
  const [teacherData, setTeacherData] = useState({ name: '', password: '' });

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentData.name && studentData.registrationNumber) {
      login({
        id: `student-${studentData.registrationNumber}`,
        name: studentData.name,
        role: 'student',
        registrationNumber: studentData.registrationNumber
      });
    }
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherData.name && teacherData.password === 'teacher123') {
      login({
        id: `teacher-${teacherData.name}`,
        name: teacherData.name,
        role: 'teacher'
      });
    }
  };

  return (
    <div className="min-h-screen wellbeing-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-4 shadow-lg gentle-bounce">
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">EduCPromm</h1>
          <p className="text-muted-foreground text-lg">Student Wellbeing & Academic Monitoring</p>
          <p className="text-sm text-primary mt-2 font-medium">✨ We're here to help you succeed! ✨</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Teacher
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="student" className="space-y-4">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-name">Full Name</Label>
                    <Input
                      id="student-name"
                      placeholder="Enter your full name"
                      value={studentData.name}
                      onChange={(e) => setStudentData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registration-number">Registration Number</Label>
                    <Input
                      id="registration-number"
                      placeholder="e.g., 2024001"
                      value={studentData.registrationNumber}
                      onChange={(e) => setStudentData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    Continue as Student
                  </Button>
                </form>
                <p className="text-sm text-center text-muted-foreground">
                  🌟 Ready to track your amazing journey? 🌟
                </p>
              </TabsContent>
              
              <TabsContent value="teacher" className="space-y-4">
                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher-name">Teacher Name</Label>
                    <Input
                      id="teacher-name"
                      placeholder="Enter your name"
                      value={teacherData.name}
                      onChange={(e) => setTeacherData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-password">Password</Label>
                    <Input
                      id="teacher-password"
                      type="password"
                      placeholder="Enter password"
                      value={teacherData.password}
                      onChange={(e) => setTeacherData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-lavender hover:bg-lavender/90 text-foreground">
                    Access Teacher Dashboard
                  </Button>
                </form>
                <p className="text-sm text-center text-muted-foreground">
                  Demo password: teacher123
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            💙 Supporting student wellbeing through data-driven insights 💙
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;