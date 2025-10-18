/*
  # Create Couple Messages System

  ## Overview
  Creates a system for couples to send messages that get delivered via WhatsApp.

  ## Tables Created
  
  ### `couple_sessions`
  Stores sender information for each conversation session
  - `id` (uuid, primary key) - Unique session identifier
  - `sender_whatsapp` (text) - Sender's WhatsApp number (E.164 format)
  - `recipient_name` (text) - Name of the recipient/partner
  - `created_at` (timestamptz) - When session was created
  
  ### `messages`
  Stores all messages sent through the platform
  - `id` (uuid, primary key) - Unique message identifier
  - `session_id` (uuid, foreign key) - Links to couple_sessions
  - `message_text` (text) - The actual message content
  - `sent_at` (timestamptz) - When message was sent
  - `delivery_status` (text) - Status: 'pending', 'sent', 'failed'
  
  ## Security
  - RLS enabled on both tables
  - Public can insert sessions (for initial popup)
  - Public can insert messages (for sending responses)
  - No read policies (privacy protection - messages go directly to WhatsApp)
  
  ## Notes
  - WhatsApp numbers should be in E.164 format (e.g., +14155552671)
  - Messages are stored for audit purposes but primary delivery is via WhatsApp
  - No user authentication required for simplicity and accessibility
*/

-- Create couple_sessions table
CREATE TABLE IF NOT EXISTS couple_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_whatsapp text NOT NULL,
  recipient_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES couple_sessions(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  delivery_status text DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE couple_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create sessions (initial popup submission)
CREATE POLICY "Anyone can create couple sessions"
  ON couple_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anyone to create messages
CREATE POLICY "Anyone can create messages"
  ON messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);