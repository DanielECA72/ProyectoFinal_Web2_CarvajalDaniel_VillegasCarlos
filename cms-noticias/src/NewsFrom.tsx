import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { uploadImage } from "./lib/storage";

type NewsItem = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: string;
  image_url: string | null;
  status: "published" | "disabled" | "editing" | "finished";
  created_at: string;
  author_id?: string;
  author_name?: string;
};

export default function NewsForm({ isAdmin = false }: { isAdmin?: boolean }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Sociedad");
  const [images, setImages] = useState<FileList | null>(null);
  const [status, setStatus] = useState<"published" | "disabled">("published");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [user, setUser] = useState<any>(null);

  const categories = [
    "Sociedad",
    "Deportes",
    "Tecnología",
    "Cultura",
    "Educación",
    "Medio Ambiente",
  ];

  // 🟢 Obtener usuario autenticado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // 🟢 Cargar noticias del usuario (o todas si es admin)
  const fetchNews = async () => {
    const query = supabase.from("news").select("*").order("created_at", { ascending: false });
    const { data, error } = isAdmin ? await query : await query.eq("author_id", user?.id);
    if (error) console.error("❌ Error cargando noticias:", error);
    else setNewsList(data || []);
  };

  useEffect(() => {
    if (user) fetchNews();
  }, [user]);

  // 🟢 Crear o actualizar noticia
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let imageUrl = editing?.image_url || null;

      // ✅ Subir varias imágenes (si se seleccionan)
      if (images && images.length > 0) {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < images.length; i++) {
          const url = await uploadImage(images[i]);
          if (url) uploadedUrls.push(url);
        }
        imageUrl = uploadedUrls.join(","); // guardamos URLs separadas por coma
      }

      if (editing) {
        const { error } = await supabase
          .from("news")
          .update({
            title,
            subtitle,
            content,
            category,
            image_url: imageUrl,
            status,
          })
          .eq("id", editing.id)
          .eq("author_id", user?.id);

        if (error) throw error;
        setMessage("✅ Noticia actualizada correctamente");
      } else {
        console.log("🧍 Usuario:", user);
  console.log("🧾 Insertando noticia con author_id:", user?.id);

        const { error } = await supabase.from("news").insert([
          {
            title,
            subtitle,
            content,
            category,
            image_url: imageUrl,
            status,
            author_id: user?.id,
            author_name: user?.email || "Usuario",
          },
        ]);
        if (error) throw error;
        setMessage("✅ Noticia creada correctamente");
      }

      resetForm();
      fetchNews();
    } catch (err: any) {
      console.error("❌ Error guardando noticia:", err.message);
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Cambiar estado (Publicar / Ocultar)
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "disabled" : "published";
    const { error } = await supabase.from("news").update({ status: newStatus }).eq("id", id);

    if (error) console.error("❌ Error actualizando estado:", error);
    else {
      setMessage(`🔄 Estado cambiado a ${newStatus === "published" ? "Pública" : "Oculta"}`);
      fetchNews();
    }
  };

  // 🟢 Eliminar noticia
  const deleteNews = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta noticia?")) return;

    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) console.error("❌ Error eliminando noticia:", error);
    else {
      setMessage("🗑 Noticia eliminada correctamente");
      fetchNews();
    }
  };

  // 🟢 Editar noticia
  const editNews = (news: NewsItem) => {
    setEditing(news);
    setTitle(news.title);
    setSubtitle(news.subtitle);
    setContent(news.content);
    setCategory(news.category);
    setStatus(news.status === "disabled" ? "disabled" : "published");
  };

  // 🟢 Resetear formulario
  const resetForm = () => {
    setEditing(null);
    setTitle("");
    setSubtitle("");
    setContent("");
    setCategory("Sociedad");
    setImages(null);
    setStatus("published");
  };

  return (
    <div className="admin-wrapper">
      <form className="news-form" onSubmit={handleSubmit}>
        <h2>{editing ? "✏️ Editar Noticia" : "Crear Nueva Noticia"}</h2>

        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Subtítulo"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
        <textarea
          placeholder="Contenido..."
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {isAdmin && (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "published" | "disabled")}
          >
            <option value="published">Pública</option>
            <option value="disabled">Oculta</option>
          </select>
        )}

        {/* 🖼 Soporte múltiples imágenes */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(e.target.files)}
        />

        <button type="submit" disabled={loading}>
          {loading
            ? "Guardando..."
            : editing
            ? "Guardar Cambios"
            : "Publicar Noticia"}
        </button>

        {editing && (
          <button
            type="button"
            onClick={resetForm}
            style={{
              background: "#999",
              color: "white",
              marginTop: "5px",
              borderRadius: "5px",
              padding: "8px",
              cursor: "pointer",
            }}
          >
            Cancelar edición
          </button>
        )}

        {message && <p style={{ color: "#136f37", marginTop: "10px" }}>{message}</p>}
      </form>

      <div className="admin-list">
        <h3>Noticias Existentes</h3>
        {newsList.length === 0 ? (
          <p>No hay noticias creadas aún.</p>
        ) : (
          <table className="news-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {newsList.map((n) => (
                <tr key={n.id}>
                  <td>{n.title}</td>
                  <td>{n.category}</td>
                  <td
                    style={{
                      color: n.status === "published" ? "green" : "gray",
                      fontWeight: "bold",
                    }}
                  >
                    {n.status === "published" ? "Pública" : "Oculta"}
                  </td>
                  <td>{new Date(n.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => editNews(n)} className="edit-btn">
                      Editar
                    </button>
                    <button
                      onClick={() => toggleStatus(n.id, n.status)}
                      className={n.status === "published" ? "hide-btn" : "publish-btn"}
                    >
                      {n.status === "published" ? "Ocultar" : "Publicar"}
                    </button>
                    <button onClick={() => deleteNews(n.id)} className="delete-btn">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
