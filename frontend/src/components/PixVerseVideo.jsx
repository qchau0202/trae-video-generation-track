import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Info, ExternalLink } from 'lucide-react';

const hotspots = [
  {
    id: 1,
    time: 5, // Show at 5 seconds
    duration: 10, // Show for 10 seconds
    x: '20%',
    y: '30%',
    title: 'New Collection',
    description: 'Check out our latest eco-friendly sneakers.',
    productLink: '/products/sneakers',
  },
  {
    id: 2,
    time: 15,
    duration: 8,
    x: '70%',
    y: '50%',
    title: 'Limited Edition Watch',
    description: 'Only 100 pieces available worldwide.',
    productLink: '/products/watch',
  },
];

const PixVerseVideo = ({ videoSrc }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [activeHotspots, setActiveHotspots] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      const active = hotspots.filter(
        (h) => time >= h.time && time <= h.time + h.duration
      );
      setActiveHotspots(active);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const handleHotspotClick = (hotspot) => {
    console.log(`User engaged with hotspot: ${hotspot.title}`);
    // Analytics tracking could go here
    window.open(hotspot.productLink, '_blank');
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black">
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-auto"
        controls
        muted
        autoPlay
        loop
      />
      
      {/* Interactive Overlays */}
      <AnimatePresence>
        {activeHotspots.map((hotspot) => (
          <motion.div
            key={hotspot.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ left: hotspot.x, top: hotspot.y }}
            className="absolute z-10"
          >
            <div className="relative group">
              <button
                onClick={() => handleHotspotClick(hotspot)}
                className="bg-white/90 hover:bg-white text-primary p-3 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
              >
                <ShoppingCart className="w-6 h-6" />
              </button>
              
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-48 bg-white rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <h4 className="font-bold text-gray-900 text-sm">{hotspot.title}</h4>
                <p className="text-gray-600 text-xs mt-1">{hotspot.description}</p>
                <div className="mt-2 flex items-center text-primary text-xs font-semibold">
                  View Product <ExternalLink className="w-3 h-3 ml-1" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Engagement Analytics Overlay (Simulation) */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-mono">
        Engagement Tracked: {currentTime.toFixed(1)}s
      </div>
    </div>
  );
};

export default PixVerseVideo;
