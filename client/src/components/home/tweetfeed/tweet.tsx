import React from "react";
import Like from "../likeComponent/likeButton";
import dpfp from "../../assets/dpfp.jpg";
import axios from "../../../api/axios";
import ChatIcon from "../../assets/chatIcon";
import { useNavigate } from "react-router-dom";
import AddCommentsBox from "../../commentFeed/AddCommentBox";
import ReplyIcon from "../../assets/replyIcon";
import TweetCardOptions from "./tweetCardOptions";
import { EllipsisVertical } from "lucide-react";
import { DeletePost, EditPost } from "./tweetOptions";
import useUserStore from "../../../stores/user.store";

export default function TweetComponent({
    tweet,
    mainPost,
    idx,
    tweetsLength,
    setLoading,
    setShowSigninPopup,
}: {
    tweet?: any;
    mainPost?: boolean;
    idx?: number;
    tweetsLength?: number;
    setLoading?: (b: boolean) => void;
    setShowSigninPopup?: (b: boolean) => void;
}) {
    const { avatar, fullName, userName } = (tweet?.owner ?? {}) as { avatar?: { url?: string }; fullName?: string; userName?: string };
    const [commentsPost, setCommentPosts] = React.useState<any[]>([{}]);
    const [showAddTweetBox, setShowAddTweetBox] = React.useState<boolean>(false);
    const [areAnyComments, setAreAnyComments] = React.useState<boolean>(false);
    const user = useUserStore(s => s.user);
    const isUserLogged = useUserStore(s => s.isUserLogged);
    const [isOptionActive, setIsOptionsActive] = React.useState<boolean>(false)
    const [showPopup, setShowPopup] = React.useState<boolean>(false);
    const [popupType, setPopupType] = React.useState<string | boolean>("false");
    const [isUserTweet, setIsUserTweet] = React.useState<boolean>(false);

    const popup = {
        "edit": <EditPost setShowPopup={setShowPopup} tweet={tweet} avatarUrl={avatar?.url} fullname={fullName} username={userName} />,
        "delete": <DeletePost isOpen={showPopup} onClose={() => setShowPopup(false)} tweetId={tweet?._id} />
    }
    const navigate = useNavigate();

    function handleShowTweetPage() {
        if (!isUserLogged) {
            setShowSigninPopup(true);
            return;
        }

        if (!mainPost) {
            navigate(`/watch/post/${tweet._id}`, {
                state: {
                    post: tweet,
                    comments: commentsPost,
                },
            });
        } else {
            return;
        }
    }

    async function handleOption(optType) {
        try {
            if (optType === "edit") {
                setShowPopup(true);
                setPopupType("edit");
                setIsOptionsActive(false);
            } else if (optType === "delete") {
                setShowPopup(true);
                setPopupType("delete");
                setIsOptionsActive(false);
            }
        } catch (err) {
            console.log(err);
        }
    }
    function HandleReplyToTweet() {
        if (!isUserLogged) {
            setShowSigninPopup(true);
            return;
        }
        if (!mainPost) {
            setShowAddTweetBox((prev) => !prev);
        }
    }


    useEffect(() => {

        async function getAllCommentPosts() {
            try {
                const res = await axios.get(
                    `/comments/${tweet?._id}/get-tweet-comments${user?._id ? `?userId=${user._id}` : ``}`,
                ); //if userid is there it will be sent as query else no query will be sent
                if (res.status === 200) {
                    setCommentPosts([...res.data?.data]);
                    if (res.data.data?.length !== 0) {
                        setAreAnyComments(true);
                    } else {
                        setAreAnyComments(false);
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }
        if (idx === tweetsLength - 1) {
            setLoading(false);
        }
        if (tweet?.owner?._id === user?._id) {
            setIsUserTweet(true);
        }
        getAllCommentPosts();
    }, [tweet, user]);

    return (
        <>
            <div
                className=" h-auto w-full p-3 border-b border-gray-300 mt-0 mb-0 relative "
                onError={() => setShowSigninPopup(true)}
            >
                <div className="flex mt-3">
                    <div className="h-10 w-10 ml-4">
                        <img
                            src={avatar?.url || dpfp}
                            className="rounded-full h-10 w-10"
                            onError={(e) => (e.target.src = dpfp)}
                        />
                    </div>
                    <span className="ml-4 h-7">
                        <h3 className="text-left text-neutral-700 font-medium text-lg">
                            {fullName}
                        </h3>
                        <h3 className="text-left text-neutral-600 font-medium text-xs mt-0">
                            {"@" + userName}
                        </h3>
                    </span>
                </div>
                {isUserTweet &&
                    <>
                        <button onClick={() => setIsOptionsActive(prev => !prev)} className="absolute top-8 right-5">
                            <EllipsisVertical size={20} className="text-neutral-700" />
                        </button>
                        {
                            isOptionActive && <TweetCardOptions handleOption={handleOption} />
                        }
                        {
                            showPopup && popup[popupType]
                        }
                    </>
                }

                <div className="pt-4 pl-4 h-auto w-full wrap-break-word text-neutral-700 text-body font-medium text-left ">
                    {tweet.content}
                </div>
                <div className="flex justify-start gap-8 mt-4 ml-5">
                    <span>
                        <Like
                            fetchType={"tweet"}
                            Id={tweet._id}
                            likeStatus={tweet?.isLiked}
                            isUserLogged={isUserLogged}
                            setShowSignInPopup={setShowSigninPopup}
                        />
                    </span>
                    <span
                        className="flex text-sm text-black cursor-pointer "
                        onClick={HandleReplyToTweet}
                    >
                        <span className="mr-1">
                            <ReplyIcon />
                        </span>
                        reply
                    </span>
                    <span
                        onClick={handleShowTweetPage}
                        className="flex text-sm text-black cursor-pointer "
                    >
                        <ChatIcon size={26} className="bg-gray-600" />
                        {!areAnyComments || mainPost ? (
                            ""
                        ) : (
                            <span className="ml-2"> View {commentsPost.length} replies</span>
                        )}
                    </span>
                </div>
            </div>
            {showAddTweetBox && (
                <AddCommentsBox
                    fetchType={"tweet"}
                    Id={tweet?._id}
                    setShowAddTweetBox={setShowAddTweetBox}
                />
            )}
        </>
    );
}
