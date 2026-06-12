import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/home/home";
const SignUp = React.lazy(() => import("./components/signup"));
const SignIn = React.lazy(() => import("./components/signin"));
import Profile from "./components/userProfile/profile";
import WatchVideoPage from "./components/watch/watchVideoPage";
import WatchPostPage from "./components/watch/watchPostPage";
import Dashboard from "./components/dashboard/dashboard";
import LikedVideos from "./components/likedVideosPage/likedVideos";
import HistoryPage from "./components/historyPage/historyPage";
import WatchPlaylist from "./components/playlist/watchPlaylist";
import SearchVideoPage from "./components/search/searchVideoPage";
import SearchPostPage from "./components/search/searchPostPage";
import useUserStore from "./stores/user.store";
import { useGetUser } from "./hooks/useUser";
import { Toaster } from "@/components/ui/sonner"

function App() {
    const isUserLogged = useUserStore((s: any) => s.isUserLogged);

    useEffect(() => {
        if (isUserLogged) {
            useGetUser();
        }
    }, [isUserLogged]);

    return (
    <>
            <Toaster />
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
    </>
    );
}

export default App;
