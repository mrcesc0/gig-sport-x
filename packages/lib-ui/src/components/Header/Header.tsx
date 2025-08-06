import { NavLink } from 'react-router-dom';

import styles from './Header.module.css';

export interface HeaderProps {
  [key: string]: unknown;
}

// eslint-disable-next-line no-empty-pattern
export const Header = ({}: HeaderProps) => {
  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        <NavLink
          end
          to="/"
          className={styles.logoLink}
          aria-label="Sport X - Go to homepage"
        >
          <h1 className={styles.logoText}>Sport X</h1>
        </NavLink>
      </div>
      <nav
        className={styles.navigation}
        role="navigation"
        aria-label="Main navigation"
      >
        <ul className={styles.navList}>
          <li>
            <NavLink
              end
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              Home
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink
              to="/page-2"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              Page 2
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};
