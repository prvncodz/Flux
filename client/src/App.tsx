import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../components/home/home.jsx";
const SignUp = React.lazy(() => import("../components/signup.jsx"));
const SignIn = React.lazy(() => import("../components/signin.jsx"));
import Profile from "../components/userProfile/profile.jsx";
import axios from "../api/axios.js";
import WatchVideoPage from "../components/watch/watchVideoPage.jsx";
import WatchPostPage from "../components/watch/watchPostPage.jsx";
import Dashboard from "../components/dashboard/dashboard.jsx";
import LikedVideos from "../components/likedVideosPage/likedVideos.jsx";
import HistoryPage from "../components/historyPage/historyPage.jsx";
import WatchPlaylist from "../components/playlist/watchPlaylist.jsx";
import SearchVideoPage from "../components/search/searchVideoPage.jsx";
import SearchPostPage from "../components/search/searchPostPage.jsx";
import useUserStore from "../stores/user.store.js";

function App() {
    const [isTokenReceived, setIsTokenReceived] = useState(false);
    const setUser = useUserStore(s => s.setUser);
    const setIsUserLogged = useUserStore(s => s.setIsUserLogged);

    useEffect(() => {
        async function loginUser() {
            try {
                const response = await axios.get("/user/current-user");
                if (response.status === 200) {
                    setUser(response.data.data);
                    setIsUserLogged(true);
                }
            } catch (error) {
                setUser({});
                setIsUserLogged(false);
                try {
                    if (error.status === 500) {
                        const res = await axios.post("/user/refresh-tokens");
                        if (res.status == 200) {
                            setIsTokenReceived(true);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
        loginUser();
    }, [isTokenReceived]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/userchannel/:username" element={<Profile />} />
                <Route path="/watch/video/:videoId" element={<WatchVideoPage />} />
                <Route path="/watch/post/:postId" element={<WatchPostPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/liked-videos" element={<LikedVideos />} />
                <Route path="/watch-history" element={<HistoryPage />} />
                <Route path="/watch/playlist/:playlistId" element={<WatchPlaylist />} />
                <Route path="/search/videos" element={<SearchVideoPage />} />
                <Route path="/search/posts" element={<SearchPostPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
