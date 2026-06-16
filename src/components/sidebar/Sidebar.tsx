import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";
import { fetchPendingRoomInvites } from "../../services/inviteService";
import styles from "./Sidebar.module.css";

export function Sidebar() {
  const [pendingInviteCount, setPendingInviteCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("Logout fehlgeschlagen:", err);
    }
  };

  const location = useLocation();
  const isRoomsActive = location.pathname === "/rooms" || location.pathname.startsWith("/room/");

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const loadPendingInvites = async () => {
      try {
        const invites = await fetchPendingRoomInvites();
        setPendingInviteCount(invites.length);
      } catch {
        setPendingInviteCount(0);
      }
    };
    loadPendingInvites();
  }, [location.pathname]);

  const navContent = (
    <>
      <NavLink to="/" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
        Dashboard
      </NavLink>
      <NavLink to="/rooms" className={() => (isRoomsActive ? styles.activeLink : styles.navLink)}>
        Räume
      </NavLink>
      <NavLink to="/notifications" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
        Einladungen
        {pendingInviteCount > 0 ? <span className={styles.inviteCount}>{pendingInviteCount}</span> : null}
      </NavLink>
      <NavLink to="/schedules" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
        Zeitpläne
      </NavLink>
      <NavLink to="/scenes" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
        Szenen
      </NavLink>
      <NavLink to="/rules" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
        Regeln
      </NavLink>
      <NavLink to="/simulator" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
        Simulator
      </NavLink>
      <NavLink to="/logs" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
        Aktivitäten
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
        Einstellungen
      </NavLink>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}>PRSE Team 5</p>
          <h1 className={styles.title}>Smart Home</h1>
        </div>
        <nav className={styles.nav}>
          {navContent}
        </nav>
        <div className={styles.footer}>
          <button onClick={handleLogout} className={styles.logoutbtn}>
            Abmelden
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className={styles.mobileHeader}>
        <h1 className={styles.mobileTitle}>Smart Home</h1>
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menü öffnen"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className={styles.mobileBackdrop} onClick={() => setMenuOpen(false)}>
          <nav className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            {navContent}
            <button onClick={handleLogout} className={`${styles.navLink} ${styles.logoutbtn}`}>
              Abmelden
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
