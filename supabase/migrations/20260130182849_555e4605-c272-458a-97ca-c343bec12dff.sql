-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS font_size_preference text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS accent_color text,
ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'system';

-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on chat_conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_conversations
CREATE POLICY "Users can view their own conversations"
ON public.chat_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.chat_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.chat_conversations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.chat_conversations
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at on chat_conversations
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_messages (via conversation ownership)
CREATE POLICY "Users can view messages from their conversations"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE id = chat_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their conversations"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE id = chat_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages from their conversations"
ON public.chat_messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations 
    WHERE id = chat_messages.conversation_id 
    AND user_id = auth.uid()
  )
);