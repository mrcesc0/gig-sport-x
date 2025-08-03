// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import { LayoutDefault, Header } from '@gig-sport-x/lib-ui';
import { AppRoutes } from './app.routes';

export function App() {
  return <LayoutDefault Header={<Header />} Content={<AppRoutes />} />;
}

export default App;
