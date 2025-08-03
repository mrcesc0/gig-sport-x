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
  [key: string]: unknown;
}

/**
 * LayoutDefault Component
 *
 * A React component that provides a semantic, accessible layout structure
 * using a 12-column flexbox system with CSS modules.
 */
export const LayoutDefault = ({
  Header,
  Content,
  Sidebar,
  Footer,
  ...props
}: LayoutDefaultProps) => {
  return (
    <div className={styles.layout} {...props}>
      <header
        className={styles.headerRow}
        role="banner"
        aria-label="Site header"
      >
        <div className={styles.headerContainer}>{Header}</div>
      </header>

      <div className={styles.mainRow} role="main">
        <main className={styles.contentContainer} aria-label="Main content">
          {Content}
        </main>
        <aside className={styles.sidebarContainer} aria-label="Side content">
          {Sidebar}
        </aside>
      </div>

      <footer
        className={styles.footerRow}
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className={styles.footerContainer}>{Footer}</div>
      </footer>
    </div>
  );
};
