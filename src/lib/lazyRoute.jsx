import { lazy } from "react";

/**
 * React.lazy that can be preloaded. Once its module has arrived the component renders it directly
 * instead of suspending, so a preloaded route never flashes a fallback (React holds a revealed
 * Suspense boundary back for a few hundred milliseconds, which would otherwise delay first paint).
 */
export default function lazyRoute(load) {
  let Loaded = null;
  let pending = null;
  const preload = () =>
    (pending ??= load().then(
      (module) => {
        Loaded = module.default;
        return module;
      },
      (error) => {
        pending = null;
        throw error;
      },
    ));
  const Lazy = lazy(preload);

  function Route(props) {
    return Loaded ? <Loaded {...props} /> : <Lazy {...props} />;
  }
  Route.preload = preload;
  return Route;
}
