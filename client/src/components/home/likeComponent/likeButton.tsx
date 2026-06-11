import { useState, useEffect, useContext } from "react";
import axios from "../../../api/axios.js";
import LikeIcon from "../../assets/likeIcon.jsx";
import LikeFilledIcon from "../../assets/likeFilledIcon.jsx";

function LikeButton({
    fetchType,
    Id,
    likeStatus,
    isUserLogged,
    setShowSignInPopup,
}) {
    const [liked, setLiked] = useState(likeStatus);
    const [count, setCount] = useState(0);

    useEffect(() => {
        setLiked(likeStatus);
        async function getVideoLikeCount(videoId) {
            if (!videoId) return;
            try {
                const res = await axios.get(`/likes/v/${videoId}`);
                if (res.status == 200) {
                    setCount(res.data.data);
                }
            } catch (err) {
                console.log(
                    `Error while fetching video likes with id ${videoId} `,
                    err,
                );
            }
        }
        async function getTweetLikeCount(tweetId) {
            if (!tweetId) return;
            try {
                const res = await axios.get(`/likes/t/${tweetId}`);
                if (res.status == 200) {
                    setCount(res.data.data);
                }
            } catch (err) {
                console.log(
                    `Error while fetching tweet likes with id ${tweetId} `,
                    err,
                );
            }
        }
        async function getCommentLikeCount(commentId) {
            if (!commentId) return;
            try {
                const res = await axios.get(`/likes/c/${commentId}`);
                if (res.status == 200) {
                    setCount(res.data.data);
                }
            } catch (err) {
                console.log(
                    `Error while fetching comment likes with id ${commentId} `,
                    err,
                );
            }
        }
        if (fetchType === "video") {
            getVideoLikeCount(Id);
        } else if (fetchType === "comment") {
            getCommentLikeCount(Id);
        } else {
            getTweetLikeCount(Id);
        }
    }, [fetchType, Id, likeStatus]);

    let timeoutId;
    const handleLike = () => {
        clearTimeout(timeoutId);
        if (!isUserLogged) {
            setShowSignInPopup(true);
            return;
        }
        if (liked) {
            setCount(count - 1);
        } else {
            setCount(count + 1);
        }
        setLiked(!liked);
        timeoutId = setTimeout(async () => {
            if (fetchType === "tweet") {
                try {
                    const res = await axios.post(`/likes/toggle/t/${Id}`);
                    if (res.status == 200) {
                        console.log(res.data);
                    }
                } catch (err) {
                    console.log(`Error while toggling tweet likes with id ${Id}`, err);
                }
            } else if (fetchType === "video") {
                try {
                    const res = await axios.post(`/likes/toggle/v/${Id}`);
                    if (res.status == 200) {
                        console.log(res.data);
                    }
                } catch (err) {
                    console.log(`Error while toggling video likes with id ${Id}`, err);
                }
            } else {
                try {
                    const res = await axios.post(`/likes/toggle/c/${Id}`);
                    if (res.status == 200) {
                        console.log(res.data);
                    }
                } catch (err) {
                    console.log(`Error while toggling comment likes with id ${Id}`, err);
                }
            }
        }, 800);
    };

    return (
        <button
            onClick={handleLike}
            style={{
                cursor: "pointer",
                color: "black",
                fontSize: "14px",
                display: "flex",
            }}
        >
            {liked ? (
                <>
                    <LikeFilledIcon size={20} />
                    <span className="ml-1">{count}</span>
                </>
            ) : (
                <>
                    <LikeIcon size={20} />
                    <span className="ml-1">{count}</span>
                </>
            )}
        </button>
    );
}

export default LikeButton;
