import styles from './Footer.module.css';

/**
 * Props interface for the Footer component
 */
export interface FooterProps {
  [key: string]: unknown;
}

/**
 * Footer Component
 *
 * A React component that provides a semantic, accessible Footer structure
 */
export const Footer = ({ ...props }: FooterProps) => {
  return <div className={styles.footer} {...props}></div>;
};
