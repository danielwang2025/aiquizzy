
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calculator, Atom, FlaskConical, Microscope } from "lucide-react";
import { Label } from '@/components/ui/label';

interface SubjectSelectorProps {
  subject: string;
  setSubject: (subject: string) => void;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ subject, setSubject }) => {
  const subjectItems = [
    { name: 'Mathematics', value: 'math', icon: <Calculator className="h-4 w-4" /> },
    { name: 'Physics', value: 'physics', icon: <Atom className="h-4 w-4" /> },
    { name: 'Chemistry', value: 'chemistry', icon: <FlaskConical className="h-4 w-4" /> },
    { name: 'Biology', value: 'biology', icon: <Microscope className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      <Label htmlFor="subject">Select Subject</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {subjectItems.map((item) => (
          <Button
            key={item.value}
            type="button"
            variant={subject === item.value ? "default" : "outline"}
            className="flex items-center justify-center gap-2 h-14"
            onClick={() => setSubject(item.value)}
          >
            {item.icon}
            {item.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelector;
