// TrustChainHero.tsx
import React, { useEffect, useRef, useState } from 'react';
import { FaGithub, FaShieldAlt, FaCode } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useLogin } from '@/context/UserContext';

const LoggedOutView: React.FC = () => {
    const { login } = useLogin();
  const [isVisible, setIsVisible] = useState(false);
  const particlesRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsVisible(true);
    
    // Animation for the particles background
    const createParticle = () => {
      if (!particlesRef.current) return;
      
      const particle = document.createElement('div');
      particle.classList.add('absolute', 'bg-blue-500', 'rounded-full', 'opacity-30');
      
      // Random position, size and animation duration
      const size = Math.random() * 6 + 2;
      const posX = Math.random() * window.innerWidth;
      const posY = Math.random() * window.innerHeight;
      const duration = Math.random() * 10 + 5;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}px`;
      particle.style.top = `${posY}px`;
      particle.style.animation = `float ${duration}s linear infinite`;
      
      particlesRef.current.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particlesRef.current && particlesRef.current.contains(particle)) {
          particlesRef.current.removeChild(particle);
        }
      }, duration * 1000);
    };
    
    // Create particles continuously
    const interval = setInterval(() => {
      createParticle();
    }, 300);
    
    return () => clearInterval(interval);
  }, []);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.3,
        duration: 0.8
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };
  
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated background */}
      <div 
        ref={particlesRef} 
        className="absolute inset-0 opacity-70"
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black to-blue-900 opacity-80" />
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 flex flex-col min-h-screen justify-center items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="text-center max-w-4xl"
        >
          {/* Logo/Brand */}
          <motion.div 
            variants={itemVariants}
            className="mb-8 inline-block"
          >
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-400 p-4 rounded-full">
                  <FaShieldAlt className="text-white w-12 h-12" />
                </div>
              </div>
              <h1 className="text-5xl ml-4 font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                TrustChain
              </h1>
            </div>
          </motion.div>
          
          {/* Tagline */}
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Verifiable Skill Identity on the <span className="text-blue-400">Blockchain</span>
          </motion.h2>
          
          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-300 mb-10"
          >
            Transform your GitHub projects into verified skill credentials. 
            Create trust in a world of unverifiable claims.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          >
            <button onClick={() => login()} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center group ">
              <span>Sign In</span>
              <div className="ml-2 group-hover:translate-x-1 transition-transform">→</div>
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-900/30 rounded-lg font-semibold transition duration-300 flex items-center justify-center">
              <span>For Recruiters</span>
            </button>
          </motion.div>
          
          {/* Feature Highlights */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
          >
            {[
              { 
                icon: <FaGithub className="text-blue-400 w-6 h-6" />, 
                title: "Connect GitHub", 
                desc: "Link your repositories to showcase real contributions." 
              },
              { 
                icon: <FaCode className="text-blue-400 w-6 h-6" />, 
                title: "AI Analysis", 
                desc: "Advanced AI evaluates your code quality and skills." 
              },
              { 
                icon: <FaShieldAlt className="text-blue-400 w-6 h-6" />, 
                title: "Blockchain Verified", 
                desc: "Tamper-proof credentials on the Sui blockchain." 
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-black/40 backdrop-blur-lg border border-blue-900/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="ml-3 text-xl font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
          
          {/* Trust indicators */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 pt-8 border-t border-blue-900/30"
          >
            <p className="text-gray-500 mb-4">Trusted by developers and companies</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-70">
              {/* Company logos would go here - just placeholders for now */}
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 w-24 bg-gradient-to-r from-gray-800 to-gray-700 rounded-md" />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Animated blockchain visualization in the background */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30 overflow-hidden">
        <div className="animate-blockchain-flow flex">
          {Array(20).fill(0).map((_, i) => (
            <div 
              key={i}
              className="w-20 h-12 mx-2 bg-blue-900 rounded relative flex-shrink-0"
            >
              <div className="absolute top-2 left-2 right-2 bottom-2 border border-blue-500/30 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Global styles */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0) rotate(0); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100vh) translateX(100px) rotate(360deg); opacity: 0; }
        }
        
        @keyframes blockchain-flow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-blockchain-flow {
          animation: blockchain-flow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoggedOutView;