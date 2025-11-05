import BuildWizard from '@/components/BuildWizard';

export default function BuildPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-200 via-white to-blue-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <BuildWizard />
    </div>
  );
}
