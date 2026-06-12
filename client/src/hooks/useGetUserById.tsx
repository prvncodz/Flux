import { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";
import { AxiosError } from "axios";
import { Video } from "../types";

const useGetUserById = (userId: string | undefined) => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [coverimgUrl, setCoverimageUrl] = useState<string | null>(null);
    const [fullname, setFullname] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [watchHistory, setWatchHistory] = useState<(string | Video)[]>([]);

    const fetchUserById = useCallback(
        async (id: string) => {
            try {
                const res = await axios.get(`user/c/${id}`);
                if (res.status === 200) {
                    setAvatarUrl(res.data.data?.avatar?.url);
                    setCoverimageUrl(res.data.data?.coverImage?.url);
                    setFullname(res.data.data?.fullName);
                    setUsername(res.data.data?.userName);
                    setEmail(res.data.data?.email);
                    setWatchHistory(res.data.data?.watchHistory);
                }
            } catch (error: unknown) {
                if(error instanceof AxiosError) {
                    console.error("backend message :", error?.response?.data?.message);
                }
            }
        },
        [],
    );

    useEffect(() => {
        if (userId) {
            fetchUserById(userId);
        }
    }, [userId, fetchUserById]);

    return { avatarUrl, coverimgUrl, fullname, username, email, watchHistory };
};
export { useGetUserById };
