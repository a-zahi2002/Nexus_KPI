import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#e8e8e8] dark:bg-[#0a0a0f]">
      {/* Floating Tile Container - Portrait Style */}
      <div className="w-full max-w-md glass-panel rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col items-center py-8 px-6 max-h-[95vh]">
        
        {/* Top Title */}
        <div className="w-full text-center z-10 flex-shrink-0 mb-6">
          <h1 className="text-4xl font-bold text-black dark:text-white tracking-tighter font-['Oswald'] uppercase drop-shadow-sm">
            KPI SYSTEM
          </h1>
        </div>

        {/* Main Content Wrapper */}
        <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10 min-h-0">
          
          {/* Main Logo */}
          <div className="mb-6 relative group flex-shrink-0">
            <div className="w-40 h-40 rounded-full flex items-center justify-center shadow-xl overflow-hidden relative">
              <img 
                src="/images/Round_logo.png" 
                alt="Leo Club Logo" 
                className="w-full h-full object-cover opacity-100"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-[url("https://upload.wikimedia.org/wikipedia/en/7/7f/Leo_Club_Logo.svg")]', 'bg-center', 'bg-contain', 'bg-no-repeat');
                }}
              />
            </div>
          </div>

          {/* Club Name */}
          <div className="text-center mb-8 flex-shrink-0 px-4">
            <h2 className="text-lg font-serif font-bold text-black dark:text-white tracking-wide uppercase leading-tight drop-shadow-md">
              Leo Club of<br />
              Sabaragamuwa<br />
              University of Sri Lanka
            </h2>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-3 relative z-20 flex-shrink-0">
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white text-black px-4 py-3 font-bold text-base shadow-md border-none focus:ring-2 focus:ring-maroon-600 outline-none placeholder-black/60 text-center rounded-xl"
                placeholder="USER EMAIL"
              />
            </div>

            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white text-black px-4 py-3 font-bold text-base shadow-md border-none focus:ring-2 focus:ring-maroon-600 outline-none placeholder-black/60 text-center rounded-xl pr-10"
                placeholder="PASSWORD"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-maroon-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-2 text-xs font-bold shadow-md text-center" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon-600 hover:bg-maroon-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  LOGIN
                </>
              )}
            </button>
          </form>
        </div>

        {/* Background Mask Graphic - Subtle & Behind Content */}
        <div className="absolute right-0 bottom-0 w-[250px] h-[400px] pointer-events-none z-0 opacity-10 dark:opacity-5 mix-blend-multiply dark:mix-blend-normal">
          <img 
            src="/images/side-mask.png" 
            alt="Traditional Mask" 
            className="w-full h-full object-contain object-bottom-right"
            onError={(e) => e.currentTarget.style.display = 'none'} 
          />
        </div>

        {/* Footer Logos */}
        <div className="w-full z-10 mt-6 flex-shrink-0">
          <div className="bg-white/50 dark:bg-white/10 backdrop-blur-sm rounded-full py-2 px-6 mx-auto max-w-fit shadow-sm flex items-center justify-center border border-white/20">
            <img 
              src="/images/LOGO_LINE.png" 
              alt="Sponsors" 
              className="h-8 md:h-10 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerText = 'Sponsor Bar Placeholder';
                e.currentTarget.parentElement!.classList.add('text-xs', 'text-gray-500', 'font-bold');
              }}
            />
          </div>
          
          <div className="text-center mt-3 space-y-0.5">
            <p className="text-black dark:text-white font-bold tracking-widest uppercase text-[10px]">
              Leo Club of Sabaragamuwa University
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-[9px]">
              © 2025 All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
