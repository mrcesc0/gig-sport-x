import styles from './Footer.module.css';

export interface FooterProps {
  [key: string]: unknown;
}

// eslint-disable-next-line no-empty-pattern
export const Footer = ({}: FooterProps) => {
  return <div className={styles.footer}></div>;
};
