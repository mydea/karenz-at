import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Karenz-Planer für Österreich
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Berechnen Sie Ihr Kinderbetreuungsgeld, planen Sie Ihre Elternkarenz und finden Sie alle
          wichtigen Termine und Fristen.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/einstellungen" className="btn-primary">
            Jetzt starten
          </Link>
          <Link to="/faq" className="btn-secondary">
            Mehr erfahren
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Einstellungen"
          description="Geben Sie Ihre persönlichen Daten ein: Geburtstermin, Einkommen und mehr."
          linkTo="/einstellungen"
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
          }
        />
        <FeatureCard
          title="Zeitplan"
          description="Sehen Sie alle wichtigen Termine: Mutterschutz, Karenz, Antragsfristen."
          linkTo="/zeitplan"
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          }
        />
        <FeatureCard
          title="Rechner"
          description="Berechnen Sie Ihr Kinderbetreuungsgeld für alle Modelle."
          linkTo="/rechner"
          icon={
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          }
        />
      </section>

      {/* Info Section */}
      <section className="card">
        <h2 className="text-xl font-semibold text-gray-900">Wichtige Hinweise</h2>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
            <span>Diese App richtet sich an Angestellte in Österreich.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
            <span>Selbstständige haben andere Regelungen und werden nicht unterstützt.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
            <span>
              Alle Berechnungen sind unverbindlich. Bitte prüfen Sie Ihre Ansprüche bei den
              zuständigen Stellen.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  linkTo: string;
  icon: React.ReactNode;
}

function FeatureCard({ title, description, linkTo, icon }: FeatureCardProps) {
  return (
    <Link to={linkTo} className="card group transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </Link>
  );
}
