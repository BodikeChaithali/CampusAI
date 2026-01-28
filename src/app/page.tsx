'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { GraduationCap, Upload, FileText, X, Loader2, Lightbulb } from 'lucide-react';
import { askQuestion, type AskQuestionState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export default function Home() {
  const [state, formAction] = useActionState(askQuestion, initialState);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const clientAction = (formData: FormData) => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Missing Document',
        description: 'Please upload a document.',
      });
      return;
    }
    formData.set('pdf', file);
    formAction(formData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 md:p-12">
        <div className="w-full max-w-4xl">
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-primary text-primary-foreground p-3 rounded-full mb-4 shadow-md">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">
              CampusAI
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Your intelligent assistant for campus documents.
            </p>
          </header>
          
          <form action={clientAction} className="space-y-8">
            <Card className="shadow-lg">
                <CardContent className="p-6 grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="pdf-upload-input">Upload Document</Label>
                    {isClient && file ? (
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
                        className={cn(
                          'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors',
                          'border-border'
                        )}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">Click to upload</span>
                          </p>
                          <p className="text-xs text-muted-foreground">PDF only</p>
                        </div>
                        <input
                          id="pdf-upload-input"
                          name="pdf"
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          accept="application/pdf"
                        />
                      </label>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="question">Ask a question</Label>
                    <Textarea
                      id="question"
                      name="question"
                      placeholder="e.g., What are the key topics in the lecture notes?"
                      required
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <SubmitButton />
                  </div>
                </CardContent>
            </Card>

            <AnswerSection answer={state.answer} />
          </form>

        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        Built with Google Gemini.
      </footer>
    </div>
  );
}
