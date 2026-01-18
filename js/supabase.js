import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://ezrzxchlwtbcliflczvi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cnp4Y2hsd3RiY2xpZmxjenZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzQ4NDMsImV4cCI6MjA4MzgxMDg0M30.sQLInvX09isr4Tcy-5ggj0MfQow7kFrFH4MtvoKF92Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);