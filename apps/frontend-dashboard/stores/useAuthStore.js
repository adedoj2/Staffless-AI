import create from 'zustand'

const useAuthStore = create((set) => ({
  token: null,
  setToken: (t) => set({ token: t }),
  clear: () => set({ token: null })
}))

export default useAuthStore
