import { useState, useEffect } from "react";
import axios from "../../../api/axios";
import LikeIcon from "../../assets/likeIcon";
import LikeFilledIcon from "../../assets/likeFilledIcon";

function LikeButton({
    fetchType,
    Id,
    likeStatus,
    isUserLogged,
    setShowSignInPopup,
}: {
    fetchType: "video" | "comment" | "tweet" | string;
    Id?: string;
    likeStatus?: boolean;
    isUserLogged?: boolean;
    setShowSignInPopup?: (b: boolean) => void;
}) {
    const [liked, setLiked] = useState<boolean | undefined>(likeStatus);
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        setLiked(likeStatus);
        async function getLikeCount(id: string, type: string) {
            if (!id) return;
            let endpoint = "";
            if (type === "video") endpoint = `/likes/v/${id}`;
            else if (type === "comment") endpoint = `/likes/c/${id}`;
            else endpoint = `/likes/t/${id}`;

            try {
                const res = await axios.get(endpoint);
                if (res.status == 200) {
                    setCount(res.data.data);
                }
            } catch (err) {
                console.log(`Error while fetching ${type} likes with id ${id}`, err);
            }
        }
        if (Id) {
            getLikeCount(Id, fetchType);
        }
    }, [fetchType, Id, likeStatus]);

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleLike = () => {
        clearTimeout(timeoutId);
        if (!isUserLogged) {
            setShowSignInPopup && setShowSignInPopup(true);
            return;
        }
        if (liked) {
            setCount(prev => prev - 1);
        } else {
            setCount(prev => prev + 1);
        }
        setLiked(!liked);
        timeoutId = setTimeout(async () => {
            if (!Id) return;
            let endpoint = "";
            if (fetchType === "tweet") endpoint = `/likes/toggle/t/${Id}`;
            else if (fetchType === "video") endpoint = `/likes/toggle/v/${Id}`;
            else endpoint = `/likes/toggle/c/${Id}`;

            try {
                const res = await axios.post(endpoint);
                if (res.status == 200) {
                    console.log(res.data);
                }
            } catch (err) {
                console.log(`Error while toggling ${fetchType} likes with id ${Id}`, err);
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
