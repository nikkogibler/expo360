"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminList } from '../../../config/adminList';
import Image from 'next/image';
import { supabase } from "../../../../lib/supabaseClient";

export default function AdminSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [welcomeName, setWelcomeName] = useState('');
  const [genderedWelcome, setGenderedWelcome] = useState('');
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift();
      }
      return null;
    };

    const userEmail = getCookie('user_email');
    if (userEmail) {
      const decodedEmail = decodeURIComponent(userEmail);
      if (adminList.includes(decodedEmail)) {
        // User is already authenticated, redirect to admin
        router.push('/admin');
        return;
      }
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    // Authenticate with Supabase using email and password
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (authError || !data?.user) {
      setError('Correo o contraseña incorrectos.');
      return;
    }
    // Fetch username from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', data.user.id)
      .single();
    if (profileError || !profile) {
      setError('No se pudo encontrar el nombre de usuario.');
      return;
    }
    setWelcomeName(profile.name);
    const femaleNames = ['Naomi', 'Maria Esther', 'Maries'];
    const maleNames = ['Sebastian', 'Humberto', 'Gabriel'];
    let welcomeWord = 'Bienvenid@';
    if (femaleNames.includes(profile.name)) {
      welcomeWord = 'Bienvenida';
    } else if (maleNames.includes(profile.name)) {
      welcomeWord = 'Bienvenido';
    }
    setGenderedWelcome(welcomeWord);
    
    // Set cookie with better persistence and security
    const cookieValue = `user_email=${encodeURIComponent(email.trim().toLowerCase())}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = cookieValue;
    
    setTimeout(() => {
      router.push('/admin');
    }, 1500);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundImage: "url('/vine_2b.png')",
      backgroundRepeat: 'repeat',
      backgroundSize: '400px 400px',
      backgroundPosition: 'center',
      paddingTop: '22vh',
    }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <Image
          src="/kusam_main.webp"
          alt="Kusam Logo"
          width={200}
          height={60}
          style={{ objectFit: 'contain', display: 'block', margin: '0 auto', maxWidth: '100%', maxHeight: '100%' }}
          priority
        />
      </div>
  <form onSubmit={handleSubmit} autoComplete="on" style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', minWidth: '320px', marginTop: '0.5rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#4B2E09' }}>Acceso Administrador</h2>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd', color: '#4B2E09', fontWeight: 'bold' }}
          required
        />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '0.5rem', border: '1px solid #ddd', color: '#4B2E09', fontWeight: 'bold' }}
          required
        />
        <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#4B2E09', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold' }}>
          Ingresar
        </button>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        {welcomeName && genderedWelcome && (
          <p style={{ color: '#4B2E09', marginTop: '1.5rem', fontWeight: 'bold', fontSize: '1.25rem', textAlign: 'center' }}>
            {genderedWelcome} {welcomeName}!
          </p>
        )}
      </form>
    </div>
  );
}
