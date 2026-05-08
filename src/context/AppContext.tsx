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
  getDoc
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
  updateLevel: (newLevel: AppState["level"]) => Promise<void>;
  processReferral: (code: string) => Promise<boolean>;
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
    
    const checkUser = async () => {
      try {
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

          const pendingRef = sessionStorage.getItem("pending_referral");
          if (pendingRef) {
            await processReferral(pendingRef);
            sessionStorage.removeItem("pending_referral");
          }
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
      }
    };

    checkUser();

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

    const transactionsRef = collection(db, "users", user.uid, "transactions");
    const unsubTransactions = onSnapshot(transactionsRef, (snap) => {
      const txs = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
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

      const txDoc = await addDoc(transactionRef, {
        type: "withdraw",
        amount: amount,
        status: "pending",
        method: method,
        date: Date.now(),
        createdAt: serverTimestamp()
      });

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
    await addCoins(10);
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
    
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("referralCode", "==", code.toUpperCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) return false;
      
      const referrerDoc = snap.docs[0];
      const referrerId = referrerDoc.id;
      
      const userDocRef = doc(db, "users", user.uid);
      const currentUserSnap = await getDoc(userDocRef);
      if (currentUserSnap.exists() && currentUserSnap.data().referredBy) return false;

      await updateDoc(userDocRef, {
        referredBy: referrerId,
        coins: state.coins + 100,
        updatedAt: serverTimestamp()
      });

      const referrerRef = doc(db, "users", referrerId);
      await updateDoc(referrerRef, {
        coins: (referrerDoc.data().coins || 0) + 250,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, "users", user.uid, "transactions"), {
        type: "earn",
        amount: 100,
        status: "completed",
        date: Date.now(),
        method: "Referral Bonus",
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, "users", referrerId, "transactions"), {
        type: "earn",
        amount: 250,
        status: "completed",
        date: Date.now(),
        method: `Referral: ${user.displayName || "New User"}`,
        createdAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users`);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{ state, addCoins, requestWithdrawal, claimDaily, awardAdReward, updateLevel, processReferral }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
