import { Building2, Users, TrendingUp, Globe } from 'lucide-react';

const stats = [
  { icon: Building2, value: '500+', label: 'Capitoli Attivi', description: 'in tutta Italia' },
  { icon: Users, value: '12.000+', label: 'Professionisti', description: 'nella rete NDP' },
  { icon: TrendingUp, value: '€580M', label: 'Business Generato', description: 'ogni anno' },
  { icon: Globe, value: '65', label: 'Province', description: 'coperte in Italia' },
];

export default function StatsSection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ndp-text mb-4">
            La rete di riferimento italiana
          </h2>
          <p className="text-ndp-muted max-w-xl mx-auto">
            NDP Reference aggrega professionisti verificati da tutta Italia in un unico network di fiducia.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, label, description }) => (
            <div key={label} className="text-center">
              <div className="text-4xl font-display font-bold text-ndp-blue mb-1">{value}</div>
              <div className="font-semibold text-ndp-text text-sm">{label}</div>
              <div className="text-ndp-muted text-xs mt-0.5">{description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
