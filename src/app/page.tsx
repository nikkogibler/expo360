// src/app/page.tsx
// This will be your root homepage, a Server Component by default.

import { redirect } from 'next/navigation'; // Import the redirect helper

export default function HomePage() {
  // Redirect to your main application entry point, which is '/kusam'
  // This happens on the server before the page even renders.
  redirect('/main');

  // This part of the component won't actually be rendered because of redirect()
  // but it's good practice to return something or indicate it's a component.
  return null; 
}