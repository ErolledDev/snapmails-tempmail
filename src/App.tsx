import React, { useState } from 'react';
import { Mail, Shield, Clock, Lock, Menu, X } from 'lucide-react';
import { Link, Route, Routes } from 'react-router-dom';
import EmailBox from './components/EmailBox';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import About from './pages/About';
import Features from './pages/Features';

function Home() {
  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520509414578-d9cbf09933a1')] opacity-[0.03] bg-repeat"></div>
        </div>
        <div className="relative">
          <div className="text-center max-w-4xl mx-auto px-4 pt-16 pb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Secure Disposable Email Service
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Keep your real inbox clean and protected. Get instant disposable email addresses for temporary use.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="w-5 h-5 text-blue-500 mr-2" />
                Privacy Protected
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                Instant Access
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Lock className="w-5 h-5 text-blue-500 mr-2" />
                No Registration
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ad Space */}
        <div className="mb-8 text-center">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-500">Advertisement</div>
          </div>
        </div>

        <EmailBox />

        {/* Ad Space */}
        <div className="my-8 text-center">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-500">Advertisement</div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose TempMail Pro?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Instant Access</h3>
              <p className="text-gray-600">No registration required. Get a disposable email address instantly and start receiving emails.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Privacy First</h3>
              <p className="text-gray-600">Protect your real email from spam, phishing, and unwanted subscriptions with our secure service.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">User Friendly</h3>
              <p className="text-gray-600">Clean, modern interface that's easy to use on any device, with no technical knowledge required.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <Mail className="w-8 h-8 text-blue-500" />
              <span className="ml-2 text-xl font-semibold">TempMail Pro</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                to="/" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/about" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
            </div>
          </div>
        )}
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <Mail className="w-6 h-6 text-blue-500" />
                <span className="ml-2 text-lg font-semibold">TempMail Pro</span>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Secure, disposable email addresses for your privacy needs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/features" className="text-gray-600 hover:text-gray-900">Features</Link></li>
                <li><Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="mailto:support@tempmailpro.com" className="text-gray-600 hover:text-gray-900">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            <p>© 2025 TempMail Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App