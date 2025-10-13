// src/components/CustomerInfoForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/utils/supabase';
import { parseFullName, Customer } from '@/utils/nameParser';

interface CustomerInfoFormProps {
  customer: Customer | null;
  totalAmount: number;
  onComplete: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  customerType: string;
  shippingStreet: string;
  shippingColonia: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  billingSameAsShipping: boolean;
  billingStreet: string;
  billingColonia: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
}

const MEXICAN_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
  'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

export default function CustomerInfoForm({ customer, totalAmount, onComplete }: CustomerInfoFormProps) {
  // Parse name if first_name/last_name are empty
  const parsedName = parseFullName(customer?.name);
  const initialFirstName = customer?.first_name || parsedName.firstName;
  const initialLastName = customer?.last_name || parsedName.lastName;

  const [formData, setFormData] = useState<FormData>({
    firstName: initialFirstName,
    lastName: initialLastName,
    email: customer?.email?.endsWith('@temp.com') ? '' : (customer?.email || ''),
    whatsapp: customer?.whatsapp || '',
    customerType: customer?.customer_type || '',
    shippingStreet: customer?.shipping_street || '',
    shippingColonia: customer?.shipping_colonia || '',
    shippingCity: customer?.shipping_city || '',
    shippingState: customer?.shipping_state || '',
    shippingPostalCode: customer?.shipping_postal_code || '',
    billingSameAsShipping: customer?.billing_same_as_shipping ?? true,
    billingStreet: customer?.billing_street || '',
    billingColonia: customer?.billing_colonia || '',
    billingCity: customer?.billing_city || '',
    billingState: customer?.billing_state || '',
    billingPostalCode: customer?.billing_postal_code || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Determine which sections need to be shown
  const needsBasicInfo = !customer?.name || 
                         parsedName.isAnonymous ||
                         !customer?.email ||
                         customer.email.endsWith('@temp.com') ||
                         !customer?.whatsapp ||
                         !customer?.customer_type;

  const needsShippingInfo = !customer?.shipping_street ||
                            !customer?.shipping_colonia ||
                            !customer?.shipping_city ||
                            !customer?.shipping_state ||
                            !customer?.shipping_postal_code;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const customerId = localStorage.getItem('kusam_customer_id');
      
      if (!customerId) {
        throw new Error('No se encontró el ID de cliente');
      }

      // Prepare update object
      const updateData: any = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        whatsapp: formData.whatsapp.trim(),
        customer_type: formData.customerType,
        shipping_street: formData.shippingStreet.trim(),
        shipping_colonia: formData.shippingColonia.trim(),
        shipping_city: formData.shippingCity.trim(),
        shipping_state: formData.shippingState,
        shipping_postal_code: formData.shippingPostalCode.trim(),
        shipping_country: 'México',
        billing_same_as_shipping: formData.billingSameAsShipping,
        checkout_info_complete: true,
      };

      // Add billing address if different from shipping
      if (!formData.billingSameAsShipping) {
        updateData.billing_street = formData.billingStreet.trim();
        updateData.billing_colonia = formData.billingColonia.trim();
        updateData.billing_city = formData.billingCity.trim();
        updateData.billing_state = formData.billingState;
        updateData.billing_postal_code = formData.billingPostalCode.trim();
        updateData.billing_country = 'México';
      } else {
        // Copy shipping to billing
        updateData.billing_street = formData.shippingStreet.trim();
        updateData.billing_colonia = formData.shippingColonia.trim();
        updateData.billing_city = formData.shippingCity.trim();
        updateData.billing_state = formData.shippingState;
        updateData.billing_postal_code = formData.shippingPostalCode.trim();
        updateData.billing_country = 'México';
      }

      const { error: updateError } = await supabase
        .from('customers')
        .update(updateData)
        .eq('customer_id', customerId);

      if (updateError) throw updateError;

      // Success! Call parent callback to show payment methods
      onComplete();

    } catch (err: any) {
      console.error('Error saving customer info:', err);
      setError(err.message || 'Error al guardar tu información. Por favor intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
          <span className="mr-2">📋</span> Información de Contacto y Envío
        </h3>
        <p className="text-sm text-blue-700">
          Para completar tu compra de <strong>{formatCurrency(totalAmount)}</strong>, 
          necesitamos confirmar tu información de contacto y dirección de envío.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Contact Info Section */}
        {needsBasicInfo && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 border-b border-gray-300 pb-2">
              Información de Contacto
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Ej. Juan"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Ej. Pérez García"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Ej. juan.perez@ejemplo.com"
                required
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Ej. +52 55 1234 5678"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Incluye código de país (Ej. +52 para México)</p>
            </div>

            {/* Customer Type / Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿A qué te dedicas? <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              >
                <option value="">Selecciona tu industria</option>
                <option value="ArquitecturaDiseño">Despacho de Arquitectura/Diseño</option>
                <option value="HoteleriaTurismo">Hotel / Resort / Turismo</option>
                <option value="RestaurantesCafes">Restaurante / Cafetería</option>
                <option value="DesarrolladorInmobiliario">Desarrollador Inmobiliario</option>
                <option value="ConstructorContratista">Constructora / Contratista</option>
                <option value="Inversionista">Inversionista</option>
                <option value="SectorPublico">Sector Público (Gobierno)</option>
                <option value="SpaBienestar">Spa / Centro de Bienestar</option>
                <option value="ClubDeportivoSocial">Club Deportivo / Social</option>
                <option value="ResidencialParticular">Cliente Residencial / Particular</option>
                <option value="ComercioRetail">Comercio / Retail</option>
                <option value="Educacion">Institución Educativa</option>
                <option value="Industrial">Sector Industrial</option>
                <option value="SaludMedicina">Salud / Medicina (Clínicas, Hospitales)</option>
                <option value="Agroindustria">Agroindustria</option>
                <option value="OtroNegocio">Otro Tipo de Negocio</option>
                <option value="Estudiante">Estudiante / Académico</option>
              </select>
            </div>
          </div>
        )}

        {/* Shipping Address Section */}
        {needsShippingInfo && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 border-b border-gray-300 pb-2">
              Dirección de Envío
            </h4>

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calle y Número <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shippingStreet}
                onChange={(e) => setFormData({ ...formData, shippingStreet: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Ej. Av. Reforma 123, Int. 4B"
                required
              />
            </div>

            {/* Colonia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colonia <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shippingColonia}
                onChange={(e) => setFormData({ ...formData, shippingColonia: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Ej. Polanco"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.shippingCity}
                  onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Ej. Ciudad de México"
                  required
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.shippingState}
                  onChange={(e) => setFormData({ ...formData, shippingState: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                >
                  <option value="">Selecciona estado</option>
                  {MEXICAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Postal Code */}
            <div className="md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Postal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shippingPostalCode}
                onChange={(e) => setFormData({ ...formData, shippingPostalCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Ej. 11560"
                maxLength={5}
                pattern="[0-9]{5}"
                required
              />
            </div>
          </div>
        )}

        {/* Billing Address Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b border-gray-300 pb-2">
            Dirección de Facturación
          </h4>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="billingSameAsShipping"
              checked={formData.billingSameAsShipping}
              onChange={(e) => setFormData({ ...formData, billingSameAsShipping: e.target.checked })}
              className="mt-1 mr-3"
            />
            <label htmlFor="billingSameAsShipping" className="text-sm text-gray-700 cursor-pointer">
              La dirección de facturación es la misma que la dirección de envío
            </label>
          </div>

          {!formData.billingSameAsShipping && (
            <div className="space-y-4 pl-4 border-l-2 border-gray-200">
              {/* Billing Street */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calle y Número <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.billingStreet}
                  onChange={(e) => setFormData({ ...formData, billingStreet: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Ej. Av. Insurgentes 456"
                  required={!formData.billingSameAsShipping}
                />
              </div>

              {/* Billing Colonia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colonia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.billingColonia}
                  onChange={(e) => setFormData({ ...formData, billingColonia: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Ej. Roma Norte"
                  required={!formData.billingSameAsShipping}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Billing City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.billingCity}
                    onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required={!formData.billingSameAsShipping}
                  />
                </div>

                {/* Billing State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.billingState}
                    onChange={(e) => setFormData({ ...formData, billingState: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required={!formData.billingSameAsShipping}
                  >
                    <option value="">Selecciona estado</option>
                    {MEXICAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Billing Postal Code */}
              <div className="md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.billingPostalCode}
                  onChange={(e) => setFormData({ ...formData, billingPostalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  maxLength={5}
                  pattern="[0-9]{5}"
                  required={!formData.billingSameAsShipping}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            <>
              Guardar y Continuar al Pago →
            </>
          )}
        </button>
      </form>
    </div>
  );
}
