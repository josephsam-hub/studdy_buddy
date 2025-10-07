import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ExcelUploadProps {
  onClose: () => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addBulkStudentData } = useApp();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.includes('spreadsheet') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setErrors([]);
        setSuccess(false);
      } else {
        setErrors(['Please select a valid Excel file (.xlsx or .xls)']);
      }
    }
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  const parseExcelData = async (file: File): Promise<any[]> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Simulate Excel parsing - in a real app, you'd use libraries like xlsx
        const sampleData = [
          { name: 'Alice Johnson', registrationNumber: 'ST001', subject: 'Mathematics', marks: 85, attendance: 92, class: 'Class A' },
          { name: 'Bob Smith', registrationNumber: 'ST002', subject: 'Science', marks: 78, attendance: 88, class: 'Class A' },
          { name: 'Carol Davis', registrationNumber: 'ST003', subject: 'English', marks: 92, attendance: 95, class: 'Class B' },
          { name: 'David Wilson', registrationNumber: 'ST004', subject: 'History', marks: 76, attendance: 82, class: 'Class B' },
          { name: 'Eva Brown', registrationNumber: 'ST005', subject: 'Geography', marks: 88, attendance: 90, class: 'Class C' },
        ];
        resolve(sampleData);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setErrors(['Please select a file first']);
      return;
    }

    setUploading(true);
    setProgress(0);
    setErrors([]);
    
    try {
      simulateProgress();
      
      // Simulate password verification if provided
      if (password && password !== 'demo123') {
        setTimeout(() => {
          setErrors(['Invalid password for encrypted file']);
          setUploading(false);
          setProgress(0);
        }, 1000);
        return;
      }

      // Parse the Excel file (simulated)
      const data = await parseExcelData(file);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validate and process data
      const validData: any[] = [];
      const validationErrors: string[] = [];
      
      data.forEach((row, index) => {
        if (!row.name || !row.registrationNumber || !row.subject || !row.marks || !row.attendance) {
          validationErrors.push(`Row ${index + 1}: Missing required fields`);
        } else if (row.marks < 0 || row.marks > 100) {
          validationErrors.push(`Row ${index + 1}: Invalid marks (${row.marks})`);
        } else if (row.attendance < 0 || row.attendance > 100) {
          validationErrors.push(`Row ${index + 1}: Invalid attendance (${row.attendance})`);
        } else {
          validData.push(row);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
      } else {
        // Process valid data
        addBulkStudentData(validData);
        setSuccess(true);
        toast({
          title: "Upload Successful!",
          description: `${validData.length} student records processed successfully.`,
        });
        
        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setErrors(['Failed to process file. Please check the format and try again.']);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Excel Upload - Student Data
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-3">
            <Label htmlFor="file-upload">Select Excel File</Label>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              {file ? (
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Click to upload Excel file</p>
                  <p className="text-sm text-muted-foreground">Supports .xlsx and .xls files</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Password (optional) */}
          <div className="space-y-2">
            <Label htmlFor="password">Password (if file is encrypted)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password for encrypted file"
            />
            <p className="text-xs text-muted-foreground">
              Demo password: demo123 (leave empty for unencrypted files)
            </p>
          </div>

          {/* Expected Format */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Expected Excel Format:</strong><br />
              Columns: Name, Registration Number, Subject, Marks (%), Attendance (%), Class
            </AlertDescription>
          </Alert>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success */}
          {success && (
            <Alert className="border-success/20 bg-success/5">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                File uploaded and processed successfully! Data has been added to the system.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              className="flex-1"
            >
              {uploading ? 'Processing...' : 'Upload & Process'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelUpload;