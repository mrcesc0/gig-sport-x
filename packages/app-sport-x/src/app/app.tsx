import { LayoutDefault, Header, Betslip, Footer } from '@gig-sport-x/lib-ui';

import { AppRoutes } from './app.routes';

export function App() {
  return (
    <LayoutDefault
      Header={<Header />}
      Content={<AppRoutes />}
      Sidebar={<Betslip />}
      Footer={<Footer />}
    />
  );
}

export default App;
