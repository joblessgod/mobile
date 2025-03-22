import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,


    register: async (username, email, password) => {
        set({ isLoading: true })
        try {
            // hit api
            const response = await fetch("https://react-native-bookies-backend.onrender.com/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email, password })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.message) || "Something went wrong"

            //get token and store in async storage
            await AsyncStorage.setItem("user", JSON.stringify(data.newUser))
            await AsyncStorage.setItem("token", data.token)

            set({ user: data.user, token: data.token, isLoading: false })

            return { success: true }

        } catch (error) {
            set({ isLoading: false })
            return { success: false, error: error.message }
        }
    },

    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem("token")
            const userJSON = await AsyncStorage.getItem("user")
            const user = JSON.parse(userJSON)

            if (token && user) {
                set({ token, user })
            }

        } catch (error) {
            console.log("Error while checking auth", error)
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem("user")
        await AsyncStorage.removeItem("token")
        set({ user: null, token: null })
    },
    login: async (email, password) => {

        set({ isLoading: true })
        try {
            // hit api
            const response = await fetch("https://react-native-bookies-backend.onrender.com/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.message) || "Something went wrong"

            //get token and store in async storage
            await AsyncStorage.setItem("user", JSON.stringify(data.newUser))
            await AsyncStorage.setItem("token", data.token)

            set({ user: data.newUser, token: data.token, isLoading: false })

            return { success: true }

        } catch (error) {
            set({ isLoading: false })
            return { success: false, error: error.message }
        }
    }
}))