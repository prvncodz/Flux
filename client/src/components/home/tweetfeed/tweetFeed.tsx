import { useState, useEffect, useContext, useRef } from "react";
import axios from "../../../api/axios.js";
import TweetComponent from "./tweet.jsx";
import { LoaderCircle } from "lucide-react";
import SignInBanner from "../../signinInstructPopup.jsx";
import useUserStore from "../../../stores/user.store.js";

export default function Feed({ fetchType, userId, searchQuery }) {
    const [tweets, setTweets] = useState([]);
    const [areTweetsFetched, SetAreTweetsFetched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const user = useUserStore(s => s.user);
    const isUserLogged = useUserStore(s => s.isUserLogged);
    const [hasNoMore, setHasNoMore] = useState(false);
    const [showSigninPopup, setShowSigninPopup] = useState(false);
    const ref = useRef(null);


    useEffect(() => {
        setTweets([]);
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
        async function fetchAllTweets() {
            try {
                await axios
                    .get(
                        `/tweets/get-all-tweets?${page > 1 ? `page=${page}` : ``}${isUserLogged ? `&userId=${user?._id}` : ``}`,
                        { signal },
                    )
                    .then((res) => {
                        if (res.data.data.length == 0) {
                            setHasNoMore(true);
                            setLoading(false);
                        }
                        setTweets((prev) => [...prev, ...res.data.data]);
                        SetAreTweetsFetched(true);
                    });
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }

        }
        async function fetchSearchedTweets(query) {
            try {
                await axios
                    .get(
                        `/tweets/get-all-tweets?query=${query}${page > 1 ? `&page=${page}` : ``}${isUserLogged ? `&userId=${user?._id}` : ``}`,
                        { signal },
                    )
                    .then((res) => {
                        if (res.data.data.length == 0) {
                            setHasNoMore(true);
                            setLoading(false);
                        }

                        if (page > 1) {
                            setTweets((prev) => [...prev, ...res.data?.data]);
                        } else {
                            setTweets(res.data.data);
                        }
                        SetAreTweetsFetched(true);
                    });
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }

        }

        async function fetchAllTweetsByUser() {
            if (!userId) return;
            try {
                await axios
                    .get(`/tweets/${userId}${page > 1 ? `?page=${page}` : ``}`, {
                        signal,
                    })
                    .then((res) => {
                        if (res.data.data.length == 0) {
                            setHasNoMore(true);
                            setLoading(false);
                        }
                        setTweets((prev) => [...prev, ...res.data.data]);
                        SetAreTweetsFetched(true);
                    });
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }

        }

        if (fetchType === "user") {
            fetchAllTweetsByUser();
        } else if (fetchType === "search") {
            fetchSearchedTweets(searchQuery);
        } else {
            fetchAllTweets();
        }


        return () => {
            controller.abort();
        };
    }, [user, fetchType, searchQuery, page]);

    if (tweets.length == 0 && areTweetsFetched) {
        return (
            <div className="flex h-100 w-full justify-center items-center text-base font-medium ">
                No Posts available for this request
            </div>
        );
    }
    return (
        <div
            className={`scroll-smooth ${fetchType === "user" ? "md:flex md:justify-center" : "md:flex md:justify-center md:mt-4 md:flex-col"} overflow-y-auto`}
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
