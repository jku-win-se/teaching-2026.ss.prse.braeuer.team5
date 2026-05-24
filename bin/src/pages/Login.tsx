import { useState } from "react";
import { supabase } from "../config/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Supabase client is not initialized");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Login fehlgeschlagen: " + authError.message);
      setLoading(false);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>
      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Wird eingeloggt..." : "Einloggen"}
        </button>
      </form>
      
      {error && <p className="error-message">{error}</p>}

      <p>
        Noch kein Konto? <Link to="/register">Hier registrieren</Link>
      </p>
    </div>
  );
};

export default Login;