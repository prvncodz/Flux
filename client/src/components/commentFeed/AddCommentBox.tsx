import { useContext, useRef, useState } from "react";
import axios from "../../api/axios";
import { PlusCircle } from "lucide-react";
import useUserStore from "../../stores/user.store";

export default function AddCommentsBox({
    Id,
    fetchType,
    className,
    setShowAddTweetBox,
    setShowAddReplyBox,
    setShowSignInPopup,
    setComments
}) {
    const [content, setContent] = useState("");
    let addCommentRef = useRef(null);

    const isUserLogged = useUserStore(s => s.isUserLogged);
    async function handleAddComment() {
        if (!isUserLogged) {
            setShowSignInPopup(true);
            return;
        }
        if (content === "" || !content) return;
        if (fetchType === "video") {
            try {
                const res = await axios.post(`/comments/v/${Id}/add-comment`, {
                    content: content,
                });
                if (res.status == 200) {
                    setContent("");
                    setComments(prev => [...prev, res.data?.data]);
                }
            } catch (err) {
                console.log("error occured while adding a new comment", err);
            }
        } else if (fetchType === "tweet") {
            try {
                const res = await axios.post(`/comments/t/${Id}/add-comment`, {
                    content: content,
                });
                if (res.status == 200) {
                    setContent("");
                    setComments(prev => [...prev, res.data?.data]);
                }
            } catch (err) {
                console.log("error occured while adding a new comment", err);
            }
        } else {
            try {
                const res = await axios.post(`/comments/c/${Id}/add-comment`, {
                    content: content,
                });
                if (res.status == 200) {
                    setContent("");
                    setComments(prev => [...prev, res.data?.data]);
                }
            } catch (err) {
                console.log("error occured while adding a new comment", err);
            }
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
                        addCommentRef.current.click();
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
