import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface MessagePayload {
  sessionId: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { sessionId, message }: MessagePayload = await req.json();

    if (!sessionId || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabaseUrl = ('https://sptvwwkjtdqjjycdmmqy.supabase.co')!;
    const supabaseServiceKey = ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdHZ3d2tqdGRxamp5Y2RtbXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODMzMjIsImV4cCI6MjA3NjI1OTMyMn0._WANC6vDfwJUnh-ZeivIH7bb6b-sdFncKa7GnwluzO4')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: session, error: sessionError } = await supabase
      .from('couple_sessions')
      .select('sender_whatsapp, recipient_name')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { data: messageRecord, error: insertError } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        message_text: message,
        delivery_status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to save message' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    let deliveryStatus = 'sent';
    let responseMessage = 'Message saved successfully';

    if (twilioAccountSid && twilioAuthToken && twilioWhatsAppNumber) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const formattedMessage = `💌 Message from ${session.recipient_name}:\n\n${message}`;

        const formData = new URLSearchParams();
        formData.append('From', `whatsapp:${twilioWhatsAppNumber}`);
        formData.append('To', `whatsapp:${session.sender_whatsapp}`);
        formData.append('Body', formattedMessage);

        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        if (!twilioResponse.ok) {
          deliveryStatus = 'failed';
          responseMessage = 'Message saved but WhatsApp delivery failed';
        }
      } catch (twilioError) {
        deliveryStatus = 'failed';
        responseMessage = 'Message saved but WhatsApp delivery failed';
      }
    } else {
      responseMessage = 'Message saved (Twilio not configured)';
    }

    await supabase
      .from('messages')
      .update({ delivery_status: deliveryStatus })
      .eq('id', messageRecord.id);

    return new Response(
      JSON.stringify({ success: true, message: responseMessage }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
