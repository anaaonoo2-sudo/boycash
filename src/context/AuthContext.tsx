/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User as FirebaseUser,
  getRedirectResult,
  signInWithRedirect,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signInAnonymously,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { Shield, Zap, AlertTriangle, RefreshCcw, Phone, ArrowLeft, Send, Smartphone, Mail } from "lucide-react";
import { motion } from "motion/react";
import { auth } from "../lib/firebase";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  securityStatus: { vpn: boolean; rooted: boolean; safe: boolean };
  signIn: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signInWithDevice: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<{message: string, code: string} | null>(null);
  const [securityStatus, setSecurityStatus] = useState({ vpn: false, rooted: false, safe: true });
  
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  const adminEmail = "anaaonoo2@gmail.com";

  useEffect(() => {
  setLoading(true);
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        console.log("Redirect Sign-In successful:", result.user.uid);
      }
    })
    .catch((error) => {
      if (error?.code !== 'auth/null-user') {
        handleAuthError(error);
      }
    })
    .finally(() => {
      setLoading(false);
    });

  const handleEmailSignIn = async () => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailToUse = window.localStorage.getItem('emailForSignIn');
      if (!emailToUse) emailToUse = window.prompt('Please provide your email for confirmation');
      if (emailToUse) {
        try {
          await signInWithEmailLink(auth, emailToUse, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
        } catch (error) {
          handleAuthError(error);
          }
        }
      }
    };

    handleEmailSignIn();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsAdmin(firebaseUser.email === adminEmail);
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const { db } = await import("../lib/firebase");
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists() && userDoc.data().isBanned) {
            await firebaseSignOut(auth);
            setUser(null);
            setIsAdmin(false);
            setAuthError({ message: "تم حظر حسابك. تواصل مع الدعم.", code: "auth/account-banned" });
            setLoading(false);
            return;
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          });
          setAuthError(null);
        } catch (e) {
          console.error("Auth process error:", e);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
  setAuthError(null);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
    if (isNative) {
      await signInWithRedirect(auth, provider);
    } else {
      await signInWithPopup(auth, provider);
    }
  } catch (error: any) {
    handleAuthError(error);
    }
  };

  const setupRecaptcha = () => {
    if (recaptchaVerifier) return recaptchaVerifier;
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    setRecaptchaVerifier(verifier);
    return verifier;
  };

  const signInWithPhone = async (phone: string) => {
    setAuthError(null);
    try {
      const verifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(result);
      setShowOtpInput(true);
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const verifyOtp = async (code: string) => {
    setAuthError(null);
    if (!confirmationResult) return;
    try {
      await confirmationResult.confirm(code);
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const signInWithEmail = async (email: string) => {
    setAuthError(null);
    const actionCodeSettings = {
      url: 'https://boycash-dc4e4.vercel.app',
      handleCodeInApp: true,
    };
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const signInWithDevice = async () => {
    setAuthError(null);
    try {
      console.log("Attempting Device Identity Sign-In...");
      const result = await signInAnonymously(auth);
      console.log("Device Sign-In Successful!", result.user.uid);
      // Store a flag to indicate this specific device was used
      localStorage.setItem('auth_method', 'device_id');
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const handleAuthError = (error: any) => {
    console.error("Auth Error Details:", error);
    
    let message = "فشل تسجيل الدخول. يرجى التأكد من إعدادات Firebase.";
    
    if (error.code === 'auth/unauthorized-domain') {
      message = "هذا النطاق غير مصرح به. يجب إضافة رابط موقعك إلى Authorized Domains في Firebase.";
    } else if (error.code === 'auth/popup-blocked') {
      message = "تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة.";
    } else if (error.code === 'auth/operation-not-allowed') {
      message = "طريقة تسجيل الدخول هذه غير مفعلة في Firebase.";
    } else if (error.code === 'auth/invalid-phone-number') {
      message = "رقم الهاتف غير صحيح.";
    } else if (error.code === 'auth/too-many-requests') {
      message = "طلب كثير جداً. يرجى المحاولة لاحقاً.";
    } else if (error.code === 'auth/code-expired') {
      message = "انتهت صلاحية الرمز. يرجى طلب رمز جديد.";
    } else if (error.code === 'auth/invalid-verification-code') {
      message = "الرمز الذي أدخلته غير صحيح.";
    } else if (error.code === 'auth/invalid-email') {
      message = "البريد الإلكتروني غير صحيح.";
    } else if (error.code === 'auth/admin-restricted-operation') {
      message = "خطأ: هذه العملية مقيدة. يرجى الذهاب إلى Firebase Console وتفعيل Anonymous Auth (للدخول بـ Device ID) و Phone Auth (للدخول بالهاتف) من قسم Authentication.";
    }

    setAuthError({ message, code: error.code || 'unknown' });
  };

  const signInRedirect = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      setAuthError({ message: "فشل التحويل لتسجيل الدخول.", code: error.code });
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      loading, 
      securityStatus, 
      signIn, 
      signInWithPhone, 
      verifyOtp, 
      signInWithEmail,
      signInAnonymously: signInWithDevice, // Fixed mapping
      signInWithDevice,
      signOut 
    }}>
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
      ) : (!user && window.location.pathname !== '/privacy' && window.location.pathname !== '/terms') ? (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
          {/* Enhanced Background */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] -mr-64 -mt-64 rounded-full opacity-50" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 blur-[120px] -ml-64 -mb-64 rounded-full opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent_70%)] pointer-events-none" />
          
          <div className="w-full max-w-sm z-10 text-center">
            <div className="mb-10 flex flex-col items-center">
               <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary p-0.5 shadow-2xl shadow-primary/30 group">
                  <div className="w-full h-full rounded-[1.4rem] bg-[#030712] flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                     <img 
                       src="/src/assets/images/regenerated_image_1778432815039.png" 
                       alt="BoyCash Logo" 
                       className="w-full h-full object-cover rounded-[1.2rem] group-hover:scale-110 transition-transform duration-700"
                     />
                  </div>
               </div>
               <h1 className="mt-8 text-6xl font-black tracking-tighter uppercase italic text-white drop-shadow-[0_8px_24px_rgba(139,92,246,0.5)]">
                 Boy<span className="text-primary">Cash</span>
               </h1>
               <p className="text-[11px] text-white/50 font-black uppercase tracking-[0.4em] mt-4 flex items-center gap-3">
                 <span className="w-8 h-[1px] bg-white/20"></span>
                 Premium Rewards
                 <span className="w-8 h-[1px] bg-white/20"></span>
               </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="glass-card p-10 border-white/20 bg-black/40 shadow-[0_40px_100px_rgba(0,0,0,0.8)] ring-1 ring-white/10 relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 blur-3xl rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-secondary/20 blur-3xl rounded-full" />

                <h2 className="text-2xl font-black mb-2 uppercase italic tracking-tight text-white leading-none">
                  {showPhoneInput ? "Phone Access" : showEmailInput ? "Direct Link" : "Join the Game"}
                </h2>
                <p className="text-[10px] text-gray-400 mb-8 uppercase tracking-widest font-bold leading-loose opacity-70">
                  {showPhoneInput 
                    ? "Verify your device to continue your streak." 
                    : showEmailInput 
                      ? "Check your inbox for a secure magic link."
                      : "Choose your identity to secure your earnings."}
                </p>

                <div className="mb-10 flex items-start gap-5 text-left bg-white/[0.05] p-6 rounded-3xl border-2 border-white/10 group hover:border-primary/50 transition-all duration-500 shadow-lg shadow-black/20">
                   <div className="relative flex items-center pt-1">
                     <input 
                       type="checkbox" 
                       id="terms-checkbox"
                       checked={acceptedTerms}
                       onChange={(e) => setAcceptedTerms(e.target.checked)}
                       className="w-8 h-8 rounded-xl border-white/30 bg-black/50 text-base appearance-none checked:bg-primary border-3 transition-all relative z-10 cursor-pointer hover:border-primary"
                     />
                     {acceptedTerms && (
                       <Zap size={16} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white fill-white pointer-events-none z-20" />
                     )}
                   </div>
                   <label htmlFor="terms-checkbox" className="text-xs text-gray-300 font-bold uppercase leading-[1.8] cursor-pointer select-none group-hover:text-white transition-colors">
                     <span className="text-primary font-black block mb-1 text-sm tracking-tighter">خطوة هامة:</span>
                     أوافق على <a href="/terms" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30">شروط الخدمة</a> و <a href="/privacy" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30">سياسة الخصوصية</a>.
                     <span className="block mt-2 text-[10px] text-red-500 font-black italic tracking-widest bg-red-500/10 w-fit px-2 py-0.5 rounded">نظام مضاد للغش و VPN نشط 🛡️</span>
                   </label>
                </div>

                {authError && (
                  <div className="mb-8 p-5 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col gap-2 text-left animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 text-red-500 font-black italic">
                      <AlertTriangle size={16} />
                      <span className="text-[11px] uppercase tracking-wider">Access Denied</span>
                    </div>
                    <p className="text-[11px] text-red-200/60 font-bold leading-relaxed px-1">
                      {authError.message}
                    </p>
                    <button 
                      onClick={() => {
                        setAuthError(null);
                        setShowOtpInput(false);
                      }}
                      className="mt-3 text-[10px] text-primary font-black uppercase flex items-center gap-2 hover:translate-x-1 transition-transform w-fit"
                    >
                      <RefreshCcw size={12} />
                      Try Again
                    </button>
                  </div>
                )}

                {!showPhoneInput && !showEmailInput ? (
                  <div className={`flex flex-col gap-4 ${!acceptedTerms ? 'opacity-40 cursor-not-allowed grayscale' : ''} transition-all duration-500`}>
                    {!acceptedTerms && (
                      <p className="text-[9px] text-primary font-black uppercase mb-1 animate-pulse italic tracking-widest text-center">Agree to terms to unlock access</p>
                    )}
                    
                    <button 
                      onClick={signIn}
                      disabled={!acceptedTerms}
                      className="group relative w-full h-16 bg-white/5 border border-white/10 text-white font-bold rounded-[1.25rem] flex items-center px-8 gap-5 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <img src="https://www.google.com/favicon.ico" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                      <span className="text-[11px] uppercase tracking-[0.2em]">Continue with Google</span>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                         <Zap size={14} className="text-primary" />
                      </div>
                    </button>

                    <button 
                      onClick={() => setShowEmailInput(true)}
                      disabled={!acceptedTerms}
                      className="group relative w-full h-16 bg-white/5 border border-white/10 text-white font-bold rounded-[1.25rem] flex items-center px-8 gap-5 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                         <Mail size={18} className="text-[#EA4335]" />
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.2em]">Email Magic Link</span>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                         <Zap size={14} className="text-primary" />
                      </div>
                    </button>

                    <button 
                      onClick={() => setShowPhoneInput(true)}
                      disabled={!acceptedTerms}
                      className="group relative w-full h-16 bg-white/5 border border-white/10 text-white font-bold rounded-[1.25rem] flex items-center px-8 gap-5 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                         <Phone size={18} className="text-[#10b981]" />
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.2em]">Phone Number ID</span>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                         <Zap size={14} className="text-primary" />
                      </div>
                    </button>

                    <button 
                      onClick={signInWithDevice}
                      disabled={!acceptedTerms}
                      className="group relative w-full h-16 bg-white/5 border border-white/10 text-white font-bold rounded-[1.25rem] flex items-center px-8 gap-5 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                         <Smartphone size={18} className="text-primary" />
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.2em]">Quick Device Login</span>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                         <Zap size={14} className="text-primary" />
                      </div>
                    </button>
                  </div>
                ) : showEmailInput ? (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-5"
                  >
                    {!emailSent ? (
                      <>
                        <div className="relative">
                          <input 
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-600 tracking-wider"
                          />
                          <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                        </div>
                        <button 
                          onClick={() => signInWithEmail(email)}
                          disabled={!email || !email.includes('@') || !acceptedTerms}
                          className="w-full h-16 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-xs uppercase tracking-[0.3em]">Secure login</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-8 bg-primary/10 border border-primary/20 rounded-3xl animate-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mail size={30} className="text-primary animate-bounce-slow" />
                        </div>
                        <p className="text-primary text-sm font-black uppercase mb-3 tracking-[0.2em]">Check your email</p>
                        <p className="text-gray-400 text-[10px] uppercase font-black leading-relaxed px-8 tracking-widest opacity-80 mt-4">
                          We've sent a magic link to <span className="text-white italic">{email}</span>. Click it to enter.
                        </p>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        setShowEmailInput(false);
                        setEmailSent(false);
                        setAuthError(null);
                      }}
                      className="mt-4 flex items-center justify-center gap-3 text-[11px] text-gray-500 uppercase font-black hover:text-white transition-all group"
                    >
                      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                      Back to options
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-5"
                  >
                    {!showOtpInput ? (
                      <>
                        <div className="relative">
                          <input 
                            type="tel"
                            placeholder="PHONE NUMBER"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-600 tracking-wider"
                          />
                          <Phone className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                        </div>
                        <button 
                          onClick={() => signInWithPhone(phoneNumber)}
                          disabled={!phoneNumber || !acceptedTerms}
                          className="w-full h-16 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-xs uppercase tracking-[0.3em]">Send OTP</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-center mb-2 px-8">
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] leading-relaxed italic">Enter the code sent to your mobile</p>
                        </div>
                        <input 
                          type="text"
                          placeholder="••••••"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/30 rounded-2xl px-6 py-6 text-white text-center text-4xl font-black tracking-[0.4em] focus:border-white focus:ring-1 focus:ring-white outline-none transition-all"
                          maxLength={6}
                        />
                        <button 
                          onClick={() => verifyOtp(otp)}
                          disabled={otp.length !== 6}
                          className="group relative w-full h-16 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl disabled:opacity-50 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700" />
                          <span className="text-xs uppercase tracking-[0.4em]">Verify Identity</span>
                        </button>
                      </>
                    )}

                    <button 
                      onClick={() => {
                        setShowPhoneInput(false);
                        setShowOtpInput(false);
                        setAuthError(null);
                      }}
                      className="mt-4 flex items-center justify-center gap-3 text-[11px] text-gray-500 uppercase font-black hover:text-white transition-all group"
                    >
                      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                      Back to options
                    </button>
                  </motion.div>
                )}

                <div id="recaptcha-container"></div>

                <div className="mt-10 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-6 text-[10px] text-gray-400 uppercase font-black tracking-widest">
                     <a href="/privacy" className="hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1">Privacy</a>
                     <span className="opacity-10 w-1 h-1 bg-white rounded-full"></span>
                     <a href="/terms" className="hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1">Terms</a>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <p className="text-[9px] text-gray-600 mb-2 uppercase tracking-[0.3em] font-bold">
                      Connection Issues?
                    </p>
                    <button 
                      onClick={signInRedirect}
                      className="text-[10px] text-white/30 hover:text-white underline decoration-white/20 underline-offset-4 cursor-pointer uppercase font-black tracking-widest transition-colors"
                    >
                      Use Redirect Method
                    </button>
                  </div>
                </div>
              
              <div className="mt-10 pt-8 border-t border-white/[0.05] grid grid-cols-2 gap-4">
                 <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/[0.03]">
                    <div className="w-8 h-8 rounded-lg bg-accent-green/10 flex items-center justify-center text-accent-green shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                       <Shield size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white uppercase leading-none mb-1">Secure</span>
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter line-clamp-1">Multi-factor ready</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/[0.03]">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                       <Zap size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white uppercase leading-none mb-1">Instant</span>
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter line-clamp-1">Payouts active</span>
                    </div>
                 </div>
              </div>
            </motion.div>
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
