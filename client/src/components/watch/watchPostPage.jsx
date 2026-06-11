import { useLocation, useParams } from "react-router-dom";
import Nav from "../home/nav.jsx";
import TweetComponent from "../home/tweetfeed/tweet.jsx";
import AddCommentsBox from "../commentFeed/AddCommentBox.jsx";
import CommentComponent from "../commentFeed/commentComponent.jsx";

export default function WatchPostPage() {
	const location = useLocation();
	const { post, comments, postType } = location.state || {};
	const {postId}=useParams();
	return (
		<div className="scroll-smooth">
			<Nav wantTabs={false} />
			<div className="md:bg-[#ffffff]  md:flex md:justify-center md:relative md:z-10 lg:z-1  scroll-smooth">
				{postType === "comment" ? ( //if posttype is comment we will show a main comment commentComponent comment box and its comments else we will show main tweet and comment box for tweet and its comments
					<div className="w-full lg:max-w-[40vw] ">
						<CommentComponent comment={post} mainPost={true} />
						<div className="px-5 ">
							<AddCommentsBox fetchType={"comment"} Id={post?._id} />
						</div>
						<div className="h-screen overflow-y-auto overflow-x-hidden mt-5 flex flex-col">
							{comments.length !== 0 &&
								comments.map((comment, idx) => (
									<CommentComponent key={idx} comment={comment} />
								))}
						</div>
					</div>
				) : (
					<div className=" w-full lg:max-w-[40vw]">
						<TweetComponent tweet={post} mainPost={true} />

						<div className="px-5 ">
							<AddCommentsBox fetchType={"tweet"} Id={post?._id} />
						</div>
						<div className="h-screen overflow-y-auto overflow-x-hidden mt-5 flex flex-col">
							{comments.length !== 0 &&
								comments.map((comment, idx) => (
									<CommentComponent key={idx} comment={comment} />
								))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
