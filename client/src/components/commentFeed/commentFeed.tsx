import { useState, useEffect, useContext, useRef } from "react";
import axios from "../../api/axios.js";
import CommentComponent from "./commentComponent.jsx";
import AddCommentsBox from "./AddCommentBox.jsx";
import { X } from "lucide-react";
import useUserStore from "../../stores/user.store.js";

export default function CommentFeed({
    fetchType,
    Id,
    isOpen,
    setIsOpen,
    setShowSignInPopup,
}) {
    const [comments, setComments] = useState([]);
    const [areCommentsFetched, SetAreCommentsFetched] = useState(false);
    const user = useUserStore(s => s.user)
    const [page, setPage] = useState(1);
    const ref = useRef(null);
    const [hasNoMore, setHasNoMore] = useState(false);
    const [loading, setLoading] = useState(false);

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
        if (!Id) return;
        if (loading) return;
        setLoading(true);

        const controller = new AbortController();
        const signal = controller.signal;

        async function fetchAllCommentsOnVideo(id) {
            if (!id) return;
            try {
                await axios
                    .get(
                        `/comments/${id}/get-video-comments?page=${page}${user?._id ? `&userId=${user._id}` : ``}`,
                        { signal },
                    )
                    .then((res) => {
                        if (res.data.data.length == 0) {
                            setHasNoMore(true);
                            setLoading(false);
                        }

                        setComments((prev) => [...prev, ...res.data.data]);
                        SetAreCommentsFetched(true);
                    });
            } catch (error) {
                console.log(error);
            }
        }
        async function fetchAllCommentsOnTweet(id) {
            if (!id) return;
            try {
                await axios
                    .get(
                        `/comments/${id}/get-tweet-comments?page=${page}${user?._id ? `&userId=${user._id}` : ``}`,
                        { signal },
                    )
                    .then((res) => {
                        if (res.data.data.length == 0) {
                            setHasNoMore(true);
                            setLoading(false);
                        }

                        setComments((prev) => [...prev, ...res.data.data]);
                        SetAreCommentsFetched(true);
                    });
            } catch (error) {
                console.log(error);
            }
        }
        async function fetchAllCommentsOnComment(id) {
            if (!id) return;
            try {
                await axios
                    .get(
                        `/comments/${id}/get-comment-comments?page=${page}${user?._id ? `&userId=${user._id}` : ``}`,
                        { signal },
                    )
                    .then((res) => {
                        if (res.data.data.length == 0) {
                            setHasNoMore(true);
                            setLoading(false);
                        }

                        setComments((prev) => [...prev, ...res.data.data]);
                        SetAreCommentsFetched(true);
                    });
            } catch (error) {
                console.log(error);
            }
        }

        if (fetchType === "tweet") {
            fetchAllCommentsOnTweet(Id);
        } else if (fetchType === "comment") {
            fetchAllCommentsOnComment(Id);
        } else {
            fetchAllCommentsOnVideo(Id);
        }
        return () => controller.abort();
    }, [fetchType, Id, user?.id, page]);

    return (
        <>
            <div
                className={`my-2 scroll-smooth ${isOpen ? "h-auto" : "h-30"}  p-3 flex flex-col  rounded-2xl bg-gray-100 mx-2 ease-in-out relative z-0 ring ring-gray-100`}
                onClick={() => !isOpen && setIsOpen(true)}
            >
                <h1 className="text-gray-900 text-left text-base text-medium">
                    {areCommentsFetched && comments.length} Comments
                </h1>
                {areCommentsFetched && isOpen ? (
                    <div className="h-full w-full" ref={ref}>
                        <X
                            size={20}
                            className={"absolute top-3 right-4 z-1 text-gray-500"}
                            onClick={() => isOpen && setIsOpen(false)}
                        />
                        <AddCommentsBox
                            Id={Id}
                            fetchType={fetchType}
                            className={"mb-8"}
                            setShowSignInPopup={setShowSignInPopup}
                            setComments={setComments}
                        />
                        {comments.map((comment, idx) => (
                            <CommentComponent
                                key={idx}
                                comment={comment}
                                setShowSignInPopup={setShowSignInPopup}
                                idx={idx}
                                commentsLength={comments.length}
                                setLoading={setLoading}
                            />
                        ))}
                    </div>
                ) : areCommentsFetched && comments.length !== 0 ? (
                    <CommentComponent comment={comments[0]} onlyContent={true} />
                ) : (
                    <div
                        className="my-3 h-auto flex p-3 rounded-2xl bg-gray-100 mx-2"
                        onClick={() => !isOpen && setIsOpen(true)}
                    >
                        No comments on this content yet
                    </div>
                )}
            </div>
        </>
    );
}
