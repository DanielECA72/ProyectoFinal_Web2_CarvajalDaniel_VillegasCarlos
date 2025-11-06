import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import NewsForm from "./NewsFrom";

export default function Admin() {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate('/login');
      } else {
        setChecking(false);
      }
    };
    check();
  }, []);

  if (checking) return <p>Cargando panel...</p>;

  return (
    <div className="admin-page">
      <h2>Panel de Administración</h2>
      <p>Aquí puedes crear nuevas noticias para el portal.</p>
      <NewsForm isAdmin={true} />
    </div>
  );
}
