import React, { useState } from 'react';
import Header from '../components/Header';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    alert('Thank you for your message! Our team will get back to you shortly.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-6xl font-black text-stone-900 mb-6">
              Get in <span className="text-amber-600">Touch</span>
            </h1>
            <div className="w-24 h-1.5 bg-amber-500 mx-auto mb-8 rounded-full"></div>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Have questions about our AI platform or need technical assistance? Our team is here to help you navigate LawKnow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-white p-8 sm:p-12 rounded-[40px] shadow-2xl border border-stone-100">
              <h2 className="text-2xl font-bold text-stone-900 mb-8">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 focus:border-amber-400 focus:outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 focus:border-amber-400 focus:outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 focus:border-amber-400 focus:outline-none transition-all"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wider">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl px-6 py-4 focus:border-amber-400 focus:outline-none transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-stone-900 text-white font-black py-5 rounded-2xl hover:bg-stone-800 transition-all shadow-xl hover:shadow-amber-900/20"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Info & Map */}
            <div className="space-y-12">
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-stone-900">Contact Information</h2>
                
                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 mb-1">Our Headquarters</h3>
                    <p className="text-stone-600">Legal Tech Park, Level 5,<br />Colombo 07, Sri Lanka</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 mb-1">Email Us</h3>
                    <p className="text-stone-600">support@lawknow.lk<br />partnerships@lawknow.lk</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-stone-200 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 mb-1">Working Hours</h3>
                    <p className="text-stone-600">Mon - Fri: 9:00 AM - 6:00 PM<br />Sat: 10:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="h-64 bg-stone-200 rounded-[40px] relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="text-stone-400 font-bold uppercase tracking-widest text-sm">Interactive Map Placeholder</div>
                </div>
                <div className="absolute inset-0 bg-amber-900 opacity-5 group-hover:opacity-10 transition-opacity"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
