import { redirect } from 'next/navigation';

export default function AdminSignInRedirect() {
  redirect('/signin');
}
