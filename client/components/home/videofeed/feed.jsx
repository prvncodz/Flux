import { useState, useEffect, useContext, useRef } from "react";
import axios from "../../../api/axios.js";
import VideoComponent from "./VideoComponent.jsx";
import useUserStore from "../../../stores/user.store.js";

export default function Feed({
    fetchType,
    userId,
    searchQuery,
    recommendations,
    playingVideoId,
}) {
    const [videos, setVideos] = useState(null);
    const [areVideosFetched, SetAreVideosFetched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const user = useUserStore(s => s.user);
    const isUserLogged = useUserStore(s => s.isUserLogged);
    const [hasNoMore, setHasNoMore] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        setVideos([]);
        setPage(1);
        setHasNoMore(false);
        setLoading(false);
    }, [searchQuery]);

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

        async function fetchAllVideos() {
            try {
                await axios
                    .get(
                        `/videos/all-videos?limit=12&page=${page}${isUserLogged ? `&userId=${user?._id}` : ``}`,
                        { signal },
                    )
                    .then((res) => {
                        setVideos((prev) => [...prev, ...res.data?.data]);
                        SetAreVideosFetched(true);
                        if (res.data.data.length == 0) {
                            setHasNoMore(true);
                            setLoading(false);
                        }
                    });
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }

        }
        async function fetchSearchedVideos(query) {
            if (!query) return;
            try {
                await axios
                    .get(
                        `/videos/all-videos${isUserLogged ? `?userId=${user?._id}&` : `?`}query=${query}&page=${page}`,
                        { signal },
                    )
                    .then((res) => {
                        if (res.data.data.length == 0) {
                            setHasNoMore(true);
                            setLoading(false);
                        }
                        if (page > 1) {
                            setVideos((prev) => [...prev, ...res.data?.data]);
                        } else {
                            setVideos(res.data?.data);
                        }
                        SetAreVideosFetched(true);
                    });
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        async function fetchVideosByUser(Id) {
            if (!Id) return;
            try {
                await axios
                    .get(`/videos/all-videos-by-user?userId=${Id}&page=${page}`, {
                        signal,
                    })
                    .then((res) => {
                        if (res.data?.data?.length == 0) {
                            setHasNoMore(true);
                            setLoading(false);
                        }
                        setVideos((prev) => [...prev, ...res.data?.data]);
                        SetAreVideosFetched(true);
                    });
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }

        }

        if (fetchType === "user") {
            fetchVideosByUser(userId);
        } else if (fetchType === "search") {
            fetchSearchedVideos(searchQuery);
        } else {
            fetchAllVideos();
        }
        return () => {
            controller.abort();
        };
    }, [fetchType, searchQuery, page]);

    if (areVideosFetched && videos && videos.length > 0) return (
        <div className="flex h-100 w-full justify-center items-center text-base font-medium ">
            No Videos available for this request
        </div>
    );

    return (
        <div
            className={`scroll-smooth  relative gap-6 w-full overflow-y-auto overflow-x-hidden grid gird-cols-1 mb-5 md:grid-cols-2  md:gap-3 ${fetchType === "user" ? "h-[64vh] md:p-5  lg:pb-35 lg:grid-cols-3 xl:grid-cols-4" : recommendations ? "overflow-visible pb-15 md:pb-20 md:p-3 lg:max-w-[20vw] lg:grid-cols-1 xl:grid-cols-1  lg:w-full box-border" : "h-[90vh] md:pl-16 md:pr-5 lg:pl-18 lg:h-screen lg:pb-20 lg:pr-4 lg:grid-cols-3 xl:grid-cols-4 "}  md:py-4  `}
            ref={ref}
        >
            {areVideosFetched &&
                videos?.filter((v) => v._id !== playingVideoId).map((video, idx) =>

                    <VideoComponent
                        key={idx}
                        video={video}
                        idx={idx}
                        videosLength={videos.length}
                        setLoading={setLoading}
                    />

                )}
        </div>
    );
}
