
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Funnels table
CREATE TABLE public.funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own funnels" ON public.funnels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create funnels" ON public.funnels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own funnels" ON public.funnels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own funnels" ON public.funnels FOR DELETE USING (auth.uid() = user_id);

-- Funnel blocks
CREATE TABLE public.funnel_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video', 'audio', 'buttons', 'input', 'delay', 'condition', 'redirect')),
  content JSONB DEFAULT '{}',
  position_x DOUBLE PRECISION DEFAULT 0,
  position_y DOUBLE PRECISION DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  next_block_id UUID REFERENCES public.funnel_blocks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnel_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage blocks via funnel ownership" ON public.funnel_blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = funnel_blocks.funnel_id AND funnels.user_id = auth.uid())
  );

-- Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  data JSONB DEFAULT '{}',
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view leads from their funnels" ON public.leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = leads.funnel_id AND funnels.user_id = auth.uid())
  );

CREATE POLICY "Anyone can insert leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Funnel visits
CREATE TABLE public.funnel_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  visitor_id TEXT,
  step_reached INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  clicks JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnel_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view visits from their funnels" ON public.funnel_visits
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.funnels WHERE funnels.id = funnel_visits.funnel_id AND funnels.user_id = auth.uid())
  );

CREATE POLICY "Anyone can insert visits" ON public.funnel_visits
  FOR INSERT WITH CHECK (true);

-- Updated at function and triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_funnels_updated_at BEFORE UPDATE ON public.funnels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_funnels_user_id ON public.funnels(user_id);
CREATE INDEX idx_funnels_slug ON public.funnels(slug);
CREATE INDEX idx_leads_funnel_id ON public.leads(funnel_id);
CREATE INDEX idx_funnel_visits_funnel_id ON public.funnel_visits(funnel_id);
CREATE INDEX idx_funnel_blocks_funnel_id ON public.funnel_blocks(funnel_id);
