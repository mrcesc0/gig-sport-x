import { useObservable } from '@gig-sport-x/lib-utils';
import { SportService } from '@gig-sport-x/svc-sport';
import { Route, Routes } from 'react-router-dom';

export const AppRoutes = () => {
  const events = useObservable(SportService.Instance.getEvents$());

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <nav role="navigation" aria-label="Main navigation">
              {events?.map((event) => (
                <ul key={event.id}>
                  <li>{event.sport.label}</li>
                  <li>{event.category.label}</li>
                  <li>{event.competition.label}</li>
                </ul>
              ))}
            </nav>
          </div>
        }
      />
    </Routes>
  );
};
