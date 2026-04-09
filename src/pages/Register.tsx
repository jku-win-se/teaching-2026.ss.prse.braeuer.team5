import { useState } from "react";
import { supabase } from "../config/supabaseClient";
import { Link } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Supabase client is not initialized");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setMessage("Registrierung erfolgreich! Bitte prüfe deine E-Mails zur Bestätigung.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Registrieren</h1>
      <p>Erstelle ein Konto für dein Smart Home</p>

      <form onSubmit={handleRegister} className="auth-form">
        <div className="input-group">
          <label>E-Mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="deine@email.de"
          />
        </div>
        <div className="input-group">
          <label>Passwort</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Mind. 6 Zeichen"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Wird erstellt..." : "Konto erstellen"}
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      {message && <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>}

      <div className="auth-footer" style={{ marginTop: "1.5rem" }}>
        <p>
          Bereits ein Konto? <Link to="/login">Hier einloggen</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;