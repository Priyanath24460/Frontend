import React from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-stone-900 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <h1 className="text-4xl sm:text-6xl font-black mb-6">
              Our Mission: <span className="text-amber-400">Democratizing Law</span>
            </h1>
            <p className="text-xl text-stone-400 max-w-3xl mx-auto leading-relaxed">
              We are bridging the gap between complex legal data and everyday understanding using state-of-the-art Artificial Intelligence.
            </p>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-amber-600 font-bold tracking-widest uppercase text-sm mb-4 block">Our Vision</span>
                <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-8 leading-tight">
                  Empowering every Sri Lankan with instant, accurate legal knowledge.
                </h2>
                <div className="space-y-6 text-stone-600 leading-relaxed">
                  <p>
                    LawKnow was born from a simple realization: legal research in Sri Lanka is often slow, expensive, and inaccessible to many. Our platform changes that by providing AI-powered tools that understand local law, precedents, and procedures.
                  </p>
                  <p>
                    Whether you're a seasoned legal professional looking to speed up your research or a citizen trying to understand your rights, LawKnow provides the clarity you need.
                  </p>
                </div>
                <div className="mt-10 flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 bg-stone-50 px-6 py-3 rounded-2xl border border-stone-100">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-bold text-stone-900">NLR Database Integration</span>
                  </div>
                  <div className="flex items-center gap-3 bg-stone-50 px-6 py-3 rounded-2xl border border-stone-100">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-bold text-stone-900">AI Analysis Engine</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-stone-100 to-amber-50 rounded-[40px] overflow-hidden shadow-2xl relative">
                  <div className="absolute inset-0 bg-stone-900 opacity-5 flex items-center justify-center">
                    <svg className="w-32 h-32 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-xl border border-stone-100 max-w-xs">
                  <p className="text-3xl font-black text-amber-600 mb-2">99.9%</p>
                  <p className="text-stone-500 font-medium">Uptime & Reliability for critical legal research needs.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-24 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4">Core Principles</h2>
              <div className="w-20 h-1.5 bg-amber-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Precision",
                  desc: "Every legal summary and search result is processed with extreme care to maintain factual integrity.",
                  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                },
                {
                  title: "Accessibility",
                  desc: "Making complex legal language understandable for everyone, not just experts.",
                  icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                },
                {
                  title: "Innovation",
                  desc: "Constantly evolving our AI models to stay ahead of the latest legal developments.",
                  icon: "M13 10V3L4 14h7v7l9-11h-7z"
                }
              ].map((value, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={value.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-4">{value.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-5xl font-black text-stone-900 mb-8">Ready to experience the future?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/Scenario_Based_Case_Finder" className="bg-stone-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg">
                Start Researching
              </Link>
              <Link to="/contact" className="bg-amber-400 text-stone-900 px-10 py-4 rounded-2xl font-bold hover:bg-amber-500 transition-all shadow-lg">
                Talk to Us
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
