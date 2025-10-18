import { useState } from 'react';
import InitialPopup from './components/InitialPopup';
import MessagePage from './components/MessagePage';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  const [showPopup, setShowPopup] = useState(true);
  const [recipientName, setRecipientName] = useState('');
  const [sessionId, setSessionId] = useState('');

  const handlePopupSubmit = (whatsapp: string, name: string, id: string) => {
    setRecipientName(name);
    setSessionId(id);
    setShowPopup(false);
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {showPopup ? (
        <InitialPopup onSubmit={handlePopupSubmit} />
      ) : (
        <MessagePage recipientName={recipientName} sessionId={sessionId} />
      )}
    </div>
  );
}

export default App;
