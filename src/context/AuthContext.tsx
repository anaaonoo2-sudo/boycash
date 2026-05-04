/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User as FirebaseUser
} from "firebase/auth";
import { Shield, Zap } from "lucide-react";
import { auth } from "../lib/firebase";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  securityStatus: { vpn: boolean; rooted: boolean; safe: boolean };
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [securityStatus, setSecurityStatus] = useState({ vpn: false, rooted: false, safe: true });

  const adminEmail = "anaaonoo2@gmail.com";

  useEffect(() => {
    // Security checks can still be simulated or enhanced later
    const checkSecurity = async () => {
      const isVPN = false; // Simplified for now
      const isRooted = false;
      setSecurityStatus({ vpn: isVPN, rooted: isRooted, safe: !isVPN && !isRooted });
    };

    checkSecurity();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
        setIsAdmin(firebaseUser.email === adminEmail);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Safety timeout: If auth takes more than 5 seconds, stop loading so user can at least see the sign-in screen
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Auth Error:", error);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, securityStatus, signIn, signOut }}>
      {loading ? (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-8">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-primary font-black uppercase tracking-widest text-xs animate-pulse">Initializing BoyCash Secure...</p>
           </div>
        </div>
      ) : !securityStatus.safe ? (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-8 text-center uppercase">
          <div className="glass-card p-8 border-red-500/20">
            <h2 className="text-red-500 font-black text-2xl mb-4">Security Alert</h2>
            <p className="text-gray-400 text-sm">VPN or Rooted device detected. Access denied to protect earnings.</p>
          </div>
        </div>
      ) : !user ? (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] -ml-32 -mb-32 rounded-full" />
          
          <div className="w-full max-w-sm z-10 text-center animate-in fade-in duration-1000">
            <div className="mb-12 flex flex-col items-center animate-bounce-slow">
               <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary p-0.5 shadow-2xl shadow-primary/30 group">
                  <div className="w-full h-full rounded-[1.4rem] bg-[#030712] flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                     <span className="text-4xl font-black text-white italic">B</span>
                  </div>
               </div>
               <h1 className="mt-6 text-5xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">BoyCash</h1>
               <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.6em] mt-3">Ultimate Rewards System</p>
            </div>

            <div className="glass-card p-8 border-white/10 bg-white/[0.04] shadow-2xl shadow-black ring-1 ring-white/20">
              <h2 className="text-xl font-black mb-2 uppercase italic tracking-tight text-white">Welcome Player</h2>
              <p className="text-[10px] text-gray-500 mb-8 uppercase tracking-widest leading-loose">
                Sign in with Google to secure your earnings and start your journey.
              </p>
              
              <button 
                onClick={signIn}
                id="google-signin-btn"
                className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/90 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] relative z-20 cursor-pointer"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                <span className="text-xs uppercase tracking-[0.2em]">Sign in with Google</span>
              </button>
              
              <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
                 <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-accent-green/10 flex items-center justify-center text-accent-green">
                       <Shield size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Trusted by 10k+ Players</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                       <Zap size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Instant Payouts Enabled</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
