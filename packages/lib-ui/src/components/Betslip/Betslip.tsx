import styles from './Betslip.module.css';

export interface BetslipProps {
  [key: string]: unknown;
}

// eslint-disable-next-line no-empty-pattern
export const Betslip = ({}: BetslipProps) => {
  return <div className={styles.betslip}></div>;
};
