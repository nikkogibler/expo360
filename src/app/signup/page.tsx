import Link from 'next/link';

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1ea] px-5 text-[#111827]">
      <section className="w-full max-w-lg rounded-lg border border-[#d8d1c2] bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#155e75]">
          Expo360 v1
        </p>
        <h1 className="mt-3 text-3xl font-semibold">SMB onboarding is invite-only.</h1>
        <p className="mt-4 text-sm leading-6 text-[#6b7280]">
          Self-serve signup is intentionally deferred while Interzekt validates the
          first sellable Studio workflow with selected SMB customers.
        </p>
        <Link
          href="/signin"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#155e75]"
        >
          Go to sign in
        </Link>
      </section>
    </main>
  );
}
