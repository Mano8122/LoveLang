import { useState } from 'react';
import { Heart, Send } from 'lucide-react';

interface MessagePageProps {
  recipientName: string;
  sessionId: string;
}

export default function MessagePage({ recipientName, sessionId }: MessagePageProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const apiUrl = `${supabaseUrl}/functions/v1/send-whatsapp-message`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          sessionId,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setShowSuccess(true);
      setMessage('');

      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="max-w-2xl w-full z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-pink-400 fill-pink-400 animate-pulse-slow mr-2" />
            <h1 className="text-5xl md:text-6xl font-bold text-white cursive-title">
              Let's Talk, {recipientName}
            </h1>
            <Heart className="w-6 h-6 text-pink-400 fill-pink-400 animate-pulse-slow ml-2" />
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 animate-slide-up">
          <h2 className="text-3xl md:text-4xl text-center mb-8 cursive-subtitle text-gray-800">
            What's the problem?
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share what's on your heart..."
                rows={6}
                className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none transition-colors resize-none text-lg"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={!message.trim() || isSubmitting}
              className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white py-5 rounded-2xl font-semibold text-xl hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl flex items-center justify-center gap-3 group"
            >
              {isSubmitting ? (
                'Sending with Love...'
              ) : (
                <>
                  Send with Love
                  <Heart className="w-5 h-5 fill-white group-hover:animate-bounce" />
                </>
              )}
            </button>
          </form>

          {showSuccess && (
            <div className="mt-6 bg-green-50 border-2 border-green-200 text-green-700 px-6 py-4 rounded-2xl text-center animate-fade-in flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              <span className="font-medium">Message sent with love!</span>
            </div>
          )}

          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Your message will be delivered privately</p>
          </div>
        </div>
      </div>
    </div>
  );
}
