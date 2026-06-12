import { useState, useEffect, useRef } from "react";
import axios from "../../../api/axios";
import PlaylistComponent from "./playlistComponent";
import UserPlaylistContext from "../../../contexts/userPlaylistContext"
import { Playlist } from "../../../types/playlist.types";

export default function PlaylistFeed({ userId }: { userId: string }) {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [arePlaylistsFetched, SetArePlaylistsFetched] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [hasNoMore, setHasNoMore] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        function handleScroll() {
            if (loading || hasNoMore || !el) return;
            if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
                setPage((prev) => prev + 1);
            }
        }
        el?.addEventListener("scroll", handleScroll);
        return () => el?.removeEventListener("scroll", handleScroll);
    }, [loading, hasNoMore]);

    useEffect(() => {
        if (loading) return;
        setLoading(true);

        const controller = new AbortController();
        const signal = controller.signal;
        async function fetchAllPlaylists(Id: string) {
            if (!Id) return;
            try {
                const res = await axios.get(`/playlists/user/${Id}?page=${page}`, { signal });
                if (res.data.data.length == 0) {
                    setHasNoMore(true);
                } else {
                    setPlaylists((prev) => [...prev, ...res.data?.data]);
                    SetArePlaylistsFetched(true);
                }
            } catch (error: any) {
                if (error.name !== 'CanceledError') {
                    console.log(error);
                }
            } finally {
                setLoading(false);
            }
        }
        fetchAllPlaylists(userId);

        return () => {
            controller.abort();
        };
    }, [userId, page]);

    if ((arePlaylistsFetched && playlists.length === 0)) {
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
