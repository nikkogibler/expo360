
'use client';
import ImageStandardizer from '../../../../components/ImageStandardizer';

export default function OptimizadorPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url('/vine_2b.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-3xl mx-auto p-6">
        <ImageStandardizer onBack={() => { window.location.href = '/admin/pro-shot-now'; }} />
      </div>
    </div>
  );
}
