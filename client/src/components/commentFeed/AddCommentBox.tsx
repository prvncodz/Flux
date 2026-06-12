import { useRef, useState } from "react";
import axios from "../../api/axios";
import { PlusCircle } from "lucide-react";
import useUserStore from "../../stores/user.store";
import { Comment } from "../../types/comment.types";

export default function AddCommentsBox({
    Id,
    fetchType,
    className,
    setShowAddTweetBox,
    setShowAddReplyBox,
    setShowSignInPopup,
    setComments,
}: {
    Id?: string;
    fetchType?: string;
    className?: string;
    setShowAddTweetBox?: (b: boolean) => void;
    setShowAddReplyBox?: (b: boolean) => void;
    setShowSignInPopup?: (b: boolean) => void;
    setComments?: React.Dispatch<React.SetStateAction<Comment[]>>;
}) {
    const [content, setContent] = useState<string>("");
    const addCommentRef = useRef<HTMLButtonElement | null>(null);

    const isUserLogged = useUserStore(s => s.isUserLogged);
    async function handleAddComment() {
        if (!isUserLogged) {
            setShowSignInPopup && setShowSignInPopup(true);
            return;
        }
        if (content === "" || !content) return;
        
        let endpoint = "";
        if (fetchType === "video") {
            endpoint = `/comments/v/${Id}/add-comment`;
        } else if (fetchType === "tweet") {
            endpoint = `/comments/t/${Id}/add-comment`;
        } else {
            endpoint = `/comments/c/${Id}/add-comment`;
        }

        try {
            const res = await axios.post(endpoint, {
                content: content,
            });
            if (res.status == 200) {
                setContent("");
                setComments && setComments(prev => [...prev, res.data?.data]);
            }
        } catch (err) {
            console.log(`error occured while adding a new comment to ${fetchType}`, err);
        }
        
        setShowAddReplyBox && setShowAddReplyBox(false);
        setShowAddTweetBox && setShowAddTweetBox(false);
        setContent("");
    }
    return (
        <div
            className={`w-full rounded-3xl bg- h-14 my-6 relative ${className}  ring ring-gray-400 p-4 cursor-pointer`}
        >
            <input
                type="text"
                name="comment input"
                placeholder="Add a comment here"
                className="w-4/5 h-full  text-gray-800 relative z-0 focus:outline-none pr-4 wrap-anywhere"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        addCommentRef.current?.click();
                        setContent("");
                    }
                }}
            />
            <button
                type="button"
                className="absolute rounded-full top-2 right-2 z-1"
                onClick={handleAddComment}
                ref={addCommentRef}
            >
                <PlusCircle size={40} className="text-gray-300" />
            </button>
        </div>
    );
}
