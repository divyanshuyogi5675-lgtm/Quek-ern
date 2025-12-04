
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ShieldCheck, CreditCard, RefreshCw, Smartphone, Check, X, Users, Search, AlertCircle, Loader2, Building2, Send, MessageCircle, Mail, Globe, BarChart3, ArrowUpRight, ArrowDownRight, Calendar, User as UserIcon, Wallet, PieChart, History, ChevronRight, TrendingUp } from 'lucide-react';
import { Transaction, User, Investment } from '../../types';

export const AdminView: React.FC = () => {
  const { upiId, websiteUrl, supportSettings, updateUpiId, updateWebsiteUrl, updateSupportSettings, adminRechargeRequests, adminWithdrawRequests, adminUsers, approveTransaction, rejectTransaction, refreshAdminData } = useAuth();
  const [activeTab, setActiveTab] = useState<'settings' | 'recharges' | 'withdraws' | 'users' | 'reports'>('reports');
  const [newUpi, setNewUpi] = useState(upiId);
  const [newUrl, setNewUrl] = useState(websiteUrl);
  const [newSupport, setNewSupport] = useState(supportSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [userSearch, setUserSearch] = useState('');
  
  // State for User Detail Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Update local state when global state changes (e.g. after fetch)
  useEffect(() => {
    setNewUpi(upiId);
    setNewUrl(websiteUrl);
    setNewSupport(supportSettings);
  }, [upiId, websiteUrl, supportSettings]);

  // Auto-refresh on mount if list is empty
  useEffect(() => {
     if (adminUsers.length === 0) {
         refreshAdminData();
     }
  }, []);

  const handleRefresh = async () => {
      if (isRefreshing) return; // Prevent double clicks
      setIsRefreshing(true);
      setMsg({ type: 'success', text: "Syncing..." });
      
      try {
        await refreshAdminData();
        const totalUsers = adminUsers.length;
        const totalDeposits = adminRechargeRequests.length;
        setMsg({ 
            type: 'success', 
            text: `Synced: ${totalUsers} Users, ${totalDeposits} Deposits.` 
        });
      } catch (e) {
        setMsg({ type: 'error', text: "Sync completed with warnings." });
      } finally {
        setTimeout(() => {
             setIsRefreshing(false);
             setTimeout(() => setMsg(null), 2000);
        }, 500); 
      }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);
    try {
        if (newUpi !== upiId) await updateUpiId(newUpi);
        if (newUrl !== websiteUrl) await updateWebsiteUrl(newUrl);
        if (JSON.stringify(newSupport) !== JSON.stringify(supportSettings)) {
            await updateSupportSettings(newSupport);
        }
        setMsg({ type: 'success', text: "Settings Updated!" });
    } catch (error) {
        setMsg({ type: 'error', text: "Update failed." });
    } finally {
        setIsLoading(false);
    }
  };

  const handleAction = async (tx: Transaction, action: 'approve' | 'reject') => {
      try {
          if (action === 'approve') {
              approveTransaction(tx.id, tx.userId!, tx.type, tx.amount); 
          } else {
              rejectTransaction(tx.id, tx.userId!, tx.type); 
          }
      } catch (e) {
          console.error(e);
      }
  };

  // --- REPORT GENERATION LOGIC ---
  const getDailyReports = () => {
      const reportMap = new Map<string, { recharge: number, withdraw: number, dateObj: number }>();

      // 1. Process Recharges
      adminRechargeRequests.forEach(tx => {
          if (tx.status !== 'approved') return;
          const date = new Date(tx.date);
          const dateKey = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          
          if (!reportMap.has(dateKey)) {
              reportMap.set(dateKey, { recharge: 0, withdraw: 0, dateObj: tx.date });
          }
          reportMap.get(dateKey)!.recharge += tx.amount;
      });

      // 2. Process Withdraws
      adminWithdrawRequests.forEach(tx => {
          if (tx.status !== 'approved') return;
          const date = new Date(tx.date);
          const dateKey = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          
          if (!reportMap.has(dateKey)) {
              reportMap.set(dateKey, { recharge: 0, withdraw: 0, dateObj: tx.date });
          }
          reportMap.get(dateKey)!.withdraw += tx.amount;
      });

      // 3. Convert to Array and Sort by Date (Newest First)
      return Array.from(reportMap.entries())
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => b.dateObj - a.dateObj);
  };

  const dailyReports = getDailyReports();

  const filteredUsers = adminUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.phoneNumber && u.phoneNumber.includes(userSearch))
  );

  const renderTransactionCard = (tx: Transaction) => (
      <div key={tx.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
          <div className="flex justify-between items-start mb-3">
              <div>
                  <h4 className="font-bold text-gray-900 text-lg">{tx.userName || 'Unknown User'}</h4>
                  <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">ID: {tx.userId?.slice(-6)}</p>
              </div>
              <div className="text-right">
                  <p className="text-xl font-bold text-emerald-600">₹{tx.amount}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{new Date(tx.date).toLocaleString()}</p>
              </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
             {tx.type === 'recharge' ? (
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-800 font-bold uppercase">UTR Reference No:</span>
                    <span className="font-mono text-sm font-bold text-blue-900">{tx.utr || 'N/A'}</span>
                 </div>
             ) : (
                 <div className="space-y-2">
                     <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase border-b border-blue-200 pb-1">
                        <Building2 className="w-3 h-3" /> Withdrawal Details
                     </div>
                     <div className="text-sm space-y-1">
                         <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-semibold text-gray-900">{tx.withdrawalDetails?.fullName || 'N/A'}</span></div>
                         <div className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-semibold text-gray-900">{tx.withdrawalDetails?.phoneNumber || 'N/A'}</span></div>
                         <div className="flex justify-between"><span className="text-gray-500">Method:</span> <span className="font-bold text-blue-700 uppercase">{tx.withdrawalDetails?.method || 'N/A'}</span></div>
                         <div className="bg-white p-2 rounded border border-blue-100 font-mono text-xs break-all">
                             {tx.withdrawalDetails?.paymentAddress || 'N/A'}
                         </div>
                     </div>
                 </div>
             )}
          </div>

          <div className="flex gap-3">
             {tx.status === 'pending' ? (
                 <>
                    <button onClick={() => handleAction(tx, 'approve')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"><Check className="w-5 h-5" /> APPROVE</button>
                    <button onClick={() => handleAction(tx, 'reject')} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"><X className="w-5 h-5" /> REJECT</button>
                 </>
             ) : (
                 <div className={`w-full text-center py-3 rounded-lg text-sm font-bold uppercase ${tx.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                     {tx.status === 'approved' ? <span className="flex items-center justify-center gap-2"><Check className="w-5 h-5"/> APPROVED</span> : <span className="flex items-center justify-center gap-2"><X className="w-5 h-5"/> REJECTED</span>}
                 </div>
             )}
          </div>
      </div>
  );

  return (
    <div className="pb-24 relative">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white mb-6 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="relative z-10 flex justify-between items-start">
             <div>
                <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                </div>
                <p className="text-slate-400 text-sm">Fast Local Mode Active</p>
             </div>
             <button onClick={handleRefresh} className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors border border-slate-700" title="Refresh Data" disabled={isRefreshing}>
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
             </button>
         </div>
      </div>
      
      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in-up ${msg.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
             <span className="w-2 h-2 rounded-full bg-current"></span> {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <button onClick={() => setActiveTab('reports')} className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><BarChart3 className="w-4 h-4" /> Reports</button>
          <button onClick={() => setActiveTab('users')} className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><Users className="w-4 h-4" /> Users</button>
          <button onClick={() => setActiveTab('recharges')} className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'recharges' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Deposits {adminRechargeRequests.filter(r => r.status === 'pending').length > 0 && <span className="bg-white text-emerald-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">{adminRechargeRequests.filter(r => r.status === 'pending').length}</span>}</button>
          <button onClick={() => setActiveTab('withdraws')} className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'withdraws' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Withdraws {adminWithdrawRequests.filter(r => r.status === 'pending').length > 0 && <span className="bg-white text-amber-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">{adminWithdrawRequests.filter(r => r.status === 'pending').length}</span>}</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'settings' ? 'bg-slate-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Settings</button>
      </div>

      {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
             <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold border-b pb-4"><CreditCard className="w-5 h-5 text-purple-600" /><h2>Global App Settings</h2></div>
             <form onSubmit={handleUpdateSettings} className="space-y-6">
                
                {/* SYSTEM CONFIGURATION */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                    <h4 className="text-sm text-blue-800 font-bold mb-3 flex items-center gap-2"><Globe className="w-4 h-4"/> System Configuration</h4>
                    <Input 
                        label="Live Website Domain (Base URL)" 
                        placeholder="https://flipkart-invest.com"
                        value={newUrl} 
                        onChange={(e) => setNewUrl(e.target.value)} 
                        icon={<Globe className="w-4 h-4" />}
                    />
                    <p className="text-[10px] text-blue-600 mt-2">This URL will be used for all Invite Links generated by users.</p>
                </div>

                {/* UPI SETTING */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Current Active UPI</p>
                    <div className="flex items-center gap-2 font-mono text-sm text-gray-800 break-all"><Smartphone className="w-4 h-4 text-gray-400 flex-shrink-0" />{upiId}</div>
                </div>
                <Input label="Update UPI ID" value={newUpi} onChange={(e) => setNewUpi(e.target.value)} icon={<RefreshCw className="w-4 h-4" />}/>
                
                {/* SUPPORT SETTINGS */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-emerald-600"/> Support Configuration</h3>
                    
                    <div className="space-y-4">
                        <Input 
                            label="WhatsApp Number" 
                            placeholder="+919999999999"
                            value={newSupport.whatsapp} 
                            onChange={(e) => setNewSupport({...newSupport, whatsapp: e.target.value})} 
                            icon={<MessageCircle className="w-4 h-4" />}
                        />
                        <Input 
                            label="Telegram Link" 
                            placeholder="https://t.me/your_channel"
                            value={newSupport.telegram} 
                            onChange={(e) => setNewSupport({...newSupport, telegram: e.target.value})} 
                            icon={<Send className="w-4 h-4" />}
                        />
                        <Input 
                            label="Support Email" 
                            placeholder="support@domain.com"
                            value={newSupport.email} 
                            onChange={(e) => setNewSupport({...newSupport, email: e.target.value})} 
                            icon={<Mail className="w-4 h-4" />}
                        />
                    </div>
                </div>

                <Button variant="purple" fullWidth isLoading={isLoading}>Save All Changes</Button>
             </form>
          </div>
      )}

      {activeTab === 'users' && (
          <div className="space-y-4 animate-fade-in-up">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" placeholder="Search users by name, phone or email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"/>
              </div>
              <h3 className="font-bold text-gray-700 px-2 flex justify-between items-center">Registered Users <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{filteredUsers.length}</span></h3>
              {filteredUsers.length === 0 && <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-gray-400" /></div><h3 className="text-gray-900 font-bold mb-1">No Users Found</h3><button onClick={handleRefresh} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">Refresh List</button></div>}
              <div className="grid gap-3">
                  {filteredUsers.map(u => (
                      <div key={u.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                              <div><h4 className="font-bold text-gray-900">{u.name}</h4><p className="text-xs text-gray-500">{u.email || u.phoneNumber}</p></div>
                              <div className="text-right"><p className="text-sm font-bold text-emerald-600">₹{u.balance}</p><span className="text-[10px] text-gray-400">Bal</span></div>
                          </div>
                          <div className="flex gap-2 text-xs mt-2 pt-2 border-t border-gray-50 justify-between items-center">
                              <div>
                                <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 mr-2">Code: {u.inviteCode || 'N/A'}</span>
                              </div>
                              <button onClick={() => setSelectedUser(u)} className="text-indigo-600 font-bold flex items-center gap-1 hover:underline">
                                  View Full Profile <ChevronRight className="w-3 h-3"/>
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'recharges' && (
          <div className="space-y-2 animate-fade-in-up">
              <h3 className="font-bold text-gray-700 mb-4 px-2">Pending Deposits</h3>
              {adminRechargeRequests.length === 0 && <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm"><div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-emerald-300" /></div><h3 className="text-gray-900 font-bold mb-1">No Pending Deposits</h3><button onClick={handleRefresh} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">Check Again</button></div>}
              {adminRechargeRequests.map(renderTransactionCard)}
          </div>
      )}

      {activeTab === 'withdraws' && (
          <div className="space-y-2 animate-fade-in-up">
              <h3 className="font-bold text-gray-700 mb-4 px-2">Pending Withdrawals</h3>
              {adminWithdrawRequests.length === 0 && <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm"><div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-amber-300" /></div><h3 className="text-gray-900 font-bold mb-1">No Pending Withdrawals</h3><button onClick={handleRefresh} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">Check Again</button></div>}
              {adminWithdrawRequests.map(renderTransactionCard)}
          </div>
      )}
      
      {/* --- DAILY REPORT VIEW --- */}
      {activeTab === 'reports' && (
          <div className="space-y-4 animate-fade-in-up">
              <h3 className="font-bold text-gray-700 px-2 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" /> 
                  Daily Financial Summary
              </h3>
              
              {dailyReports.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BarChart3 className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-gray-900 font-bold mb-1">No Data Available</h3>
                      <p className="text-sm text-gray-500">Approve transactions to see daily reports here.</p>
                      <button onClick={handleRefresh} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">Refresh Data</button>
                  </div>
              )}

              {dailyReports.map((day, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                      {/* Date Header */}
                      <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <h4 className="font-bold text-gray-700">{day.date}</h4>
                      </div>

                      {/* Content Grid */}
                      <div className="p-5">
                          <div className="grid grid-cols-2 gap-4">
                              {/* Total Recharge */}
                              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 relative group">
                                  <div className="absolute top-3 right-3 bg-white p-1 rounded-full shadow-sm text-emerald-600">
                                      <ArrowUpRight className="w-4 h-4" />
                                  </div>
                                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Deposit</p>
                                  <p className="text-2xl font-extrabold text-emerald-700">₹{day.recharge.toLocaleString('en-IN')}</p>
                              </div>

                              {/* Total Withdrawal */}
                              <div className="bg-red-50 rounded-xl p-4 border border-red-100 relative">
                                  <div className="absolute top-3 right-3 bg-white p-1 rounded-full shadow-sm text-red-600">
                                      <ArrowDownRight className="w-4 h-4" />
                                  </div>
                                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Total Payout</p>
                                  <p className="text-2xl font-extrabold text-red-700">₹{day.withdraw.toLocaleString('en-IN')}</p>
                              </div>
                          </div>
                          
                          {/* Net Calc (Optional Extra) */}
                          <div className="mt-4 flex justify-between items-center text-xs font-medium text-gray-400 border-t border-gray-50 pt-3">
                              <span>Net Cash Flow:</span>
                              <span className={`font-bold text-sm ${day.recharge - day.withdraw >= 0 ? 'text-gray-700' : 'text-red-500'}`}>
                                  {day.recharge - day.withdraw >= 0 ? '+' : ''}₹{(day.recharge - day.withdraw).toLocaleString('en-IN')}
                              </span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* --- SELECTED USER DETAIL MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="bg-slate-900 p-5 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">{selectedUser.name}</h3>
                            <p className="text-xs text-slate-400 font-mono">ID: {selectedUser.id}</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="p-6 overflow-y-auto space-y-6 bg-gray-50">
                    
                    {/* 1. Wallet & Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Wallet Balance</p>
                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-emerald-500" />
                                <span className="text-xl font-extrabold text-gray-900">₹{selectedUser.balance}</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Invite Code</p>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-500" />
                                <span className="text-lg font-bold text-gray-900 font-mono">{selectedUser.inviteCode}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Email:</span>
                            <span className="font-medium">{selectedUser.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Phone:</span>
                            <span className="font-medium">{selectedUser.phoneNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Address:</span>
                            <span className="font-medium truncate max-w-[200px]">{selectedUser.address || 'N/A'}</span>
                        </div>
                    </div>

                    {/* 2. Investment Overview */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <PieChart className="w-4 h-4 text-blue-600" /> Investment Summary
                        </h4>
                        
                        {(() => {
                            const investments = Object.values(selectedUser.investments || {}) as Investment[];
                            const activeCount = investments.filter(i => i.status === 'active').length;
                            const completedCount = investments.filter(i => i.status === 'completed').length;
                            const cancelledCount = investments.filter(i => i.status === 'cancelled').length;
                            const totalInvested = investments.reduce((sum, i) => sum + i.investedAmount, 0);
                            const totalWithdrawn = (Object.values(selectedUser.transactions || {}) as Transaction[])
                                .filter(t => t.type === 'withdraw' && t.status === 'approved')
                                .reduce((sum, t) => sum + Number(t.amount), 0);

                            return (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                                            <p className="text-xs text-blue-800 font-bold">Total Invested</p>
                                            <p className="text-lg font-black text-blue-900">₹{totalInvested}</p>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-center">
                                            <p className="text-xs text-purple-800 font-bold">Total Withdrawn</p>
                                            <p className="text-lg font-black text-purple-900">₹{totalWithdrawn}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Plan Status</span>
                                            <span className="text-xs font-bold text-gray-500 uppercase">Count</span>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active</div>
                                                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{activeCount}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Completed</div>
                                                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{completedCount}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Cancelled</div>
                                                <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{cancelledCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* 3. Recent Transactions Preview (Last 5) */}
                    <div>
                         <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <History className="w-4 h-4 text-orange-600" /> Recent Transactions
                        </h4>
                        <div className="space-y-2">
                            {(Object.values(selectedUser.transactions || {}) as Transaction[])
                                .sort((a,b) => b.date - a.date)
                                .slice(0, 5)
                                .map((tx) => (
                                    <div key={tx.id} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-bold text-gray-800 capitalize">{tx.type}</p>
                                            <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${tx.type === 'recharge' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.type === 'recharge' ? '+' : '-'}₹{tx.amount}
                                            </p>
                                            <p className={`text-[10px] uppercase font-bold ${tx.status === 'approved' ? 'text-green-500' : tx.status === 'pending' ? 'text-orange-500' : 'text-red-500'}`}>
                                                {tx.status}
                                            </p>
                                        </div>
                                    </div>
                            ))}
                            {(!selectedUser.transactions || Object.keys(selectedUser.transactions).length === 0) && (
                                <p className="text-center text-gray-400 text-sm py-4">No transactions found.</p>
                            )}
                        </div>
                    </div>

                </div>
                
                {/* Footer */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <Button onClick={() => setSelectedUser(null)} fullWidth variant="outline">Close Profile</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
