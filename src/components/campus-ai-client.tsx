'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { askQuestion, type AskQuestionState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const initialState: AskQuestionState = {
  answer: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Getting Answer...
        </>
      ) : (
        'Get Answer'
      )}
    </Button>
  );
}

export function CampusAIClient() {
  const [state, formAction] = useActionState(askQuestion, initialState);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a PDF file.',
        });
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
       if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        if(fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(droppedFile);
          fileInputRef.current.files = dataTransfer.files;
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a PDF file.',
        });
      }
    }
  };

  const clientAction = (formData: FormData) => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Missing PDF',
        description: 'Please upload a PDF document.',
      });
      return;
    }
    formData.set('pdf', file);
    formAction(formData);
  };

  return (
    <form ref={formRef} action={clientAction} className="space-y-8">
      <Card className="shadow-lg">
          <CardContent className="p-6 grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="pdf-upload">Upload Document</Label>
              {file ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="font-medium text-sm truncate">{file.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="pdf-upload-input"
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors',
                    isDragging ? 'border-primary bg-secondary' : 'border-border'
                  )}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF only (MAX. 10MB)</p>
                  </div>
                  <input
                    id="pdf-upload-input"
                    name="pdf"
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="question">Ask a question</Label>
              <Textarea
                id="question"
                name="question"
                placeholder="e.g., What are the key deadlines for the project?"
                required
                className="min-h-[100px] resize-none"
              />
            </div>
            <div className="flex justify-end">
              <SubmitButton />
            </div>
          </CardContent>
      </Card>

      <AnswerSection key={state.timestamp} answer={state.answer} />
    </form>
  );
}

function AnswerSection({ answer }: { answer: string | null }) {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Answer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!answer) {
    return null;
  }
  
  return (
    <Card className="shadow-lg animate-in fade-in-0 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Answer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap font-body text-foreground/90">
          {answer}
        </p>
      </CardContent>
    </Card>
  );
}
