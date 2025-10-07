import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudentDataFormProps {
  onClose: () => void;
}

const StudentDataForm: React.FC<StudentDataFormProps> = ({ onClose }) => {
  const { addSubjectData } = useApp();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    marks: '',
    attendance: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const marks = parseFloat(formData.marks);
    const attendance = parseFloat(formData.attendance);
    
    if (marks < 0 || marks > 100 || attendance < 0 || attendance > 100) {
      toast({
        title: "Invalid input",
        description: "Marks and attendance must be between 0 and 100%",
        variant: "destructive"
      });
      return;
    }

    addSubjectData({
      name: formData.name,
      marks,
      attendance
    });

    toast({
      title: "Subject added successfully! 🎉",
      description: "Your mood has been automatically predicted based on your performance.",
    });

    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Add Subject Performance
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject-name">Subject Name</Label>
            <Input
              id="subject-name"
              placeholder="e.g., Mathematics, Science"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marks" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Marks (%)
              </Label>
              <Input
                id="marks"
                type="number"
                min="0"
                max="100"
                placeholder="85"
                value={formData.marks}
                onChange={(e) => handleChange('marks', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendance" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Attendance (%)
              </Label>
              <Input
                id="attendance"
                type="number"
                min="0"
                max="100"
                placeholder="92"
                value={formData.attendance}
                onChange={(e) => handleChange('attendance', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="bg-lavender-soft p-4 rounded-lg">
            <p className="text-sm text-foreground font-medium mb-2">✨ Mood Prediction</p>
            <p className="text-xs text-muted-foreground">
              We'll automatically predict your mood based on your performance to help track your wellbeing!
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Subject
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDataForm;