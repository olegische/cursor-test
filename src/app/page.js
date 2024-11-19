import PaperSheet from './components/PaperSheet';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-background">
      <div className="w-full max-w-4xl space-y-8 py-8">
        <h1 className="text-4xl font-bold text-text text-center">Офигенные истории</h1>
        <PaperSheet />
      </div>
    </div>
  );
}
