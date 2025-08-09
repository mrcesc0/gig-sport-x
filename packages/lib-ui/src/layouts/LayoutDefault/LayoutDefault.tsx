import { ReactNode } from 'react';

import styles from './LayoutDefault.module.css';

/**
 * Props interface for the LayoutDefault component
 */
export interface LayoutDefaultProps {
  Header?: ReactNode;
  Content?: ReactNode;
  Sidebar?: ReactNode;
  Footer?: ReactNode;
}

/**
 * A flexible and accessible page layout component with structured regions.
 *
 * `LayoutDefault` provides a common layout structure consisting of:
 * - **Header**
 * - **Main Content**
 * - **Sidebar**
 * - **Footer**
 *
 * Each section accepts a React node, making it reusable across different parts of an application.
 * It includes proper ARIA roles to enhance accessibility for screen readers.
 */
export const LayoutDefault = ({
  Header,
  Content,
  Sidebar,
  Footer,
}: LayoutDefaultProps) => {
  return (
    <div className={styles.container}>
      <header className={styles.header} role="banner" aria-label="Site header">
        <div className={styles.headerContainer}>{Header}</div>
      </header>

      <div className={styles.content} role="main">
        <main className={styles.main} aria-label="Main content">
          {Content}
        </main>
        <aside className={styles.sidebar} aria-label="Side content">
          {Sidebar}
        </aside>
      </div>

      <footer
        className={styles.footer}
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className={styles.footerContainer}>{Footer}</div>
      </footer>
    </div>
  );
};
