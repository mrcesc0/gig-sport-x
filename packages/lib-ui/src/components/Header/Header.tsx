import { NavLink } from 'react-router-dom';

import styles from './Header.module.css';

export interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        <NavLink end to="/" className={styles.logoLink} aria-label={title}>
          <h1 className={styles.logoText}>{title}</h1>
        </NavLink>
      </div>
    </div>
  );
};
