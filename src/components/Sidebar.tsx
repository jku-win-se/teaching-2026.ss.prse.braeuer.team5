import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

export function Sidebar() {

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
    </aside>
  );
}