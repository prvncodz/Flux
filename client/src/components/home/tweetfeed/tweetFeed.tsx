import { useState, useEffect, useRef } from "react";
import axios from "../../../api/axios";
import TweetComponent from "./tweet";
import { LoaderCircle } from "lucide-react";
import SignInBanner from "../../signinInstructPopup";
import useUserStore from "../../../stores/user.store";
import { Comment as Tweet } from "../../../types/comment.types";

export default function Feed({ fetchType, userId, searchQuery, className }: { fetchType?: string; userId?: string; searchQuery?: string; className?: string }) {
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [areTweetsFetched, SetAreTweetsFetched] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const user = useUserStore(s => s.user);
    const isUserLogged = useUserStore(s => s.isUserLogged);
    const [hasNoMore, setHasNoMore] = useState<boolean>(false);
    const [showSigninPopup, setShowSigninPopup] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
        setTweets([]);
        setPage(1);
        setHasNoMore(false);
        setLoading(false);
    }, [searchQuery]);

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
        
        async function fetchTweets() {
            let endpoint = "/tweets/get-all-tweets";
            let params = `?page=${page}${isUserLogged ? `&userId=${user?._id}` : ``}`;
            
            if (fetchType === "user" && userId) {
                endpoint = `/tweets/${userId}`;
                params = page > 1 ? `?page=${page}` : "";
            } else if (fetchType === "search" && searchQuery) {
                params = `?query=${searchQuery}${page > 1 ? `&page=${page}` : ``}${isUserLogged ? `&userId=${user?._id}` : ``}`;
            }

            try {
                const res = await axios.get(`${endpoint}${params}`, { signal });
                if (res.data.data.length == 0) {
                    setHasNoMore(true);
                } else {
                    if (fetchType === "search" && page === 1) {
                        setTweets(res.data.data);
                    } else {
                        setTweets((prev) => [...prev, ...res.data.data]);
                    }
                    SetAreTweetsFetched(true);
                }
            } catch (error: any) {
                if (error.name !== 'CanceledError') {
                    console.log(error);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchTweets();

        return () => {
            controller.abort();
        };
    }, [user?._id, isUserLogged, fetchType, searchQuery, page]);

    if (tweets.length == 0 && areTweetsFetched) {
        return (
            <div className="flex h-100 w-full justify-center items-center text-base font-medium ">
                No Posts available for this request
            </div>
        );
    }
    return (
        <div
            className={`scroll-smooth ${fetchType === "user" ? "md:flex md:justify-center" : "md:flex md:justify-center md:mt-4 md:flex-col"} overflow-y-auto ${className || ""}`}
        >
            {showSigninPopup && <SignInBanner setShowPopup={setShowSigninPopup} />}
            <div
                className={`scroll-smooth ${fetchType === "user" ? " h-[65vh] md:h-[60vh] lg:max-w-[70vw] " : "h-[95vh] md:w-[65vh] "} relative w-full overflow-y-auto pb-5 overflow-x-hidden flex flex-col md:block `}
                ref={ref}
            >
                {areTweetsFetched &&
                    tweets.map((tweet, idx) => (
                        <TweetComponent
                            key={tweet?._id}
                            tweet={tweet}
                            idx={idx}
                            tweetsLength={tweets.length}
                            setLoading={setLoading}
                            setShowSigninPopup={setShowSigninPopup}
                        />
                    ))}
                {loading && (
                    <div className="h-15 w-full  inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                        <LoaderCircle
                            className="w-12 h-12 animate-spin"
                            style={{ color: "#0A98FC" }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
