/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  Timestamp,
  getDoc,
  writeBatch,
  increment
} from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "../lib/firebase";
import { useAuth } from "./AuthContext";

interface Transaction {
  id: string;
  type: "earn" | "withdraw";
  amount: number;
  status: "pending" | "completed" | "failed";
  method?: string;
  date: number;
}

interface AppState {
  balance: number;
  coins: number;
  level: "Bronze" | "Silver" | "Gold" | "VIP";
  multiplier: number;
  dailyStreak: number;
  lastClaimed?: number;
  referralCode: string;
  transactions: Transaction[];
}

interface AppContextType {
  state: AppState;
  addCoins: (amount: number) => Promise<void>;
  requestWithdrawal: (amount: number, method: string, details?: string) => Promise<boolean>;
  claimDaily: () => Promise<void>;
  awardAdReward: () => Promise<void>;
  triggerAd: (onComplete?: () => void) => void;
  updateLevel: (newLevel: AppState["level"]) => Promise<void>;
  processReferral: (code: string) => Promise<boolean>;
  completeTask: (taskId: string, reward: number, title: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>({
    balance: 0,
    coins: 0,
    level: "Bronze",
    multiplier: 1.0,
    dailyStreak: 1,
    referralCode: "",
    transactions: [],
  });

  useEffect(() => {
    if (!user) {
      setState({
        balance: 0,
        coins: 0,
        level: "Bronze",
        multiplier: 1.0,
        dailyStreak: 1,
        referralCode: "",
        transactions: [],
      });
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    
    // Check if user exists, if not create
    const checkUser = async () => {
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          coins: 0,
          balance: 0,
          level: "Bronze",
          multiplier: 1.0,
          dailyStreak: 1,
          referralCode: newReferralCode,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(userDocRef, userData);

        // Register referral code in the isolated collection
        await setDoc(doc(db, "referralCodes", newReferralCode), {
          uid: user.uid,
          createdAt: serverTimestamp()
        });

        // Apply pending referral if exists
        const pendingRef = sessionStorage.getItem("pending_referral");
        if (pendingRef) {
          await processReferral(pendingRef);
          sessionStorage.removeItem("pending_referral");
        }
      }
    };

    checkUser();

    // Listen to user data
    const queryParams = new URLSearchParams(window.location.search);
    const refCode = queryParams.get("ref");
    if (refCode) {
      sessionStorage.setItem("pending_referral", refCode.toUpperCase());
    }

    const unsubUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setState(prev => ({
          ...prev,
          coins: data.coins || 0,
          balance: data.balance || 0,
          level: data.level || "Bronze",
          multiplier: data.multiplier || 1.0,
          dailyStreak: data.dailyStreak || 1,
          lastClaimed: data.lastClaimed,
          referralCode: data.referralCode || "",
        }));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    // Listen to transactions
    const transactionsRef = collection(db, "users", user.uid, "transactions");
    const unsubTransactions = onSnapshot(transactionsRef, (snap) => {
      const txs = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      // Sort by date desc
      txs.sort((a, b) => b.date - a.date);
      setState(prev => ({ ...prev, transactions: txs }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/transactions`);
    });

    return () => {
      unsubUser();
      unsubTransactions();
    };
  }, [user]);

  const addCoins = async (amount: number) => {
    if (!user) return;
    const rewardCoins = amount * state.multiplier;
    const rewardBalance = rewardCoins / 1000;
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      const transactionRef = collection(db, "users", user.uid, "transactions");

      await updateDoc(userDocRef, {
        coins: state.coins + rewardCoins,
        balance: state.balance + rewardBalance,
        updatedAt: serverTimestamp()
      });

      await addDoc(transactionRef, {
        type: "earn",
        amount: rewardCoins,
        status: "completed",
        date: Date.now(),
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const requestWithdrawal = async (amount: number, method: string, details: string = "") => {
    if (!user || state.balance < amount) return false;
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      const transactionRef = collection(db, "users", user.uid, "transactions");
      const globalWithdrawalsRef = collection(db, "withdrawals");

      await updateDoc(userDocRef, {
        balance: state.balance - amount,
        updatedAt: serverTimestamp()
      });

      // User's own transaction record
      const txDoc = await addDoc(transactionRef, {
        type: "withdraw",
        amount: amount,
        status: "pending",
        method: method,
        date: Date.now(),
        createdAt: serverTimestamp()
      });

      // Global record for admin
      await addDoc(globalWithdrawalsRef, {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || "User",
        amount: amount,
        method: method,
        details: details || "Electronic Transfer",
        status: "pending",
        transactionId: txDoc.id,
        createdAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      return false;
    }
  };

  const claimDaily = async () => {
    if (!user) return;
    const rewards = [10, 15, 25, 40, 55, 75, 100];
    const reward = rewards[state.dailyStreak - 1] || 10;
    
    await addCoins(reward);
    
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      dailyStreak: (state.dailyStreak % 7) + 1,
      lastClaimed: Date.now(),
      updatedAt: serverTimestamp()
    });
  };

  const awardAdReward = async () => {
    // Standard reward for viewing an ad is 10 coins (before multiplier)
    await addCoins(10);
  };

  const [isAdLoading, setIsAdLoading] = useState(false);

  const triggerAd = (onComplete?: () => void) => {
    const anyWindow = window as any;
    const AD_UNIT_ID = import.meta.env.VITE_ADMOB_REWARDED_ID || "ca-app-pub-2691032504478251/3649519865";

    // Mobile logic
    if (anyWindow.Android && anyWindow.Android.showRewardedAd) {
      anyWindow.Android.showRewardedAd(AD_UNIT_ID);
      awardAdReward();
      if (onComplete) onComplete();
      return;
    }

    // Web simulation
    setIsAdLoading(true);
    setTimeout(() => {
      awardAdReward();
      setIsAdLoading(false);
      if (onComplete) onComplete();
    }, 5000);
  };

  const updateLevel = async (level: AppState["level"]) => {
    if (!user) return;
    const multipliers = { Bronze: 1.0, Silver: 1.2, Gold: 1.5, VIP: 2.0 };
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      level,
      multiplier: multipliers[level],
      updatedAt: serverTimestamp()
    });
  };

  const processReferral = async (code: string) => {
    if (!user || state.referralCode === code) return false;
    
    const codeFormatted = code.toUpperCase();
    try {
      // Find the user with this referral code using the isolated collection
      const referralDocRef = doc(db, "referralCodes", codeFormatted);
      const referralSnap = await getDoc(referralDocRef);
      
      if (!referralSnap.exists()) return false;
      
      const referrerId = referralSnap.data().uid;
      if (referrerId === user.uid) return false;
      
      // Update current user
      const userDocRef = doc(db, "users", user.uid);
      const currentUserSnap = await getDoc(userDocRef);
      if (currentUserSnap.exists() && currentUserSnap.data().referredBy) return false; // Already referred

      const batch = writeBatch(db);
      
      // Bonus amounts
      const newUserBonus = 100;
      const referrerBonus = 250;

      batch.update(userDocRef, {
        referredBy: referrerId,
        coins: increment(newUserBonus),
        updatedAt: serverTimestamp()
      });

      // Reward referrer
      const referrerRef = doc(db, "users", referrerId);
      batch.update(referrerRef, {
        coins: increment(referrerBonus),
        updatedAt: serverTimestamp()
      });

      // Add transactions
      batch.set(doc(collection(db, "users", user.uid, "transactions")), {
        type: "earn",
        amount: newUserBonus,
        status: "completed",
        date: Date.now(),
        method: "Referral Bonus",
        createdAt: serverTimestamp()
      });

      batch.set(doc(collection(db, "users", referrerId, "transactions")), {
        type: "earn",
        amount: referrerBonus,
        status: "completed",
        date: Date.now(),
        method: "Referral Reward",
        createdAt: serverTimestamp()
      });

      await batch.commit();
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "referral_processing");
      return false;
    }
  };

  const completeTask = async (taskId: string, reward: number, title: string) => {
    if (!user) return false;

    try {
      const taskStatusRef = doc(db, "users", user.uid, "completedTasks", taskId);
      const statusSnap = await getDoc(taskStatusRef);

      if (statusSnap.exists()) {
        return false; // Already completed
      }

      await addCoins(reward);

      await setDoc(taskStatusRef, {
        taskId,
        title,
        completedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
       handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/completedTasks/${taskId}`);
       return false;
    }
  };

  return (
    <AppContext.Provider value={{ state, addCoins, requestWithdrawal, claimDaily, awardAdReward, triggerAd, updateLevel, processReferral, completeTask }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
