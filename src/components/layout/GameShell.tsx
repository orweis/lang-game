import { BackButton } from "@/components/ui/BackButton";

interface GameShellProps {
  children: React.ReactNode;
  title?: string;
}

export function GameShell({ children, title }: GameShellProps) {
  return (
    <div className="min-h-screen bg-sky-100 pb-8">
      <BackButton />
      <div className="max-w-2xl mx-auto px-4 pt-20">
        {title && (
          <h1 className="text-4xl font-black text-center text-slate-800 mb-6">
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
}
