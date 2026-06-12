import { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";

const useGetUserById = (userId) => {
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [coverimgUrl, setCoverimageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fullname, setFullname] = useState(null);
    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [watchHistory, setWatchHistory] = useState([]);

    if (!userId) {
        return;
    }

    const fetchUserById = useCallback(
        async (userId) => {
            try {
                setLoading(true);
                const res = await axios.get(`user/c/${userId}`);
                if (res.status === 200) {
                    setAvatarUrl(res.data.data?.avatar?.url);
                    setLoading(false);
                    setCoverimageUrl(res.data.data?.coverImage?.url);
                    setFullname(res.data.data?.fullName);
                    setUsername(res.data.data?.userName);
                    setEmail(res.data.data?.email);
                    setWatchHistory(res.data.data?.watchHistory);
                }
            } catch (error) {
                console.log(error);
                console.log("backend message :", error?.response?.data?.message);
                setLoading(false);
            }
        },
        [userId],
    );

    useEffect(() => {
        try {
            fetchUserById(userId);
        } catch (error) {
            console.log(error);
        }
    }, [fetchUserById]);

    return { avatarUrl, coverimgUrl, fullname, username, email, watchHistory };
};
export { useGetUserById };
