import { supabase } from "./supabase.js";

export async function salvarProposta(dados) {
  const { data, error } = await supabase
    .from("propostas")
    .insert([{ dados }])
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function buscarProposta(id) {
  const { data, error } = await supabase
    .from("propostas")
    .select("dados")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data.dados;
}