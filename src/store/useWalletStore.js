import { create } from 'zustand'

const useWalletStore = create((set) => ({
  balance: 0,
  pendingBalance: 0,
  totalEarned: 0,
  transactions: [],
  
  setWalletData: (data) => {
    set({
      balance: data.balance || 0,
      pendingBalance: data.pendingBalance || 0,
      totalEarned: data.totalEarned || 0,
      transactions: data.transactions || [],
    })
  },
  
  addTransaction: (transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions],
      balance: transaction.type === 'incoming' 
        ? state.balance + transaction.amount 
        : state.balance - transaction.amount,
    }))
  },
}))

export { useWalletStore }

