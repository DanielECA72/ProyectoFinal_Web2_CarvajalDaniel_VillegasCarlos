import { supabase } from './supabaseClient'

export async function uploadImage(file: File) {
  const fileName = `${Date.now()}_${file.name}`

  // Subir archivo al bucket 'imagenes'
  const { data, error } = await supabase.storage
    .from('img')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  // Obtener URL pública
  const { data: publicData } = supabase
    .storage
    .from('img')
    .getPublicUrl(data.path)

  return publicData.publicUrl
}
