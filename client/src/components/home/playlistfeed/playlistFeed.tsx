import { useState, useEffect, useContext, useRef } from "react";
import axios from "../../../api/axios.js";
import PlaylistComponent from "./playlistComponent.jsx";
import { Loader2 } from "lucide-react";
import UserPlaylistContext from "../../../contexts/userPlaylistContext.jsx"

export default function PlaylistFeed({ userId }) {
    const [playlists, setPlaylists] = useState([]);
    const [arePlaylistsFetched, SetArePlaylistsFetched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasNoMore, setHasNoMore] = useState(false);
    const ref = useRef(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const el = ref.current;
        function handleScroll() {
            if (loading || hasNoMore) return;
            if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
                setPage((prev) => prev + 1);
            }
        }
        el?.addEventListener("scroll", handleScroll);
        return () => el?.removeEventListener("scroll", handleScroll);
    });

    useEffect(() => {
        if (loading) return;
        setLoading(true);

        const controller = new AbortController();
        const signal = controller.signal;
        async function fetchAllPlaylists(Id) {
            if (!Id) return;
            try {
                await axios
                    .get(`/playlists/user/${Id}?page=${page}`, { signal })
                    .then((res) => {
                        if (res.data.data.length == 0) {
                            setHasNoMore(true);
                            setLoading(false);
                        }
                        setPlaylists((prev) => [...prev, ...res.data?.data]);
                        SetArePlaylistsFetched(true);
                    });
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllPlaylists(userId);

        return () => {
            controller.abort();
        };
    }, [userId, page]);

    if ((arePlaylistsFetched && playlists.length === 0) || error) {
        return (
            <div className="flex h-100 w-full justify-center items-center text-base font-medium ">
                No Playlist has been published by this user
            </div>
        );
    }

    return (
        <div className={` md:flex md:justify-center scroll-smooth`}>
            <div
                className={`h-[65vh] md:h-[60vh] w-full p-5 gap-6   overflow-y-auto overflow-x-hidden grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  mb-2`}
            >
                <UserPlaylistContext.Provider value={{ owner: userId }}>
                    {arePlaylistsFetched &&
                        playlists.map((playlist, idx) => (
                            <PlaylistComponent
                                key={idx}
                                playlist={playlist}
                                idx={idx}
                                playlistsLength={playlists.length}
                                setLoading={setLoading}
                            />
                        ))}
                </UserPlaylistContext.Provider>
            </div>
        </div>
    );
}
