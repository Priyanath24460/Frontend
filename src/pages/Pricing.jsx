import React from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for students and casual researchers",
      features: [
        "Up to 5 searches per day",
        "Basic case summaries",
        "Standard search speed",
        "Community support"
      ],
      cta: "Get Started",
      link: "/register",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "Advanced tools for legal professionals",
      features: [
        "Unlimited searches",
        "Detailed AI case analysis",
        "Priority processing speed",
        "Export reports (PDF/TXT)",
        "Contract risk screening",
        "Email support"
      ],
      cta: "Go Pro",
      link: "/register",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for large law firms",
      features: [
        "Everything in Pro",
        "Bulk document processing",
        "Custom AI model training",
        "API access",
        "Dedicated account manager",
        "24/7 Priority support"
      ],
      cta: "Contact Sales",
      link: "/about",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-6xl font-black text-stone-900 mb-6">
              Simple, Transparent <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Pricing</span>
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mb-8 rounded-full"></div>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto font-medium">
              Choose the perfect plan for your legal research needs. From students to large firms, we have you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col ${
                  plan.popular ? 'border-4 border-amber-400 ring-4 ring-amber-400/10' : 'border border-stone-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-400 text-stone-900 text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-stone-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-stone-900">{plan.price}</span>
                    {plan.period && <span className="text-stone-500 font-medium">{plan.period}</span>}
                  </div>
                  <p className="text-stone-500 text-sm mt-4 font-medium leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="bg-amber-100 rounded-full p-1">
                        <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-stone-700 text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  to={plan.link}
                  className={`w-full py-4 rounded-2xl font-bold text-center transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-stone-900 shadow-lg hover:shadow-amber-400/30' 
                      : 'bg-stone-900 text-white hover:bg-stone-800 shadow-md'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ/Trust Section */}
          <div className="mt-24 text-center">
            <p className="text-stone-500 text-sm font-bold uppercase tracking-widest mb-8">Trusted by Legal Professionals</p>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="font-bold text-2xl text-stone-400">LAW FIRMS</div>
               <div className="font-bold text-2xl text-stone-400">UNIVERSITIES</div>
               <div className="font-bold text-2xl text-stone-400">LEGAL DEPTS</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
