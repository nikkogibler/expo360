'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface LeadCaptureFormProps {
  slug: string;
  title: string;
  buttonLabel: string;
  products: Array<{ id: string; name: string }>;
}

export default function LeadCaptureForm({
  slug,
  title,
  buttonLabel,
  products,
}: LeadCaptureFormProps) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    selectedProductIds: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');
    setError('');

    try {
      const response = await fetch('/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...form }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'No se pudo enviar la solicitud.');

      setForm({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        selectedProductIds: [],
      });
      setStatus('Gracias. El equipo dará seguimiento pronto.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo enviar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submitLead}
      className="rounded-lg border border-black/10 bg-white p-5 text-[#111827] shadow-lg"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-5 space-y-4">
        {status ? (
          <div className="rounded-md border border-[#b7d7c7] bg-[#eef8f1] px-3 py-2 text-sm text-[#166534]">
            {status}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <Input label="Nombre" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} required />
        <Input label="Correo electrónico" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} required />
        <Input label="Teléfono" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
        <Input label="Empresa" value={form.company} onChange={(value) => setForm((current) => ({ ...current, company: value }))} />
        {products.length > 0 ? (
          <div>
            <p className="text-sm font-medium text-[#374151]">Productos de interés</p>
            <div className="mt-2 max-h-40 space-y-2 overflow-auto rounded-md border border-[#d1d5db] p-2">
              {products.map((product) => (
                <label key={product.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.selectedProductIds.includes(product.id)}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        selectedProductIds: event.target.checked
                          ? [...current.selectedProductIds, product.id]
                          : current.selectedProductIds.filter((id) => id !== product.id),
                      }));
                    }}
                    className="h-4 w-4"
                  />
                  {product.name}
                </label>
              ))}
            </div>
          </div>
        ) : null}
        <label className="block">
          <span className="text-sm font-medium text-[#374151]">Mensaje</span>
          <textarea
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            rows={4}
            className="mt-2 w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-black/10"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Enviando...' : buttonLabel || 'Solicitar información'}
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#374151]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-black/10"
      />
    </label>
  );
}
