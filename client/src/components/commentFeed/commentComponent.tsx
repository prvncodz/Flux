import { useEffect, useState } from "react";
import { useGetUserById } from "../../hooks/useGetUserById";
import Like from "../home/likeComponent/likeButton";
import dpfp from "../assets/dpfp.jpg";
import axios from "../../api/axios";
import AddCommentsBox from "./AddCommentBox";
import ChatBubbleIcon from "../assets/chatIcon";
import { useNavigate } from "react-router-dom";
import ReplyIcon from "../assets/replyIcon";
import useUserStore from "../../stores/user.store";
import { Comment } from "../../types/comment.types";
import React from "react";

export default function CommentComponent({
    comment,
    onlyContent,
    mainPost,
    setShowSignInPopup,
    idx,
    commentsLength,
    setLoading,
}: {
    comment?: Comment;
    onlyContent?: boolean;
    mainPost?: boolean;
    setShowSignInPopup?: (b: boolean) => void;
    idx?: number;
    commentsLength?: number;
    setLoading?: (b: boolean) => void;
}) {
    const { avatarUrl, fullname, username } = useGetUserById(comment?.owner as string) || ({} as any);
    const [showAddReplyBox, setShowAddReplyBox] = useState<boolean>(false);
    const [commentsPosts, setCommentPosts] = useState<Comment[]>([]);
    const [areAnyComments, setAreAnyComments] = useState<boolean>(false);
    const user = useUserStore((s) => s.user);
    const isUserLogged = useUserStore((s) => s.isUserLogged);
    const navigate = useNavigate();

    function HandleReplyToComment() {
        if (!isUserLogged) {
            setShowSignInPopup && setShowSignInPopup(true);
            return;
        }
        if (!mainPost) {
            setShowAddReplyBox((prev) => !prev);
        }
    }
    function handleShowPostPage() {
        if (!isUserLogged) {
            setShowSignInPopup && setShowSignInPopup(true);
            return;
        }
        if (!mainPost) {
            navigate(`/watch/post/${comment?._id}`, {
                state: {
                    post: comment,
                    comments: commentsPosts,
                    postType: "comment",
                },
            });
        }
    }

    useEffect(() => {
        if (typeof idx === 'number' && typeof commentsLength === 'number' && idx === commentsLength - 1) {
            setLoading && setLoading(false);
        }
        async function getAllCommentPosts() {
            try {
                const res = await axios.get(
                    `/comments/${comment?._id}/get-comment-comments${user?._id ? `?userId=${user._id}` : ``}`,
                );
                if (res.status === 200) {
                    setCommentPosts(res.data?.data);
                    if (res.data.data.length !== 0) {
                        setAreAnyComments(true);
                    } else {
                        setAreAnyComments(false);
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }
        if (comment?._id) {
            getAllCommentPosts();
        }
    }, [comment?._id, user?._id, idx, commentsLength, setLoading]);

    if (onlyContent) {
        return (
            <div className="flex p-3">
                <img
                    src={avatarUrl || dpfp}
                    className="rounded-full h-10 w-10"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => ((e.target as HTMLImageElement).src = dpfp)}
                />
                <h1 className="text-neutral-700 text-lg font-normal text-left wrap ml-3 my-1 w-full">
                    {comment?.content || ""}
                </h1>
            </div>
        );
    }
    return (
        <>
            <div className=" h-auto w-full  border-b border-gray-200 mt-0 mb-0 p-1">
                <div className="flex mt-3">
                    <div className="h-10 w-10 ml-4">
                        <img
                            src={avatarUrl || dpfp}
                            className="rounded-full h-10 w-10"
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => ((e.target as HTMLImageElement).src = dpfp)}
                        />
                    </div>
                    <span className="ml-4 h-7">
                        <h3 className="text-left text-neutral-700 font-medium text-lg">
                            {fullname}
                        </h3>
                        <h3 className="text-left text-neutral-600 font-medium text-xs mt-0">
                            {"@" + username}
                        </h3>
                    </span>
                </div>
                <div className="pt-4 pl-4 h-auto w-full wrap-break-word text-neutral-700 text-body font-medium text-left wrap">
                    {comment?.content || ""}
                </div>
                <div className="flex justify-start gap-8 mt-4 ml-5 mb-2">
                    <span>
                        <Like
                            fetchType={"comment"}
                            Id={comment?._id}
                            likeStatus={comment?.isLiked}
                            setShowSignInPopup={setShowSignInPopup}
                            isUserLogged={isUserLogged}
                        />
                    </span>
                    <span
                        className="flex text-sm text-black cursor-pointer "
                        onClick={HandleReplyToComment}
                    >
                        <span className="mr-1">
                            <ReplyIcon />
                        </span>
                        reply
                    </span>
                    <span
                        onClick={handleShowPostPage}
                        className="flex text-sm text-black cursor-pointer "
                    >
                        <ChatBubbleIcon size={26} />
                        {!areAnyComments || mainPost ? (
                            ""
                        ) : (
                            <span className="ml-2"> View {commentsPosts.length} replies</span>
                        )}
                    </span>
                </div>
            </div>

            {showAddReplyBox && comment?._id && (
                <AddCommentsBox
                    fetchType={"comment"}
                    Id={comment?._id}
                    setShowAddReplyBox={setShowAddReplyBox}
                />
            )}

        </>
    );
}
