import styles from './Betslip.module.css';

/**
 * Props interface for the Betslip component
 */
export interface BetslipProps {
  [key: string]: unknown;
}

/**
 * Betslip Component
 *
 * A React component that provides a semantic, accessible Betslip structure
 */
export const Betslip = ({ ...props }: BetslipProps) => {
  return <div className={styles.betslip} {...props}></div>;
};
