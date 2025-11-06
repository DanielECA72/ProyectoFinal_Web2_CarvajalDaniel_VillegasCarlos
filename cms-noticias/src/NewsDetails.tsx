import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";

type NewsItem = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: string;
  image_url: string | null;
  author_name: string | null;
  status: string;
  created_at: string;
};

export default function NewsDetails() {
  const { id } = useParams();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Error cargando noticia:", error);
        setError("No se encontró la noticia o fue eliminada.");
      } else if (data.status !== "published") {
        setError("Esta noticia no está disponible públicamente.");
      } else {
        setNews(data);
      }

      setLoading(false);
    };

    fetchNews();
  }, [id]);

  if (loading) return <p style={{ textAlign: "center" }}>Cargando noticia...</p>;

  if (error)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>⚠️ {error}</h2>
        <Link
          to="/"
          style={{
            color: "#136f37",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Volver al portal
        </Link>
      </div>
    );

  if (!news) return null;

  return (
    <div className="main-container">
      <div className="news-detail">
        {news.image_url && (
          <img
            src={news.image_url}
            alt={news.title}
            className="news-detail-image"
          />
        )}
        <h1 className="news-detail-title">{news.title}</h1>
        {news.subtitle && (
          <h3 className="news-detail-subtitle">{news.subtitle}</h3>
        )}
        <div className="news-detail-meta">
          <span className="category">{news.category}</span> |{" "}
          <span className="date">
            {new Date(news.created_at).toLocaleDateString()}
          </span>
          {news.author_name && (
            <>
              {" "}
              | <span className="author">Por {news.author_name}</span>
            </>
          )}
        </div>
        <p className="news-detail-content">{news.content}</p>

        <div style={{ marginTop: "30px" }}>
          <Link
            to="/"
            style={{
              background: "#136f37",
              color: "white",
              padding: "10px 16px",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
