import { Outlet, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Start' },
  { to: '/einstellungen', label: 'Einstellungen' },
  { to: '/zeitplan', label: 'Zeitplan' },
  { to: '/rechner', label: 'Rechner' },
  { to: '/faq', label: 'Information' },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <NavLink to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600">
                <span className="text-sm font-bold text-white">K</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Karenz.info</span>
            </NavLink>

            <nav className="hidden md:block">
              <ul className="flex items-center gap-1">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile menu button */}
            <MobileMenu />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                Diese Informationen dienen nur zur Orientierung und stellen keine Rechts- oder
                Finanzberatung dar.
              </p>
              <p className="text-sm text-gray-500">
                Für Anregungen und Korrekturen schreiben Sie bitte an{' '}
                <a
                  href="mailto:info@karenz.info"
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  info@karenz.info
                </a>
              </p>
            </div>
            <p className="text-sm text-gray-400 whitespace-nowrap">Stand: Februar 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileMenu() {
  return (
    <div className="md:hidden">
      <details className="group relative">
        <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg hover:bg-gray-100">
          <svg
            className="h-6 w-6 text-gray-600 group-open:hidden"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <svg
            className="hidden h-6 w-6 text-gray-600 group-open:block"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </summary>
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </details>
    </div>
  );
}
