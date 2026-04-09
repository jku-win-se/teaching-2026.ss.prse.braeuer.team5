import { NavLink } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import styles from "./Sidebar.module.css";

export function Sidebar() {

  const handleLogout = async () => {
  if (!supabase) return;

  try {
    await supabase.auth.signOut();
    
    localStorage.clear();
    sessionStorage.clear();

    const baseUrl = import.meta.env.BASE_URL;
    window.location.href = window.location.origin + baseUrl + "login";
  } catch (err) {
    console.error(err);
  }
};

  return (
    <aside className={styles.sidebar}>
      <div>
        <p className={styles.eyebrow}>PRSE Team 5</p>
        <h1 className={styles.title}>Smart Home</h1>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
          Dashboard
        </NavLink>
        <NavLink to="/rooms" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
          Räume
        </NavLink>
        <NavLink to="/simulator" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
          Simulator
        </NavLink>
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Abmelden
        </button>
      </div>
    </aside>
  );
}
