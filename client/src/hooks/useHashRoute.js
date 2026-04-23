import { useEffect, useState } from 'react';

function parse() {
  const h = (window.location.hash || '').replace(/^#\/?/, '');
  return h || 'student';
}

export function useHashRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const h = () => setRoute(parse());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return route;
}
