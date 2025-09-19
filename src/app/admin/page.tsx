import MagicBento from '../../components/AdminDashboard';

export default function AdminPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: "url('/vine_2b.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
        backgroundPosition: 'center',
      }}
    >
      <MagicBento />
    </div>
  );
}
