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
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ndp-navy mb-4">
            La rete di riferimento italiana
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            NDP Reference aggrega professionisti verificati da tutta Italia in un unico network di fiducia.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, label, description }) => (
            <div
              key={label}
              className="text-center group"
            >
              <div className="w-14 h-14 bg-ndp-navy/5 group-hover:bg-ndp-navy rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300">
                <Icon size={24} className="text-ndp-navy group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="font-display text-3xl font-bold text-ndp-navy mb-1">{value}</div>
              <div className="font-semibold text-gray-800 text-sm">{label}</div>
              <div className="text-gray-400 text-xs mt-0.5">{description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
