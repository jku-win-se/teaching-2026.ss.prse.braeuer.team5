import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import { fetchPendingRoomInvites } from "../services/inviteService";
import styles from "./Sidebar.module.css";

export function Sidebar() {
  const [pendingInviteCount, setPendingInviteCount] = useState(0);

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
        <NavLink to="/rooms" className={() => (isRoomsActive ? styles.activeLink : styles.navLink)}>
          Raeume
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
          Einladungen
          {pendingInviteCount > 0 ? <span className={styles.inviteCount}>{pendingInviteCount}</span> : null}
        </NavLink>
        <NavLink to="/simulator" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
          Simulator
        </NavLink>
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutbtn}>
          Abmelden
        </button>
      </div>
    </aside>
  );
}
