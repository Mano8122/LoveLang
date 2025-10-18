import { useState } from 'react';
import { Heart } from 'lucide-react';

interface InitialPopupProps {
  onSubmit: (whatsapp: string, recipientName: string, sessionId: string) => void;
}

export default function InitialPopup({ onSubmit }: InitialPopupProps) {
  const [whatsapp, setWhatsapp] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!whatsapp.trim() || !recipientName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(whatsapp.replace(/\s/g, ''))) {
      setError('Please enter a valid WhatsApp number (e.g., +14155552671)');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/rest/v1/couple_sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          sender_whatsapp: whatsapp.replace(/\s/g, ''),
          recipient_name: recipientName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      const sessionId = data[0].id;

      onSubmit(whatsapp, recipientName, sessionId);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slide-up">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-4 rounded-full animate-pulse-slow">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Let's Connect Hearts
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Share your details to open a loving conversation
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
              Your WhatsApp Number
            </label>
            <input
              type="tel"
              id="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+1 415 555 2671"
              className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
              Your Partner's Name
            </label>
            <input
              type="text"
              id="recipient"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter their name"
              className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none transition-colors"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 px-4 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isSubmitting ? 'Creating...' : 'Continue with Love'}
          </button>
        </form>
      </div>
    </div>
  );
}
