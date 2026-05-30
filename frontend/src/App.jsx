import React from 'react'
import PixVerseVideo from './components/PixVerseVideo'
import { Layout, ShoppingBag, Zap, Shield, Heart } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-primary fill-current" />
              <span className="text-xl font-black tracking-tight">TRAE SHOP</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#" className="hover:text-primary transition-colors">New Arrivals</a>
              <a href="#" className="hover:text-primary transition-colors">Collections</a>
              <a href="#" className="hover:text-primary transition-colors">About Us</a>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ShoppingBag className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Future of Shopping is <span className="text-primary">Interactive</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Experience our new collection through PixVerse AI-generated storytelling. 
            Click on items in the video to shop instantly.
          </p>
          
          {/* PixVerse Interactive Video */}
          <PixVerseVideo videoSrc="https://res.cloudinary.com/demo/video/upload/v1631020211/sample_video.mp4" />
        </div>
      </header>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">Instant Checkout</h3>
              <p className="text-gray-600">Buy directly from the video hotspots without leaving the experience.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Personalized Style</h3>
              <p className="text-gray-600">AI-generated content tailored to your preferences and shopping history.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Secure Storage</h3>
              <p className="text-gray-600">Your purchases and media are backed up securely via Google Drive integration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          &copy; 2026 TRAE Hackathon - PixVerse Video Generation Track. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default App
