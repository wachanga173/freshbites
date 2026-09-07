/**
 * Client-side navigation utility for SPA routing
 * Updates the browser URL and dispatches a popstate event
 * so the router responds without hard page reloads.
 */
export function navigateTo(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}
