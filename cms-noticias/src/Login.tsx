import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Redirigir si ya hay sesión activa
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin");
    });
  }, [navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setMessage("✅ Sesión iniciada correctamente.");
      navigate("/admin");
    } catch (err: any) {
      setMessage("❌ " + (err.message || "Error al iniciar sesión"));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setMessage("✅ Cuenta creada. Revisa tu correo para confirmar.");
    } catch (err: any) {
      setMessage("❌ " + (err.message || "Error al crear cuenta"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Portal de Noticias — Acceso</h2>

      <form onSubmit={signIn} className="login-form">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>

        <button
          type="button"
          onClick={signUp}
          className="signup-btn"
          disabled={loading}
        >
          Crear cuenta
        </button>
      </form>

      {message && <p className="login-message">{message}</p>}
    </div>
  );
}
