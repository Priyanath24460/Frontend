import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-stone-600 via-amber-900 to-orange-800 text-white py-24 relative overflow-hidden min-h-[600px]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="/law3.jpg" 
              alt="Legal Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/60 to-transparent"></div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 right-10 w-32 h-32 border border-amber-400 opacity-10 rotate-45"></div>
            <div className="absolute bottom-16 right-16 w-24 h-24 border border-orange-400 opacity-10 rotate-12"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 border border-amber-400 opacity-10 -rotate-45"></div>
          </div>
          
          {/* Content - Positioned on the Left */}
          <div className="relative max-w-7xl mx-auto px-8 h-full flex items-center min-h-[600px]">
            <div className="w-full lg:w-3/5 xl:w-1/2 space-y-10">
              {/* Brand Name */}
              <div className="text-left">
                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-none tracking-tight mb-6">
                  <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent">
                    Law
                  </span>
                  <span className="text-white">
                    Know
                  </span>
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mb-8"></div>
              </div>

              {/* Tagline & Description */}
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-2xl lg:text-3xl font-medium text-white leading-relaxed">
                  Empowering Legal Excellence with Artificial Intelligence
                </h2>
                <p className="text-base lg:text-lg text-white/90 leading-relaxed font-light">
                  Navigate the Sri Lankan legal system with unprecedented precision. Our cutting-edge AI platform delivers 
                  comprehensive legal research, intelligent case analysis, and advanced document processing—specifically designed 
                  for legal professionals, students, and informed citizens.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link 
                  to="/Scenario_Based_Case_Finder" 
                  className="group relative bg-gradient-to-r from-amber-400 to-orange-400 text-stone-900 px-10 py-4 rounded-lg font-semibold text-lg hover:from-amber-300 hover:to-orange-300 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-400/40 hover:scale-105 overflow-hidden"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Start Legal Research
                  </span>
                </Link>
                <Link 
                  to="/upload" 
                  className="group relative bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-stone-900 hover:border-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Documents
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-4">Our Core Features</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive AI-powered legal tools designed for the Sri Lankan legal system
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1: Case Finder */}
              <div className="group bg-gradient-to-br from-stone-50 to-amber-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-100">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-stone-800 mb-3">Scenario-Based Case Finder</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Describe your legal issue in plain language and find relevant past cases from the New Law Reports database. 
                      Our AI understands your situation and matches it with similar precedent cases, helping you understand how 
                      courts have handled similar issues.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2: Case Summarizer */}
              <div className="group bg-gradient-to-br from-stone-50 to-amber-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-100">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-stone-800 mb-3">AI Case Summarizer</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Upload legal judgments or court documents and get instant AI-generated summaries. Our system extracts key facts, 
                      legal issues, court reasoning, and decisions in clear language. Compare similar cases side-by-side to understand 
                      legal principles better.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3: Contract Manager */}
              <div className="group bg-gradient-to-br from-stone-50 to-amber-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-100">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-stone-800 mb-3">Contract Lifecycle Manager</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Automate contract review and creation with AI. Upload existing contracts or use templates for employment, 
                      leases, and more. Our system identifies key clauses, highlights risks, suggests improvements, and helps you 
                      create legally sound contracts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 4: Rights Violation Screener */}
              <div className="group bg-gradient-to-br from-stone-50 to-amber-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-100">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-stone-800 mb-3">Fundamental Rights Screener</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Understand if your experience may constitute a violation of Fundamental Rights under the Sri Lankan Constitution. 
                      Describe the incident in your own words, and our AI will match it to relevant constitutional provisions and guide 
                      you on possible next steps.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-24 bg-gradient-to-b from-stone-50 to-white">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-stone-700 to-amber-600 rounded-full mb-8 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-6">About LawKnow</h2>
              <div className="w-32 h-1 bg-gradient-to-r from-stone-700 to-amber-600 mx-auto mb-8"></div>
              <p className="text-lg lg:text-xl text-gray-700 max-w-4xl mx-auto leading-loose font-light">
                Our mission is to <span className="font-semibold text-stone-800">democratize access to Sri Lankan legal information</span> through cutting-edge AI technology. 
                We bridge the gap between complex legal documents and practical legal understanding, making the law 
                accessible to everyone—from seasoned legal professionals to informed citizens seeking justice.
              </p>
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-3">10,000+</div>
                  <div className="text-gray-700 font-semibold text-base">Legal Documents Processed</div>
                </div>
                <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-3">500+</div>
                  <div className="text-gray-700 font-semibold text-base">Legal Professionals Trust Us</div>
                </div>
                <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-3">99.9%</div>
                  <div className="text-gray-700 font-semibold text-base">Accuracy Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Target Audience Section */}
        <section className="py-24 bg-gradient-to-b from-white to-amber-50">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-full mb-8 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-4xl lg:text-5xl font-bold mb-6 text-stone-800">Trusted by Legal Community</h3>
              <div className="w-32 h-1 bg-gradient-to-r from-amber-600 to-yellow-500 mx-auto mb-8"></div>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">Empowering every stakeholder in the Sri Lankan legal ecosystem</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="group text-center p-10 rounded-3xl bg-white border-2 border-amber-100 hover:border-amber-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:from-amber-600 group-hover:to-amber-700 transition-all duration-300 shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-amber-900 mb-4">Legal Professionals</h4>
                <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-yellow-400 mx-auto mb-4"></div>
                <p className="text-gray-600 leading-relaxed text-lg">Lawyers, judges, and legal practitioners seeking efficient case research and precedent analysis for superior client service</p>
              </div>
              
              <div className="group text-center p-10 rounded-3xl bg-white border-2 border-orange-100 hover:border-orange-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:from-orange-600 group-hover:to-orange-700 transition-all duration-300 shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-amber-900 mb-4">Law Students</h4>
                <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-yellow-400 mx-auto mb-4"></div>
                <p className="text-gray-600 leading-relaxed text-lg">Students mastering Sri Lankan law, preparing for bar examinations, and conducting comprehensive academic research</p>
              </div>
              
              <div className="group text-center p-10 rounded-3xl bg-white border-2 border-yellow-100 hover:border-yellow-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:from-yellow-600 group-hover:to-yellow-700 transition-all duration-300 shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-amber-900 mb-4">Citizens & Businesses</h4>
                <div className="w-16 h-1 bg-gradient-to-r from-yellow-500 to-amber-400 mx-auto mb-4"></div>
                <p className="text-gray-600 leading-relaxed text-lg">Individuals and organizations seeking to understand their legal rights, obligations, and navigate complex regulations</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-32 bg-gradient-to-br from-stone-900 via-amber-900 to-orange-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-40 h-40 border border-amber-400 opacity-10 rotate-45"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 border border-orange-400 opacity-10 -rotate-12"></div>
            <div className="absolute top-1/2 right-1/3 w-20 h-20 border border-amber-400 opacity-10 rotate-45"></div>
          </div>
          <div className="relative max-w-5xl mx-auto px-8 text-center">
            <div className="mb-12">
              <h3 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 bg-gradient-to-r from-amber-300 to-orange-200 bg-clip-text text-transparent leading-tight">Ready to Transform Your Legal Practice?</h3>
              <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mb-10"></div>
              <p className="text-xl lg:text-2xl mb-6 text-white/95 font-light">
                Join thousands of legal professionals already using Sri Lankan Law AI
              </p>
              <p className="text-base lg:text-lg text-white/85 max-w-3xl mx-auto leading-loose">
                Experience the future of legal research with cutting-edge AI technology designed specifically for the Sri Lankan legal system
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-16">
              <Link to="/Scenario_Based_Case_Finder" className="group bg-gradient-to-r from-amber-400 to-orange-400 text-stone-900 px-12 py-6 rounded-2xl font-bold text-xl hover:from-amber-300 hover:to-orange-300 transition-all duration-300 shadow-2xl hover:shadow-amber-400/30 hover:-translate-y-2">
                <span className="flex items-center justify-center">
                  <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Your Legal Research Journey
                </span>
              </Link>
              <Link to="/upload" className="group bg-transparent border-3 border-amber-400 text-amber-400 px-12 py-6 rounded-2xl font-bold text-xl hover:bg-amber-400 hover:text-stone-900 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-400/30 hover:-translate-y-2">
                <span className="flex items-center justify-center">
                  <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Upload Your First Document
                </span>
              </Link>
            </div>
            <div className="mt-12 text-center">
              <p className="text-amber-200 text-sm font-medium tracking-wider uppercase">Trusted by Legal Professionals Across Sri Lanka</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;