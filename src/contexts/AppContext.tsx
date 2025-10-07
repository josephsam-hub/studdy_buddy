import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Subject {
  id: string;
  name: string;
  marks: number;
  attendance: number;
  mood: 'happy' | 'neutral' | 'concerned' | 'burnout';
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: 'happy' | 'neutral' | 'concerned' | 'burnout';
  notes: string;
  activities: string[];
}

export interface TeacherNote {
  id: string;
  studentId: string;
  content: string;
  timestamp: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface Student {
  id: string;
  name: string;
  registrationNumber: string;
  subjects: Subject[];
  journalEntries: JournalEntry[];
  class: string;
}

export interface User {
  id: string;
  name: string;
  role: 'student' | 'teacher';
  registrationNumber?: string;
}

interface AppContextType {
  currentUser: User | null;
  students: Student[];
  teacherNotes: TeacherNote[];
  login: (user: User) => void;
  logout: () => void;
  addSubjectData: (subjectData: Omit<Subject, 'id' | 'timestamp' | 'mood'>) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateSubjectData: (subjectId: string, data: Partial<Subject>) => void;
  getStudentMoodTrend: (studentId: string) => any[];
  getAllStudentsData: () => Student[];
  addBulkStudentData: (data: any[]) => void;
  addTeacherNote: (studentId: string, content: string, priority?: 'high' | 'medium' | 'low') => Promise<void>;
  getTeacherNotes: (studentId: string) => TeacherNote[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mood prediction logic based on marks and attendance
const predictMood = (marks: number, attendance: number): 'happy' | 'neutral' | 'concerned' | 'burnout' => {
  const avgScore = (marks + attendance) / 2;
  
  if (avgScore >= 85) return 'happy';
  if (avgScore >= 70) return 'neutral';
  if (avgScore >= 50) return 'concerned';
  return 'burnout';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherNotes, setTeacherNotes] = useState<TeacherNote[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('educp-user');
    const savedStudents = localStorage.getItem('educp-students');
    const savedNotes = localStorage.getItem('educp-teacher-notes');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
    
    if (savedNotes) {
      setTeacherNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('educp-students', JSON.stringify(students));
    }
  }, [students]);

  useEffect(() => {
    if (teacherNotes.length > 0) {
      localStorage.setItem('educp-teacher-notes', JSON.stringify(teacherNotes));
    }
  }, [teacherNotes]);

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('educp-user', JSON.stringify(user));
    
    // Create student profile if doesn't exist
    if (user.role === 'student') {
      setStudents(prev => {
        const existing = prev.find(s => s.registrationNumber === user.registrationNumber);
        if (!existing) {
          const newStudent: Student = {
            id: user.id,
            name: user.name,
            registrationNumber: user.registrationNumber!,
            subjects: [],
            journalEntries: [],
            class: 'Class A' // Default class
          };
          return [...prev, newStudent];
        }
        return prev;
      });
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('educp-user');
  };

  const addSubjectData = (subjectData: Omit<Subject, 'id' | 'timestamp' | 'mood'>) => {
    if (!currentUser || currentUser.role !== 'student') return;
    
    const mood = predictMood(subjectData.marks, subjectData.attendance);
    const newSubject: Subject = {
      ...subjectData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      mood
    };

    setStudents(prev => prev.map(student => 
      student.registrationNumber === currentUser.registrationNumber
        ? { ...student, subjects: [...student.subjects, newSubject] }
        : student
    ));
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    if (!currentUser || currentUser.role !== 'student') return;
    
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString()
    };

    setStudents(prev => prev.map(student => 
      student.registrationNumber === currentUser.registrationNumber
        ? { ...student, journalEntries: [...student.journalEntries, newEntry] }
        : student
    ));
  };

  const updateSubjectData = (subjectId: string, data: Partial<Subject>) => {
    if (!currentUser || currentUser.role !== 'student') return;

    setStudents(prev => prev.map(student => 
      student.registrationNumber === currentUser.registrationNumber
        ? {
            ...student,
            subjects: student.subjects.map(subject =>
              subject.id === subjectId ? { ...subject, ...data } : subject
            )
          }
        : student
    ));
  };

  const getStudentMoodTrend = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return [];

    // Combine subject moods and journal entries for trend analysis
    const moodData = [
      ...student.subjects.map(s => ({
        date: s.timestamp,
        mood: s.mood,
        type: 'academic'
      })),
      ...student.journalEntries.map(j => ({
        date: j.date,
        mood: j.mood,
        type: 'journal'
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return moodData;
  };

  const getAllStudentsData = () => {
    return students;
  };

  const addBulkStudentData = (data: any[]) => {
    const newStudents: Student[] = [];
    
    data.forEach(row => {
      const existingStudent = students.find(s => s.registrationNumber === row.registrationNumber);
      
      if (existingStudent) {
        // Add subject to existing student
        const newSubject: Subject = {
          id: Date.now().toString() + Math.random(),
          name: row.subject,
          marks: row.marks,
          attendance: row.attendance,
          mood: predictMood(row.marks, row.attendance),
          timestamp: new Date().toISOString()
        };
        
        setStudents(prev => prev.map(student => 
          student.registrationNumber === row.registrationNumber
            ? { ...student, subjects: [...student.subjects, newSubject] }
            : student
        ));
      } else {
        // Create new student
        const newStudent: Student = {
          id: Date.now().toString() + Math.random(),
          name: row.name,
          registrationNumber: row.registrationNumber,
          class: row.class || 'Unassigned',
          subjects: [{
            id: Date.now().toString() + Math.random(),
            name: row.subject,
            marks: row.marks,
            attendance: row.attendance,
            mood: predictMood(row.marks, row.attendance),
            timestamp: new Date().toISOString()
          }],
          journalEntries: []
        };
        newStudents.push(newStudent);
      }
    });
    
    if (newStudents.length > 0) {
      setStudents(prev => [...prev, ...newStudents]);
    }
  };

  const addTeacherNote = async (studentId: string, content: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    const newNote: TeacherNote = {
      id: Date.now().toString(),
      studentId,
      content,
      priority,
      timestamp: new Date().toISOString()
    };
    
    setTeacherNotes(prev => [...prev, newNote]);
  };

  const getTeacherNotes = (studentId: string): TeacherNote[] => {
    return teacherNotes
      .filter(note => note.studentId === studentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      students,
      teacherNotes,
      login,
      logout,
      addSubjectData,
      addJournalEntry,
      updateSubjectData,
      getStudentMoodTrend,
      getAllStudentsData,
      addBulkStudentData,
      addTeacherNote,
      getTeacherNotes
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};