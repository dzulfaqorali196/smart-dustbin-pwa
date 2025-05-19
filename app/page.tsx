"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuthStore()

  useEffect(() => {
    setMounted(true)
    
    // Cek untuk parameter auth_success
    const authSuccess = searchParams.get('auth_success')
    const provider = searchParams.get('provider')
    
    if (authSuccess === 'true') {
      // Tampilkan toast success login
      const providerName = provider === 'google' ? 'Google' 
                         : provider === 'github' ? 'GitHub' 
                         : 'OAuth'
      
      toast.success(`Login berhasil dengan ${providerName}! Selamat datang.`)
      
      // Hapus parameter dari URL tanpa reload halaman
      const url = new URL(window.location.href)
      url.searchParams.delete('auth_success')
      url.searchParams.delete('provider')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  if (!mounted) return null

  return (
    <main className="flex min-h-screen flex-col bg-[url('/img/grid-pattern.svg')] bg-green-500 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left side - Green section with logo */}
        <div className="relative bg-green-500 flex flex-col items-center justify-center p-8 text-center">
          {/* Grid pattern background */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ position: 'relative', height: '12rem', width: '12rem', marginBottom: '1.5rem' }}
          >
            <Image
              src="/img/smart-dustbin-illustration.svg"
              alt="Smart Dustbin Logo"
              fill
              priority
              className="drop-shadow-xl"
            />
          </motion.div>
          
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={{ marginBottom: '2rem' }}
          >
            <h1 className="text-3xl font-bold mb-2">
              Smart Dustbin <Badge className="ml-1 bg-white/20 text-white">PWA</Badge>
            </h1>
            <p className="text-lg text-white/90 mb-6 max-w-md mx-auto">
              Real-time monitoring system for intelligent waste management
            </p>
            
            <Button 
              asChild 
              size="lg" 
              className="mt-4 bg-white text-green-700 hover:bg-green-50 font-medium px-6"
            >
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </motion.div>
          
          {/* Stats section */}
          <div className="w-full max-w-md mt-auto">
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-green-600/30 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-4xl font-bold">98%</div>
                <div className="text-sm text-white/80 mt-1">Collection Efficiency</div>
              </div>
              <div className="bg-green-600/30 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-4xl font-bold">30%</div>
                <div className="text-sm text-white/80 mt-1">Cost Reduction</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Dark section with features */}
        <div className="bg-gray-900 flex flex-col">
          <div className="p-8 lg:p-10 flex-grow">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1.5 w-16 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-sm font-medium uppercase tracking-wider">NEXT GENERATION</span>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Welcome to Smart Dustbin</h2>
            <p className="text-base text-gray-300 mb-8 max-w-lg">
              The intelligent waste management solution that helps you monitor, optimize, and manage waste collection with unprecedented efficiency.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Feature 1 */}
              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  borderColor: 'rgba(34, 197, 94, 0.3)'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                style={{
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(55, 65, 81, 0.5)',
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path
                      fillRule="evenodd"
                      d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-time Tracking</h3>
                <p className="text-sm text-gray-400">
                  Monitor waste bin locations and fill levels in real-time with precision GPS tracking
                </p>
              </motion.div>
              
              {/* Feature 2 */}
              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  borderColor: 'rgba(34, 197, 94, 0.3)'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                style={{
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(55, 65, 81, 0.5)',
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                    <path
                      fillRule="evenodd"
                      d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
                <p className="text-sm text-gray-400">
                  Automated collection scheduling with intelligent alerts based on fill levels
                </p>
              </motion.div>
              
              {/* Feature 3 */}
              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  borderColor: 'rgba(34, 197, 94, 0.3)'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                style={{
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(55, 65, 81, 0.5)',
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path
                      fillRule="evenodd"
                      d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-sm text-gray-400">
                  Comprehensive waste analytics with predictive insights and optimization recommendations
                </p>
              </motion.div>
              
              {/* Feature 4 */}
              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  borderColor: 'rgba(34, 197, 94, 0.3)'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                style={{
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(55, 65, 81, 0.5)',
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM8.547 4.505a8.25 8.25 0 1011.672 8.214l-.46-.46a2.252 2.252 0 01-.422-.586l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.211.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.654-.261a2.25 2.25 0 01-1.384-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.279-2.132z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Route Optimization</h3>
                <p className="text-sm text-gray-400">
                  AI-powered route planning that minimizes fuel consumption and maximizes efficiency
                </p>
              </motion.div>
            </div>
            
            <div className="mt-auto flex gap-4">
              <Button asChild className="py-5 px-6 bg-green-600 hover:bg-green-700 text-white border-0 rounded-md">
                <Link href="/signin" className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z" clipRule="evenodd" />
                  </svg>
                  Sign In
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="py-5 px-6 border-green-500/50 bg-transparent text-white hover:bg-green-800/30 rounded-md">
                <Link href="/signup" className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                    <path d="M12 7a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                  Create Account
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Bottom stats section */}
          <div className="grid grid-cols-2 border-t border-gray-700">
            <div className="p-5 text-center border-r border-gray-700">
              <div className="text-3xl font-bold text-green-400">24/7</div>
              <div className="text-sm text-gray-400 mt-1">Real-time Monitoring</div>
            </div>
            <div className="p-5 text-center">
              <div className="text-3xl font-bold text-green-400">500+</div>
              <div className="text-sm text-gray-400 mt-1">Cities Deployed</div>
            </div>
          </div>
          
          {/* Bottom features section */}
          <div className="grid grid-cols-3 border-t border-gray-700">
            <div className="py-4 px-5 flex items-center gap-3">
              <div className="text-green-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                  <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold">Smart IoT Integration</div>
                <p className="text-xs text-gray-400">Connect all waste bins with IoT sensors</p>
              </div>
            </div>
            
            <div className="py-4 px-5 border-l border-r border-gray-700 flex items-center gap-3">
              <div className="text-green-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold">Route Optimization</div>
                <p className="text-xs text-gray-400">Plan efficient waste collection routes</p>
              </div>
            </div>
            
            <div className="py-4 px-5 flex items-center gap-3">
              <div className="text-green-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold">Waste Analytics</div>
                <p className="text-xs text-gray-400">Track waste patterns with detailed reports</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="py-3 px-6 border-t border-gray-700 flex justify-between items-center bg-gray-900/80">
            <div className="flex items-center gap-3 text-xs">
              <span>Version 1.0.0</span>
              <span className="text-gray-600 mx-1">•</span>
              <span>© 2025 Smart Dustbin System</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-green-900/30 text-green-400">Real-time</Badge>
              <Badge variant="secondary" className="text-xs bg-green-900/30 text-green-400">IoT Enabled</Badge>
              <Badge variant="secondary" className="text-xs bg-green-900/30 text-green-400">Smart Analytics</Badge>
              <Badge variant="secondary" className="text-xs bg-green-900/30 text-green-400">Eco-friendly</Badge>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
