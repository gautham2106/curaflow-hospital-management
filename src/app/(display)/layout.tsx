import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Queue Display - CuraFlow',
  description: 'Live patient queue display screen.',
};

export default function DisplayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background text-foreground h-screen">
        {children}
    </div>
  );
}

    