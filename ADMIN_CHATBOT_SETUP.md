# Admin Chatbot Setup Guide

## Overview
A floating chatbot component has been successfully integrated into the admin dashboard. The chatbot appears on all `/admin` pages and provides AI-powered assistance for admin users.

## What Was Implemented

### 1. **Components Created**
- **FloatingChatbot** (`src/components/FloatingChatbot.tsx`)
  - Floating chat button in bottom-right corner
  - Animated chat window with dark theme
  - Session management for conversations
  - Quick action buttons for common queries
  - Message history with timestamps
  
- **MessageFormatter** (`src/components/MessageFormatter.tsx`)
  - Formats chat messages with basic markdown support
  - Supports **bold text** and bullet points
  - Line break handling

### 2. **Layout Integration**
- **Admin Layout** (`src/app/admin/layout.tsx`)
  - Makes chatbot persistent across all admin pages
  - Automatically passes user email from cookies
  - Doesn't interfere with existing admin functionality

### 3. **Dependencies Installed**
- `lucide-react` - For beautiful icons (MessageCircle, X, Send, Sparkles, ArrowRight)
- Already had `framer-motion` for smooth animations

## Configuration

### Environment Variable
Add your webhook URL to `.env`:

```env
NEXT_PUBLIC_ADMIN_CHATBOT_WEBHOOK=https://automations.interzekt.com/webhook/YOUR_WEBHOOK_NAME_HERE
```

**Important:** Replace `YOUR_WEBHOOK_NAME_HERE` with your actual webhook name.

### Vercel Configuration
Don't forget to add this same environment variable to your Vercel project:

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add: `NEXT_PUBLIC_ADMIN_CHATBOT_WEBHOOK`
4. Set the value to your webhook URL
5. Apply to Production, Preview, and Development environments

## Webhook Payload Structure

The chatbot sends the following payload to your webhook:

```json
{
  "message": "User's message text",
  "session_id": "session_1728000000_abc123",
  "user_email": "admin@example.com",
  "timestamp": "2025-10-07T12:00:00.000Z",
  "context": "kusam-admin-dashboard-chat"
}
```

### Expected Response Format

Your webhook should respond with:

```json
{
  "response": "AI assistant's reply message",
  "message": "Alternative response field (fallback)"
}
```

## Features

### Quick Actions (Spanish)
Pre-configured quick action buttons for common admin tasks:
- 📊 Ayuda con Reportes
- 🖼️ Gestión de Imágenes
- 🛋️ Catálogo de Productos
- ⚙️ Configuración

### Session Management
- Each conversation has a unique session ID
- Users can start new conversations with the green "+" button
- Session ID is displayed in the header for debugging

### Error Handling
- Graceful fallback if webhook fails
- Shows Spanish error message to user
- Logs errors to console for debugging

## Customization

### Change Language to English
Edit `src/components/FloatingChatbot.tsx`:

```typescript
// Change initial message
content: 'Hi! I\'m your Kusam assistant. How can I help you today?',

// Change placeholder
placeholder="Type your question..."

// Update quick actions
const quickActions = [
  { label: 'Reports Help', icon: '📊', query: 'How do I use the dashboard reports?' },
  { label: 'Image Management', icon: '🖼️', query: 'How do I manage the image library?' },
  { label: 'Product Catalog', icon: '🛋️', query: 'Help me with the product catalog' },
  { label: 'Settings', icon: '⚙️', query: 'What settings are available?' },
];
```

### Add Video Background
Uncomment the video section in `FloatingChatbot.tsx` (around line 260):

```tsx
<video
  autoPlay
  loop
  muted
  playsInline
  className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
  style={{ filter: 'blur(1px)' }}
>
  <source src="/videos/backgroundvideo2_wave.mp4" type="video/mp4" />
</video>
```

Make sure you have the video file at `/public/videos/backgroundvideo2_wave.mp4`

### Customize Colors/Styling
The chatbot uses Tailwind classes and inline styles. Key styling sections:
- **Chat button**: Line 178-189
- **Header**: Line 211-221
- **Message bubbles**: Line 280-295
- **Input field**: Line 406-412

## Testing

1. Navigate to any `/admin` page
2. Click the floating chat button in the bottom-right
3. Try sending a message
4. Check browser console for webhook logs
5. Try quick action buttons
6. Start a new conversation with the "+" button

## Troubleshooting

### Chatbot doesn't appear
- Check that you're on an `/admin` route
- Verify the layout file was created correctly
- Check browser console for errors

### Messages not sending
- Verify `NEXT_PUBLIC_ADMIN_CHATBOT_WEBHOOK` is set in `.env`
- Check that webhook URL is correct
- Look for errors in browser console
- Verify webhook is responding with correct format

### No response from webhook
- Check webhook logs in your automation platform
- Verify payload structure matches expectations
- Test webhook with curl/Postman first

## Files Modified/Created

```
✅ Created: src/components/FloatingChatbot.tsx
✅ Created: src/components/MessageFormatter.tsx
✅ Created: src/app/admin/layout.tsx
✅ Modified: .env (added NEXT_PUBLIC_ADMIN_CHATBOT_WEBHOOK)
✅ Installed: lucide-react package
```

## Next Steps

1. ✅ Set up your webhook in your automation platform
2. ✅ Update `.env` with your webhook URL
3. ✅ Add the same variable to Vercel
4. ✅ Deploy and test in production
5. 🎨 Customize messages and styling as needed
6. 🤖 Configure your AI assistant responses

---

**Note:** The chatbot only appears on `/admin` routes and will not affect the main customer-facing parts of your app.
