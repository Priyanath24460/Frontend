import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-stone-900 via-amber-900 to-orange-800 text-white py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-25"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 border border-amber-400 opacity-10 rotate-45"></div>
            <div className="absolute bottom-16 right-16 w-24 h-24 border border-orange-400 opacity-10 rotate-12"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-amber-400 opacity-10 -rotate-45"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-8 text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mr-6 shadow-2xl">
                <svg className="w-12 h-12 text-stone-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-7xl font-bold mb-2 bg-gradient-to-r from-amber-300 to-orange-200 bg-clip-text text-transparent">Sri Lankan Law AI</h1>
                <div className="flex items-center text-amber-200">
                  <div className="w-8 h-0.5 bg-amber-400 mr-3"></div>
                  <span className="text-lg font-medium tracking-wider">LEGAL RESEARCH PLATFORM</span>
                </div>
              </div>
            </div>
            <p className="text-2xl mb-6 opacity-95 font-light">Empowering Legal Excellence with Artificial Intelligence</p>
            <p className="text-lg mb-10 opacity-85 max-w-4xl mx-auto leading-relaxed">
              Navigate the Sri Lankan legal system with unprecedented precision. Our cutting-edge AI platform delivers 
              comprehensive legal research, intelligent case analysis, and advanced document processing—specifically designed 
              for legal professionals, students, and informed citizens.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
              <Link to="/search" className="group bg-gradient-to-r from-amber-400 to-orange-400 text-stone-900 px-10 py-5 rounded-xl font-bold text-lg hover:from-amber-300 hover:to-orange-300 transition-all duration-300 shadow-2xl hover:shadow-amber-400/25 hover:-translate-y-1">
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Start Legal Research
                </span>
              </Link>
              <Link to="/upload" className="group bg-transparent border-2 border-amber-400 text-amber-400 px-10 py-5 rounded-xl font-bold text-lg hover:bg-amber-400 hover:text-stone-900 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-400/25 hover:-translate-y-1">
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Documents
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-gradient-to-b from-white to-stone-50">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <div className="w-1 h-16 bg-gradient-to-b from-stone-700 to-amber-600 mr-4"></div>
                <h2 className="text-5xl font-bold text-stone-800 mb-2">About Sri Lankan Law AI</h2>
                <div className="w-1 h-16 bg-gradient-to-b from-stone-700 to-amber-600 ml-4"></div>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-stone-700 to-amber-600 mx-auto mb-8"></div>
              <p className="text-xl text-gray-700 max-w-5xl mx-auto leading-relaxed font-light">
                Our mission is to <span className="font-semibold text-stone-800">democratize access to Sri Lankan legal information</span> through cutting-edge AI technology. 
                We bridge the gap between complex legal documents and practical legal understanding, making the law 
                accessible to everyone—from seasoned legal professionals to informed citizens seeking justice.
              </p>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="text-4xl font-bold text-amber-700 mb-2">10,000+</div>
                  <div className="text-gray-600 font-medium">Legal Documents Processed</div>
                </div>
                <div className="text-center p-6">
                  <div className="text-4xl font-bold text-amber-700 mb-2">500+</div>
                  <div className="text-gray-600 font-medium">Legal Professionals Trust Us</div>
                </div>
                <div className="text-center p-6">
                  <div className="text-4xl font-bold text-amber-700 mb-2">99.9%</div>
                  <div className="text-gray-600 font-medium">Accuracy Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white relative">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-50/30 to-amber-50/30"></div>
          <div className="relative max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-stone-700 to-amber-600 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-5xl font-bold mb-6 text-stone-800">Comprehensive Legal Solutions</h3>
              <div className="w-32 h-1 bg-gradient-to-r from-stone-700 to-amber-600 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">Powered by advanced AI technology, specifically designed for the Sri Lankan legal system</p>
            </div>
            
            {/* Main Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
              <Link to="/search" className="group block bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-l-8 border-amber-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-transparent opacity-50 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <div className="flex items-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mr-6 group-hover:from-amber-200 group-hover:to-amber-300 transition-all duration-300 shadow-lg">
                      <svg className="w-10 h-10 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-3xl font-bold text-amber-900 mb-2">AI Legal Research</h4>
                      <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-yellow-500"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    Advanced semantic search through Sri Lankan case law, statutes, and legal precedents. 
                    Ask complex legal questions and receive comprehensive answers with relevant citations.
                  </p>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <ul className="text-sm text-amber-800 space-y-2 font-medium">
                      <li className="flex items-center"><span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>Search Supreme Court and Court of Appeal cases</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>Access statutory interpretations</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>Find legal precedents and ratios</li>
                    </ul>
                  </div>
                </div>
              </Link>
              
              <Link to="/upload" className="group block bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-l-8 border-orange-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent opacity-50 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <div className="flex items-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mr-6 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300 shadow-lg">
                      <svg className="w-10 h-10 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-3xl font-bold text-amber-900 mb-2">Document Analysis</h4>
                      <div className="w-16 h-1 bg-gradient-to-r from-orange-600 to-yellow-500"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    Upload legal documents for AI-powered analysis. Extract key information, identify legal issues, 
                    and receive automated summaries of complex legal texts.
                  </p>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <ul className="text-sm text-orange-800 space-y-2 font-medium">
                      <li className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>Process court judgments and orders</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>Analyze contracts and agreements</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>Extract legal principles and holdings</li>
                    </ul>
                  </div>
                </div>
              </Link>
            </div>

            {/* Additional Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Legal Library</h3>
                <p className="text-gray-600 text-sm">Comprehensive database of Sri Lankan laws and regulations</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Smart Analytics</h3>
                <p className="text-gray-600 text-sm">AI-powered insights and legal trend analysis</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Legal Assistant</h3>
                <p className="text-gray-600 text-sm">24/7 AI-powered legal guidance and support</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Community</h3>
                <p className="text-gray-600 text-sm">Connect with legal professionals and students</p>
              </div>
            </div>
          </div>
        </section>

        {/* Target Audience Section */}
        <section className="py-20 bg-gradient-to-b from-white to-amber-50">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-5xl font-bold mb-6 text-amber-900">Trusted by Legal Community</h3>
              <div className="w-32 h-1 bg-gradient-to-r from-amber-600 to-yellow-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">Empowering every stakeholder in the Sri Lankan legal ecosystem</p>
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
        <section className="py-24 bg-gradient-to-br from-stone-900 via-amber-900 to-orange-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-25"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-40 h-40 border border-amber-400 opacity-10 rotate-45"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 border border-orange-400 opacity-10 -rotate-12"></div>
            <div className="absolute top-1/2 right-1/3 w-20 h-20 border border-amber-400 opacity-10 rotate-45"></div>
          </div>
          <div className="relative max-w-5xl mx-auto px-8 text-center">
            <div className="mb-8">
              <h3 className="text-6xl font-bold mb-6 bg-gradient-to-r from-amber-300 to-orange-200 bg-clip-text text-transparent">Ready to Transform Your Legal Practice?</h3>
              <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mb-8"></div>
              <p className="text-2xl mb-4 opacity-95 font-light">
                Join thousands of legal professionals already using Sri Lankan Law AI
              </p>
              <p className="text-xl opacity-85 max-w-3xl mx-auto leading-relaxed">
                Experience the future of legal research with cutting-edge AI technology designed specifically for the Sri Lankan legal system
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
              <Link to="/search" className="group bg-gradient-to-r from-amber-400 to-orange-400 text-stone-900 px-12 py-6 rounded-2xl font-bold text-xl hover:from-amber-300 hover:to-orange-300 transition-all duration-300 shadow-2xl hover:shadow-amber-400/30 hover:-translate-y-2">
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