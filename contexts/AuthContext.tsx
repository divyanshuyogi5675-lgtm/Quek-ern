
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  signInWithPopup, 
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { ref, set, get, child, update, push, onValue, Unsubscribe, query, orderByChild, equalTo } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, googleProvider, db, storage } from '../services/firebase';
import { User, AuthContextType, Product, Investment, Transaction, WithdrawalDetails, SupportSettings } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const ADMIN_EMAIL = "divyanshuyogi265@gmail.com";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<'en' | 'hi'>('en'); 
  const [upiId, setUpiId] = useState<string>("JKBMERC00722786@jkb"); 
  const [websiteUrl, setWebsiteUrl] = useState<string>("https://flipkart-invest.com"); 
  
  const [supportSettings, setSupportSettings] = useState<SupportSettings>({
      whatsapp: "+919876543210",
      telegram: "https://t.me/flipkart_invest_official",
      email: "support@flipkart-invest.com"
  });
  
  const [adminRechargeRequests, setAdminRechargeRequests] = useState<Transaction[]>([]);
  const [adminWithdrawRequests, setAdminWithdrawRequests] = useState<Transaction[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  useEffect(() => {
    const upiRef = ref(db, 'app_settings/upi_id');
    const supportRef = ref(db, 'app_settings/support');
    const urlRef = ref(db, 'app_settings/website_url');
    
    const unsubUpi = onValue(upiRef, (snapshot) => {
        if (snapshot.val()) setUpiId(snapshot.val());
    });
    
    const unsubSupport = onValue(supportRef, (snapshot) => {
        if (snapshot.val()) {
            setSupportSettings(prev => ({ ...prev, ...snapshot.val() }));
        }
    });

    const unsubUrl = onValue(urlRef, (snapshot) => {
        if (snapshot.val()) {
            setWebsiteUrl(snapshot.val().replace(/\/$/, "")); 
        } else {
            setWebsiteUrl(window.location.origin);
        }
    });

    return () => { unsubUpi(); unsubSupport(); unsubUrl(); };
  }, []);

  const processInvestments = async (userData: User) => {
      const updates: any = {};
      const now = Date.now();
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      
      let newBalance = userData.balance;
      let newTotalEarning = userData.totalEarning;
      let newTodayEarning = 0; 
      
      const shouldCredit = !userData.lastIncomeUpdate || userData.lastIncomeUpdate < todayMidnight.getTime();
      
      if (!userData.investments) return;

      Object.entries(userData.investments).forEach(([invId, inv]) => {
          if (inv.status !== 'active') return;

          if (now > inv.endDate) {
              updates[`users/${userData.id}/investments/${invId}/status`] = 'completed';
              return; 
          }

          if (shouldCredit) {
              newBalance += inv.dailyIncome;
              newTotalEarning += inv.dailyIncome;
              newTodayEarning += inv.dailyIncome;
          }
      });

      if (shouldCredit && newTodayEarning > 0) {
          updates[`users/${userData.id}/balance`] = newBalance;
          updates[`users/${userData.id}/totalEarning`] = newTotalEarning;
          updates[`users/${userData.id}/todayEarning`] = newTodayEarning; 
          updates[`users/${userData.id}/lastIncomeUpdate`] = now;
          
          await update(ref(db), updates);
      } else if (shouldCredit) {
           updates[`users/${userData.id}/lastIncomeUpdate`] = now;
           updates[`users/${userData.id}/todayEarning`] = 0; 
           await update(ref(db), updates);
      }
  };

  useEffect(() => {
    let userUnsubscribe: Unsubscribe | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        
        userUnsubscribe = onValue(userRef, async (snapshot) => {
          const dbUser = snapshot.val() || {};
          
          let currentInviteCode = dbUser.inviteCode;
          if (!currentInviteCode) {
              currentInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
              update(ref(db, `users/${firebaseUser.uid}`), { inviteCode: currentInviteCode });
          }

          const appUser: User = {
            id: firebaseUser.uid,
            name: dbUser.username || firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            phoneNumber: dbUser.phoneNumber || firebaseUser.phoneNumber || null,
            avatar: dbUser.avatar || firebaseUser.photoURL,
            inviteCode: currentInviteCode,
            address: dbUser.address || null,
            lastDailyBonus: dbUser.lastDailyBonus || 0,
            lastIncomeUpdate: dbUser.lastIncomeUpdate || 0,
            balance: Number(dbUser.balance) || 0,
            spin_balance: Number(dbUser.spin_balance) || 0,
            
            // Stacking Reward Fields
            rewardDailyRate: Number(dbUser.rewardDailyRate) || 0,
            rewardEndDate: Number(dbUser.rewardEndDate) || 0,
            lastRewardClaim: Number(dbUser.lastRewardClaim) || 0,

            totalEarning: Number(dbUser.totalEarning) || 0,
            todayEarning: Number(dbUser.todayEarning) || 0,
            investments: dbUser.investments || {},
            transactions: dbUser.transactions || {}
          };
          
          setUser(appUser);
          setIsLoading(false);
          processInvestments(appUser);

        }, (error) => {
          console.error("User Sync Error:", error);
          setIsLoading(false);
        });

      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (userUnsubscribe) {
          // @ts-ignore
          userUnsubscribe();
      }
    };
  }, []);

  const refreshAdminData = async (): Promise<void> => {
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return;

    try {
        const usersSnap = await get(ref(db, 'users'));
        if (!usersSnap.exists()) {
            setAdminUsers([]);
            setAdminRechargeRequests([]);
            setAdminWithdrawRequests([]);
            return;
        }

        const data = usersSnap.val();
        const allUsers: User[] = [];
        const allRecharges: Transaction[] = [];
        const allWithdraws: Transaction[] = [];

        Object.keys(data).forEach(userId => {
            const uData = data[userId];
            const tempUser: User = {
                id: userId,
                name: uData.username || 'User',
                email: uData.email,
                phoneNumber: uData.phoneNumber,
                balance: Number(uData.balance) || 0,
                spin_balance: Number(uData.spin_balance) || 0,
                inviteCode: uData.inviteCode || 'N/A',
                totalEarning: Number(uData.totalEarning) || 0,
                todayEarning: Number(uData.todayEarning) || 0,
                investments: uData.investments, 
                lastIncomeUpdate: uData.lastIncomeUpdate,
                transactions: uData.transactions || {}
            };
            
            processInvestments(tempUser);
            allUsers.push(tempUser);

            if (uData.transactions) {
                Object.values(uData.transactions).forEach((tx: any) => {
                    const cleanTx = {
                        ...tx,
                        userId: userId,
                        userName: uData.username || 'Unknown',
                        amount: Number(tx.amount)
                    };
                    if (tx.type === 'recharge') allRecharges.push(cleanTx);
                    else if (tx.type === 'withdraw') allWithdraws.push(cleanTx);
                });
            }
        });

        setAdminUsers(allUsers);
        setAdminRechargeRequests(allRecharges.sort((a,b) => b.date - a.date));
        setAdminWithdrawRequests(allWithdraws.sort((a,b) => b.date - a.date));

    } catch (e) {
        console.error("Admin Refresh Failed:", e);
    }
  };

  const login = async (email: string, pass: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (name: string, email: string, pass: string, phone: string, inviteCode?: string): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
      const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const newUserData: any = {
            username: name,
            email: email,
            phoneNumber: phone,
            inviteCode: newInviteCode, 
            last_login: Date.now(),
            balance: 0,
            spin_balance: 0,
            rewardDailyRate: 0,
            totalEarning: 0,
            todayEarning: 0,
            hasDeposited: false 
      };

      if (inviteCode) {
         try {
            const usersRef = ref(db, 'users');
            const q = query(usersRef, orderByChild('inviteCode'), equalTo(inviteCode));
            const snapshot = await get(q);

            if (snapshot.exists()) {
                const referrerId = Object.keys(snapshot.val())[0];
                newUserData.referrerId = referrerId;
            }
         } catch (e) {
             console.error("Error finding referrer", e);
         }
      }

      try {
        await set(ref(db, 'users/' + userCredential.user.uid), newUserData);
      } catch (error) {
        console.error("Error writing user data:", error);
      }
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
         const userRef = ref(db, `users/${result.user.uid}`);
         get(userRef).then((snapshot) => {
            if (!snapshot.exists()) {
                 const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                 update(ref(db, 'users/' + result.user.uid), {
                    username: result.user.displayName,
                    email: result.user.email,
                    last_login: Date.now(),
                    avatar: result.user.photoURL,
                    inviteCode: newInviteCode,
                    balance: 0,
                    spin_balance: 0,
                    hasDeposited: false
                });
            }
         });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const uploadProfilePicture = async (file: File) => {
    if (!auth.currentUser) return;
    try {
      const fileRef = storageRef(storage, `profile_images/${auth.currentUser.uid}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      await update(ref(db, `users/${auth.currentUser.uid}`), { avatar: downloadURL });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const buyProduct = async (product: Product): Promise<void> => {
    if (!user || !auth.currentUser) throw new Error("Not authenticated");
    
    if (product.price === 299 || product.price === 499) {
        const hasActivePlan = (Object.values(user.investments || {}) as Investment[]).some(
            (inv) => inv.productId === product.id && inv.status === 'active'
        );

        if (hasActivePlan) {
            throw new Error("Limit Reached: You can only have one active plan for this Starter tier. Please wait for it to complete.");
        }
    }

    if (user.balance < product.price) throw new Error("Insufficient balance. Please Recharge.");

    const newBalance = user.balance - product.price;
    const investmentId = push(ref(db, `users/${user.id}/investments`)).key;
    if (!investmentId) throw new Error("Failed to generate investment ID");

    const newInvestment: Investment = {
        id: investmentId,
        productId: product.id,
        planName: product.name,
        investedAmount: product.price,
        dailyIncome: product.dailyIncome,
        totalIncome: product.totalRevenue,
        startDate: Date.now(),
        endDate: Date.now() + (product.duration * 24 * 60 * 60 * 1000),
        status: 'active',
        lastCreditDate: Date.now() 
    };

    const updates: any = {};
    updates[`users/${user.id}/balance`] = newBalance;
    updates[`users/${user.id}/investments/${investmentId}`] = newInvestment;
    
    await update(ref(db), updates);
  };

  const requestRecharge = async (amount: number, utr: string): Promise<void> => {
    if (!user || !auth.currentUser) throw new Error("Not authenticated");

    const transactionId = push(ref(db, `users/${user.id}/transactions`)).key;
    if (!transactionId) throw new Error("Failed to generate ID");

    const transactionData: Transaction = {
        id: transactionId,
        type: 'recharge',
        amount: Number(amount),
        date: Date.now(),
        status: 'pending',
        utr: utr,
        userId: user.id,
        userName: user.name
    };

    const updates: any = {};
    updates[`users/${user.id}/transactions/${transactionId}`] = transactionData;
    await update(ref(db), updates);
  };

  const requestWithdraw = async (amount: number, details: WithdrawalDetails): Promise<void> => {
    if (!user || !auth.currentUser) throw new Error("Not authenticated");
    if (amount < 500) throw new Error("Minimum withdrawal is ₹500");
    if (user.balance < amount) throw new Error("Insufficient balance");

    const newBalance = user.balance - amount;
    const transactionId = push(ref(db, `users/${user.id}/transactions`)).key;
    if (!transactionId) throw new Error("Failed to generate ID");

    const transactionData: Transaction = {
        id: transactionId,
        type: 'withdraw',
        amount: Number(amount),
        date: Date.now(),
        status: 'pending',
        userId: user.id,
        userName: user.name,
        withdrawalDetails: details
    };

    const updates: any = {};
    updates[`users/${user.id}/balance`] = newBalance;
    updates[`users/${user.id}/transactions/${transactionId}`] = transactionData;
    await update(ref(db), updates);
  };

  const claimDailyBonus = async (): Promise<boolean> => {
      if (!user) return false;
      const today = new Date().toDateString();
      const lastClaim = user.lastDailyBonus ? new Date(user.lastDailyBonus).toDateString() : null;

      if (today === lastClaim) {
          return false; 
      }

      const updates: any = {};
      updates[`users/${user.id}/balance`] = user.balance + 1; 
      updates[`users/${user.id}/lastDailyBonus`] = Date.now();
      
      await update(ref(db), updates);
      return true;
  };

  // --- PREMIUM SPIN SYSTEM ---
  const spinWheel = async (): Promise<number> => {
      if (!user) throw new Error("Not logged in");
      if (user.spin_balance <= 0) throw new Error("No spins available");
      
      // Strict Probability Algorithm
      // 0 (Better Luck) -> 80%
      // 10 -> 12%
      // 30 -> 5%
      // 50 -> 2%
      // 100 -> 1%
      
      const rand = Math.random() * 100;
      let winningAmount = 0;
      
      if (rand < 80) winningAmount = 0;
      else if (rand < 92) winningAmount = 10;
      else if (rand < 97) winningAmount = 30;
      else if (rand < 99) winningAmount = 50;
      else winningAmount = 100;
      
      const updates: any = {};
      // Deduct Spin
      updates[`users/${user.id}/spin_balance`] = user.spin_balance - 1;

      // Logic: If user wins, DO NOT add to balance. Add to 'rewardDailyRate' and reset timer to 11 days.
      if (winningAmount > 0) {
          const currentRate = user.rewardDailyRate || 0;
          const newRate = currentRate + winningAmount;
          const duration = 11 * 24 * 60 * 60 * 1000; // 11 Days in MS

          updates[`users/${user.id}/rewardDailyRate`] = newRate;
          updates[`users/${user.id}/rewardEndDate`] = Date.now() + duration; // Stacking resets timer
      }
      
      await update(ref(db), updates);
      return winningAmount;
  };

  const claimRewardIncome = async (): Promise<string> => {
      if (!user) throw new Error("Not logged in");
      
      const dailyRate = user.rewardDailyRate || 0;
      const endDate = user.rewardEndDate || 0;
      const lastClaim = user.lastRewardClaim || 0;

      if (dailyRate <= 0) return "No active rewards.";
      if (Date.now() > endDate) return "Reward plan has expired.";
      
      // Check 24 hour cooldown
      const COOLDOWN = 24 * 60 * 60 * 1000;
      if (Date.now() - lastClaim < COOLDOWN) {
          const remaining = Math.ceil((COOLDOWN - (Date.now() - lastClaim)) / (60*60*1000));
          return `Please wait ${remaining} hours for next claim.`;
      }

      // Process Claim
      const updates: any = {};
      updates[`users/${user.id}/balance`] = user.balance + dailyRate;
      updates[`users/${user.id}/lastRewardClaim`] = Date.now();
      
      // Log Transaction
      const txId = push(ref(db, `users/${user.id}/transactions`)).key;
      if (txId) {
          updates[`users/${user.id}/transactions/${txId}`] = {
              id: txId,
              type: 'daily_reward',
              amount: dailyRate,
              date: Date.now(),
              status: 'approved',
              userId: user.id,
              utr: 'Spin Reward Claim'
          };
      }

      await update(ref(db), updates);
      return "Success";
  };

  const updateUserAddress = async (address: string): Promise<void> => {
      if (!user) return;
      await update(ref(db, `users/${user.id}`), { address: address });
  };

  const updateUpiId = async (newUpiId: string): Promise<void> => {
     if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) throw new Error("Unauthorized");
     await set(ref(db, 'app_settings/upi_id'), newUpiId);
  };

  const updateWebsiteUrl = async (url: string): Promise<void> => {
     if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) throw new Error("Unauthorized");
     await set(ref(db, 'app_settings/website_url'), url);
  };

  const updateSupportSettings = async (settings: SupportSettings): Promise<void> => {
     if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) throw new Error("Unauthorized");
     await set(ref(db, 'app_settings/support'), settings);
  };

  const approveTransaction = async (txId: string, userId: string, type: 'recharge' | 'withdraw', amount: number): Promise<void> => {
      if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) throw new Error("Unauthorized");
      const numericAmount = Number(amount);
      
      if (type === 'recharge') {
          setAdminRechargeRequests(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'approved' } : tx));
      } else {
          setAdminWithdrawRequests(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'approved' } : tx));
      }

      try {
          const updates: any = {};
          updates[`users/${userId}/transactions/${txId}/status`] = 'approved';

          if (type === 'recharge') {
             const userRef = ref(db, `users/${userId}`);
             const userSnap = await get(userRef);
             
             if (userSnap.exists()) {
                 const uData = userSnap.val();
                 const currentBal = Number(uData.balance) || 0;
                 updates[`users/${userId}/balance`] = currentBal + numericAmount;

                 // --- REFERRAL LOGIC: GIVE SPIN INSTEAD OF CASH ---
                 if (!uData.hasDeposited && uData.referrerId) {
                     const referrerRef = ref(db, `users/${uData.referrerId}`);
                     const refSnap = await get(referrerRef);

                     if (refSnap.exists()) {
                         const refData = refSnap.val();
                         const currentSpins = Number(refData.spin_balance) || 0;
                         
                         // Increment Spin Balance
                         updates[`users/${uData.referrerId}/spin_balance`] = currentSpins + 1;
                     }
                 }

                 updates[`users/${userId}/hasDeposited`] = true;
             }
          }

          await update(ref(db), updates);
      } catch (e) {
          console.error("Sync failed:", e);
      }
  };

  const rejectTransaction = async (txId: string, userId: string, type: 'recharge' | 'withdraw'): Promise<void> => {
      if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) throw new Error("Unauthorized");

      if (type === 'recharge') {
          setAdminRechargeRequests(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'rejected' } : tx));
      } else {
          setAdminWithdrawRequests(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'rejected' } : tx));
      }

      try {
          const updates: any = {};
          updates[`users/${userId}/transactions/${txId}/status`] = 'rejected';

          if (type === 'withdraw') {
            const amountRef = child(ref(db), `users/${userId}/transactions/${txId}/amount`);
            const snapshot = await get(amountRef);
            const amountToRefund = Number(snapshot.val()) || 0;
            
            const balanceRef = ref(db, `users/${userId}/balance`);
            const balanceSnap = await get(balanceRef);
            const currentBalance = Number(balanceSnap.val()) || 0;
            updates[`users/${userId}/balance`] = currentBalance + amountToRefund;
          }

          await update(ref(db), updates);
      } catch (e) {
          console.error("Sync failed:", e);
      }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading,
      language,
      setLanguage,
      upiId,
      websiteUrl,
      supportSettings,
      login, 
      register, 
      logout, 
      loginWithGoogle,
      uploadProfilePicture,
      resetPassword,
      buyProduct,
      requestRecharge,
      requestWithdraw,
      updateUpiId,
      updateWebsiteUrl,
      updateSupportSettings,
      approveTransaction,
      rejectTransaction,
      refreshAdminData,
      adminRechargeRequests,
      adminWithdrawRequests,
      adminUsers,
      claimDailyBonus,
      updateUserAddress,
      spinWheel,
      claimRewardIncome
    }}>
      {children}
    </AuthContext.Provider>
  );
};
