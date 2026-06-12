import { useRef, useState, useEffect } from "react";
import axios from "../../api/axios";
import CommentComponent from "./commentComponent";
import AddCommentsBox from "./AddCommentBox";
import { X } from "lucide-react";
import useUserStore from "../../stores/user.store";
import { Comment } from "../../types/comment.types";

export default function CommentFeed({
    fetchType,
    Id,
    isOpen,
    setIsOpen,
    setShowSignInPopup,
}: {
    fetchType?: string;
    Id?: string;
    isOpen?: boolean;
    setIsOpen?: (b: boolean) => void;
    setShowSignInPopup?: (b: boolean) => void;
}) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [areCommentsFetched, SetAreCommentsFetched] = useState<boolean>(false);
    const user = useUserStore(s => s.user)
    const [page, setPage] = useState<number>(1);
    const ref = useRef<HTMLDivElement | null>(null);
    const [hasNoMore, setHasNoMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

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
        if (!Id) return;
        if (loading) return;
        setLoading(true);

        const controller = new AbortController();
        const signal = controller.signal;

        async function fetchComments(id: string, type: string) {
            let endpoint = "";
            if (type === "tweet") {
                endpoint = `/comments/${id}/get-tweet-comments`;
            } else if (type === "comment") {
                endpoint = `/comments/${id}/get-comment-comments`;
            } else {
                endpoint = `/comments/${id}/get-video-comments`;
            }

            try {
                const res = await axios.get(
                    `${endpoint}?page=${page}${user?._id ? `&userId=${user._id}` : ``}`,
                    { signal },
                );
                if (res.data.data.length == 0) {
                    setHasNoMore(true);
                } else {
                    setComments((prev) => [...prev, ...res.data.data]);
                    SetAreCommentsFetched(true);
                }
            } catch (error: any) {
                if (error.name !== 'CanceledError') {
                    console.log(error);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchComments(Id, fetchType || "video");
        
        return () => controller.abort();
    }, [fetchType, Id, user?._id, page]);

    return (
        <>
            <div
                className={`my-2 scroll-smooth ${isOpen ? "h-auto" : "h-30"}  p-3 flex flex-col  rounded-2xl bg-gray-100 mx-2 ease-in-out relative z-0 ring ring-gray-100`}
                onClick={() => !isOpen && setIsOpen?.(true)}
            >
                <h1 className="text-gray-900 text-left text-base text-medium">
                    {areCommentsFetched && comments.length} Comments
                </h1>
                {areCommentsFetched && isOpen ? (
                    <div className="h-full w-full" ref={ref}>
                        <X
                            size={20}
                            className={"absolute top-3 right-4 z-1 text-gray-500"}
                            onClick={() => isOpen && setIsOpen?.(false)}
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
                        onClick={() => !isOpen && setIsOpen?.(true)}
                    >
                        No comments on this content yet
                    </div>
                )}
            </div>
        </>
    );
}
