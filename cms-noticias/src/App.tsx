import { BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./Home";
import Admin from "./Admin";
import NewsDetails from "./NewsDetails";
import Login from "./Login";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // obtener usuario actual
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Router>
      <nav className="top-nav">
        <div className="nav-left">
          <img
            src="/src/img/logouni.png"
            alt="Logo Universidad"
          />
          <h2>Portal de Noticias</h2>
        </div>
        <div className="nav-links">
          <Link to="/">Inicio</Link>
          {user ? <Link to="/admin">Publicar Noticia</Link> : <Link to="/login">Publicar Noticia</Link>}
          {user ? (
            <a onClick={signOut} style={{ cursor: 'pointer' }}>Cerrar sesión</a>
          ) : (
            <Link to="/login">Iniciar sesión</Link>
          )}
        </div>
      </nav>
      
      <div className="container">
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/news/:id" element={<NewsDetails />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>

      {/* botón de tema flotante */}
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
        {document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'}
      </button>

      <footer>
        © {new Date().getFullYear()} Universidad de la Amazonia
      </footer>
    </Router>
  );
}
