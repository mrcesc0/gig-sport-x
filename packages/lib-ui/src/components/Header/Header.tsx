import { NavLink } from 'react-router-dom';

import styles from './Header.module.css';

/**
 * Props interface for the Header component
 */
export interface HeaderProps {
  [key: string]: unknown;
}

/**
 * Header Component
 *
 * A React component that provides a semantic, accessible header structure
 * with a text logo and navigation menu using CSS modules.
 */
export const Header = ({ ...props }: HeaderProps) => {
  return (
    <div className={styles.header} {...props}>
      <div className={styles.headerContainer}>
        <div className={styles.logoContainer}>
          <NavLink
            end
            to="/"
            className={styles.logoLink}
            aria-label="Sport X - Go to homepage"
          >
            <h1 className={styles.logo}>Sport X</h1>
          </NavLink>
        </div>
        <nav
          className={styles.navigation}
          role="navigation"
          aria-label="Main navigation"
        >
          <ul className={styles.navList}>
            <li className={styles.navItem}>
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
    </div>
  );
};
