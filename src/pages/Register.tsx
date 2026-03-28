import { useState } from "react";
import { supabase } from "../config/supabaseClient";

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Supabase Auth Sign-up
    if (!supabase) {
      setError('Supabase client is not initialized');
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } else {
      console.log('Registrierung erfolgreich:', data);
      alert('Check dein Postfach für den Bestätigungslink!');
    }
    setLoading(false);
  };

  return (
    <div className="auth-form">
      <h2>Registrierung</h2>
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

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default SignUp;