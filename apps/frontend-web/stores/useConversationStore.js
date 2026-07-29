import { create } from 'zustand'

const useConversationStore = create((set) => ({
  conversationId: null,
  customerId: null,
  messages: [],
  setConversation: (id) => set({ conversationId: id }),
  setCustomer: (id) => set({ customerId: id }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  reset: () => set({ conversationId: null, customerId: null, messages: [] })
}))

export default useConversationStore
