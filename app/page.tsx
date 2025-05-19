import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-green-400/10 via-green-50 to-blue-50 dark:from-green-950 dark:via-gray-900 dark:to-gray-800">
      {/* Animated Blob Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-400/30 dark:bg-green-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-blue-400/30 dark:bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-teal-400/30 dark:bg-teal-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 -z-5">
        <div className="particles">
          {[...Array(10)].map((_, i) => (
            <span 
              key={i} 
              style={{
                '--i': i + 1,
                'animationDelay': `${i * 0.2}s`,
                'left': `${Math.random() * 100}%`,
                'top': `${Math.random() * 100}%`,
                'width': `${Math.random() * 8 + 2}px`,
                'height': `${Math.random() * 8 + 2}px`,
              } as React.CSSProperties}
              className="absolute rounded-full bg-green-400/40 dark:bg-green-400/20 animate-float-slow"
            />
          ))}
        </div>
      </div>
      
      <div className="w-full max-w-4xl mx-auto">
        <Card className="backdrop-blur-md bg-background/70 dark:bg-background/50 border border-border/50 shadow-xl rounded-2xl overflow-hidden mb-6 hover:shadow-green-500/20 hover:shadow-2xl transition-all duration-300 scale-[0.98] hover:scale-100">
          <div className="grid md:grid-cols-5 gap-6">
            <div className="col-span-5 md:col-span-2 flex flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-green-500 to-teal-600 dark:from-green-600 dark:to-teal-800 text-white">
              {/* Glassmorphism pattern */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-lg"></div>
                <div className="absolute w-20 h-20 -top-10 -left-10 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute w-20 h-20 -bottom-10 -right-10 bg-white/10 rounded-full blur-xl"></div>
              </div>
              
              {/* Logo and main branding */}
              <div className="relative z-10 flex flex-col items-center justify-center py-10">
                <div className="mb-6 w-28 h-28 md:w-32 md:h-32 relative bg-white/20 rounded-2xl p-1 shadow-2xl transform hover:rotate-6 transition-all duration-300 hover:shadow-green-500/30">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center shadow-inner">
                    <span className="text-white text-5xl font-bold drop-shadow-md">SB</span>
                  </div>
                  
                  {/* 3D effect for logo */}
                  <div className="absolute -bottom-2 -right-2 w-full h-full rounded-xl bg-teal-700/40 blur-sm -z-10"></div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center text-white drop-shadow-md">Smart Dustbin <Badge variant="outline" className="ml-2 bg-white/10 text-white">PWA</Badge></h1>
                <p className="text-base md:text-lg mb-6 text-center text-teal-50/90">
                  Real-time monitoring system for smart waste management
                </p>
              </div>
            </div>
            
            <div className="col-span-5 md:col-span-3 flex flex-col justify-between p-6 md:p-8">
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-foreground">Welcome to Smart Dustbin</h2>
                  <p className="text-muted-foreground mb-4">
                    The next generation waste management solution that helps you monitor, optimize, and manage waste collection efficiently.
                  </p>
                  
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-foreground">Real-time location tracking of waste bins</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                        </svg>
                      </div>
                      <span className="text-foreground">Fill level monitoring with AI predictions</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-foreground">Advanced analytics and optimization</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <Button asChild variant="default" className="font-medium text-lg py-6 bg-gradient-to-r from-green-600 to-teal-600 border-0 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:scale-[1.02] transition-all duration-300">
                  <Link href="/signin">Sign In</Link>
                </Button>
                
                <Button asChild variant="outline" className="font-medium text-lg py-6 border-green-500/20 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 hover:border-green-500/30 shadow-lg hover:scale-[1.02] transition-all duration-300">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
          
          <CardFooter className="px-6 py-4 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 order-2 md:order-1">
              <span className="text-xs text-muted-foreground">Version 1.0.0</span>
              <span className="text-muted-foreground/30 mx-2">•</span>
              <span className="text-xs text-muted-foreground">© 2025 Smart Dustbin System</span>
            </div>
            
            <div className="order-1 md:order-2 flex items-center gap-2">
              {['Real-time Monitoring', 'Smart Management', 'Analytics'].map((feature, index) => (
                <Badge key={index} variant="secondary" className="bg-secondary/50 hover:bg-secondary/70 transition-colors">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardFooter>
        </Card>
        
        {/* Feature cards with hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[
            {
              title: 'Smart IoT Integration',
              description: 'Connect and manage all your waste bins with our IoT sensors',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                  <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
                  <path d="M12 7.875a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" />
                </svg>
              )
            },
            {
              title: 'Route Optimization',
              description: 'Plan the most efficient waste collection routes automatically',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              )
            },
            {
              title: 'Waste Analytics',
              description: 'Track and analyze waste patterns with detailed reports',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
                </svg>
              )
            },
          ].map((feature, index) => (
            <HoverCard key={index}>
              <HoverCardTrigger asChild>
                <Card className="hover:shadow-lg hover:shadow-green-500/10 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 backdrop-blur-md bg-background/90">
                <div className="flex justify-between space-x-4">
                  <Avatar className="h-12 w-12 border-2 border-green-500/20">
                    <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400">{feature.title.split(' ').map(word => word[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <div className="flex items-center pt-2">
                      <Badge variant="outline" className="text-xs bg-green-500/5 text-green-600 dark:text-green-400 border-green-500/20">
                        Coming Soon
                      </Badge>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
      
      {/* Add custom animations to globals.css */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: scale(1) translate(0px, 0px);
          }
          33% {
            transform: scale(1.1) translate(40px, -20px);
          }
          66% {
            transform: scale(0.9) translate(-20px, 40px);
          }
          100% {
            transform: scale(1) translate(0px, 0px);
          }
        }
        
        @keyframes float-slow {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 0.6;
          }
          100% {
            transform: translateY(-40px) scale(0.8);
            opacity: 0;
          }
        }
        
        .animate-blob {
          animation: blob 10s infinite alternate;
        }
        
        .animate-float-slow {
          animation: float-slow 8s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}

