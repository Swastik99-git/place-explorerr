import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  email: string;
  image_url: string | null;
  created_at: string;
};

export type Place = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  lat: number;
  lng: number;
  creator_id: string;
  created_at: string;
  profiles?: Profile;
};
