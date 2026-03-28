import { useState } from "react";
import { supabase } from "../config/supabaseClient";

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Supabase client is not initialized");
      setLoading(false);
      return;
    }

    // Supabase Auth Sign-up
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      // Akzeptanzkriterium: Fehler klar anzeigen
      setError(authError.message);
      setLoading(false);
    } else if (data.user && data.session === null) {
      // Fall: Registrierung erfolgreich, aber Bestätigung ausstehend
      setSuccess(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-form">
        <h1>Register</h1>
        <p>Erfolg! Bitte überprüfe dein Postfach für den Bestätigungslink.</p>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h1>Register</h1>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Ihre E-Mail eingeben"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Ihr Passwort eingeben"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Lädt...' : 'Registrieren'}
        </button>
      </form>

      {error && (
        <p role="alert" style={{ color: 'red', marginTop: '10px' }}>
          {error}
        </p>
      )}    </div>
  );
};

export default SignUp;