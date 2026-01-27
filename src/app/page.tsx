import { GraduationCap } from 'lucide-react';
import { CampusAIClient } from '@/components/campus-ai-client';

export default function Home() {
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
          <CampusAIClient />
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        Built with Google Gemini.
      </footer>
    </div>
  );
}
