import { refreshTokens } from "@/hooks/useUser";
import useUserStore from "@/stores/user.store";
import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
    withCredentials: true,
    baseURL: "/api/v1",
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error?.response?.status : null;
        const message = error.response ? error?.response?.data?.message : null;
        const originalRequest = error.config;

        if (status === 401 && useUserStore.getState().isUserLogged) {
            return refreshTokens(originalRequest)
        } else if (status === 400 && useUserStore.getState().isUserLogged) {
            toast.error(message || "Invalid input credentials")
        } else {
            toast.error(message || "Something went wrong")
        }

        return Promise.reject(error)
    }
);

export default api;
