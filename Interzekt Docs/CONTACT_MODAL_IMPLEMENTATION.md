# Contact Modal Form Implementation

## Overview
A professional contact form modal has been integrated into both the Spanish and English landing pages. The form appears when users click the "Contáctanos" (Spanish) or "Contact Us" (English) button in the hero section.

## Features Implemented

### 1. **Modal Dialog**
- Smooth animated backdrop with blur effect
- Clean, centered form container with shadow
- Sticky close button in top-right corner
- Escape functionality (click outside modal to close)
- Responsive design (works on mobile, tablet, desktop)

### 2. **Form Fields**
- **Required Fields:**
  - First Name (Nombre)
  - Last Name (Apellido)
  - Email
  - Company (Empresa)

- **Optional Fields:**
  - Job Title (Cargo)
  - Phone/WhatsApp Number
  - Industry (Industria) - Select dropdown
  - Areas of Interest - Multi-select checkboxes
  - Event/Trade Show Name (Nombre del Evento/Feria Comercial)
  - How Did You Hear About Us - Select dropdown

### 3. **Form Interactions**
- All form fields update state in real-time
- Multi-select interest checkboxes with toggle functionality
- Form validation (required fields enforced by HTML5)
- Loading state during submission (button shows "Enviando..." / "Sending...")
- Success/error message display with color-coded backgrounds
- Auto-close modal 2 seconds after successful submission

### 4. **Styling & Animations**
- Framer Motion animations:
  - Backdrop fades in/out with opacity animation
  - Modal scales in/out with smooth transition
  - Form appears with scale and vertical translation
- Tailwind CSS styling with modern design
- Focus states on all inputs with blue ring
- Hover effects on buttons with scale transformation
- Status messages with green (success) or blue (error) backgrounds

### 5. **Security & Trust**
- Trust badges at bottom of form:
  - "Seguro y Privado" (Safe & Secure)
  - "Sin Spam Garantizado" (No Spam Guaranteed)
- Privacy policy acknowledgment text
- Professional appearance to build confidence

## Implementation Details

### Files Modified

**1. `/src/app/page.tsx` (Spanish Homepage)**
- Added modal state management (isModalOpen, isSubmitting, statusMessage, etc.)
- Added form data state with all fields
- Added industry and interest options arrays
- Added handleInputChange and handleInterestChange functions
- Added handleSubmit function for form submission
- Created ContactModal component with full form UI
- Updated "Contáctanos" button to open modal with onClick handler
- Added ContactModal to page render

**2. `/src/app/landing-en/page.tsx` (English Version)**
- Identical implementation with English translations
- All form labels, placeholders, and messages in English
- Same modal structure and functionality

### New API Endpoint

**Created: `/src/app/api/contact/route.ts`**
- POST endpoint that receives form submissions
- Validates required fields
- Generates email content with form data
- Development mode: Logs data to console
- Production mode: Ready for email service integration (Gmail, SendGrid, etc.)
- Returns appropriate success/error responses

## Form Data Structure

```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
  industry: string;
  interests: string[];
  eventName: string;
  howDidYouHear: string;
}
```

## Industry Options

Spanish Version:
- Muebles y Decoración
- Tecnología
- Moda
- Automoción
- Alimentos y Bebidas
- Belleza y Cosméticos
- Construcción
- Otro

English Version:
- Furniture & Décor
- Technology
- Fashion
- Automotive
- Food & Beverage
- Beauty & Cosmetics
- Construction
- Other

## Interest Options

Both versions include:
- Customer Capture / Captura de Clientes
- Real-Time Sales / Ventas en Tiempo Real
- Data Analytics / Análisis de Datos
- Integrations / Integraciones
- Dedicated Support / Soporte Dedicado

## How It Works

1. **User clicks "Contáctanos" button** in the hero section
2. **Modal opens** with smooth animation
3. **User fills out form** - all fields validated client-side
4. **User clicks submit button**
5. **Form data sent to `/api/contact`** via POST request
6. **API validates and processes** the submission
7. **Success message displayed** with option to close modal
8. **Modal auto-closes** after 2 seconds

## Styling Details

### Button Styling
- Gradient background: `from-blue-600 to-purple-600`
- Hover state: `from-blue-700 to-purple-700` + scale transform
- Disabled state: opacity 50% when submitting

### Input Styling
- Standard gray borders with focus ring (blue)
- Consistent padding and border radius
- Clean, minimal design matching landing page aesthetic

### Modal Container
- White background with rounded corners (2xl)
- Shadow for depth (shadow-2xl)
- Responsive max-width (max-w-2xl)
- Scrollable content when height exceeds 90vh

## Integration with Email Services (Production)

The API endpoint is ready for integration with email services. To enable email notifications, update `/src/app/api/contact/route.ts`:

### Option 1: Gmail (using nodemailer)
```typescript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'info0@interzekt.com',
  subject: `Nueva Solicitud de Demostración - ${data.firstName} ${data.lastName}`,
  html: emailContent,
  replyTo: data.email,
});
```

### Option 2: SendGrid
```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: 'info0@interzekt.com',
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: `Nueva Solicitud de Demostración`,
  html: emailContent,
  replyTo: data.email,
});
```

## Testing Checklist

- [x] Modal opens on button click
- [x] Modal closes on close button click
- [x] Modal closes on outside click
- [x] All form fields accept input
- [x] Form validation works (required fields)
- [x] Multi-select interests toggle correctly
- [x] Form submits to API endpoint
- [x] Success message displays on successful submission
- [x] Modal auto-closes after successful submission
- [x] Error messages display on failure
- [x] Loading state shows during submission
- [x] Responsive design works on all breakpoints
- [x] Animations smooth and performant
- [x] TypeScript types properly defined

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Future Enhancements

1. **Email Integration** - Wire up actual email sending
2. **Database Storage** - Save submissions to Supabase
3. **Auto-reply** - Send confirmation email to user
4. **Form Analytics** - Track submission rates and field completion
5. **CAPTCHA** - Add reCAPTCHA for spam protection
6. **File Upload** - Allow users to attach documents
7. **Calendar Integration** - Direct scheduling for demo
8. **CRM Integration** - Auto-sync with Salesforce/HubSpot
