import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { Link } from "react-router-dom";

type NewsItem = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: string;
  image_url: string | null;
  created_at: string;
  status: string;
};

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filtered, setFiltered] = useState<NewsItem[]>([]);
  const [category, setCategory] = useState("Todas");
  const [currentSlide, setCurrentSlide] = useState(0);

  const categories = [
    "Todas",
    "Sociedad",
    "Deportes",
    "Tecnología",
    "Cultura",
    "Educación",
    "Medio Ambiente",
  ];

  useEffect(() => {
    supabase
      .from("news")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setNews(data || []);
        setFiltered(data || []);
      });
  }, []);

  useEffect(() => {
    if (category === "Todas") setFiltered(news);
    else setFiltered(news.filter((n) => n.category === category));
  }, [category, news]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((p) => (filtered.length ? (p + 1) % filtered.length : 0));
    }, 7000);
    return () => clearInterval(timer);
  }, [filtered]);

  const featured = filtered[currentSlide];
  const others = filtered.filter((_, i) => i !== currentSlide);

  return (
    <div className="main-container">
      {/* ======= BANNER SUPERIOR ======= */}
      <div className="banner">
        <img src="/img/Banner1.jpeg" alt="Programa Ingeniería de Sistemas" />
      </div>

      {/* ======= HEADER ======= */}
      <header className="header">
        <div className="header-text">
          <h1>Portal de Noticias</h1>
          <p>Universidad de la Amazonia — Comunicación Institucional</p>
        </div>
      </header>

      {/* ======= CATEGORÍAS ======= */}
      <div className="categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={category === cat ? "active" : ""}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ======= CARRUSEL ======= */}
      {featured && (
        <section className="featured-news fade-slide">
          <Link to={`/news/${featured.id}`} style={{ textDecoration: "none" }}>
            <div className="featured-wrapper">
              <img
                src={featured.image_url || "https://via.placeholder.com/1200x500"}
                alt={featured.title}
              />
            </div>
            <div className="featured-text">
              <h2>{featured.title}</h2>
              <p>{featured.subtitle}</p>
            </div>
          </Link>
        </section>
      )}

      {/* ======= ÚLTIMAS NOTICIAS ======= */}
      <section className="latest-news">
        <h3>Últimas Noticias</h3>
        <div className="news-grid">
          {others.map((item) => (
            <Link
              key={item.id}
              to={`/news/${item.id}`}
              className="news-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img
                src={item.image_url || "https://via.placeholder.com/400x200"}
                alt={item.title}
              />
              <div className="news-card-content">
                <h4>{item.title}</h4>
                <p>{item.subtitle}</p>
                <small>
                  {item.category.toLowerCase()} —{" "}
                  {new Date(item.created_at).toLocaleDateString()}
                </small>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ======= BANNER INFERIOR ======= */}
      <div className="banner">
        <img src="/img/Banner2.jpeg" alt="Acreditación Institucional" />

      </div>

      {/* ======= UBICACIÓN ======= */}
      <section className="location">
        <h3>Ubicación — Universidad de la Amazonia</h3>
        <iframe
          title="Ubicación Universidad de la Amazonia"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3974.643272783685!2d-75.6060245241818!3d1.619448598402796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e244fdc58d2b6b9%3A0x24a14521b2d4e356!2sUniversidad%20de%20la%20Amazonia!5e0!3m2!1ses-419!2sco!4v1682357090131!5m2!1ses-419!2sco"
          width="100%"
          height="350"
          style={{ border: 0, borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>

      {/* ======= FOOTER ======= */}
      <footer className="footer">
        <p>© 2025 Universidad de la Amazonia</p>
        <p>
          Sede Principal: Avenida Circunvalar #17-55, Florencia – Caquetá,
          Colombia
        </p>
        <p>
          Teléfono: +57 (608) 435 2900 —{" "}
          <a href="https://www.uniamazonia.edu.co" target="_blank">
            www.uniamazonia.edu.co
          </a>
        </p>
      </footer>
    </div>
  );
}
