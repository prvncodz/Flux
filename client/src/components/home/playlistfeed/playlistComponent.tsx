import { useState, useEffect, useContext } from "react";
import dpfp from "../../assets/dpfp.jpg";
import dbanner from "../../assets/dbanner.jpg";
import PlaylistIcon from "../../assets/playlistIcon.jsx";
import { useNavigate } from "react-router-dom";
import UserPlaylistcontext from "../../../contexts/userPlaylistContext.jsx";

export default function PlaylistComponent({
	playlist,
	idx,
	playlistsLength,
	setLoading,
}) {
	const { avatar, fullName ,userName} = playlist?.owner;
	const { owner } = useContext(UserPlaylistcontext);
	const [videos] = useState(playlist?.videos || []);
	const navigate = useNavigate();

	function hanldeShowPlaylistPage() {
		navigate(`/watch/playlist/${playlist?._id}`, {
			state: {
				playlist: playlist,
				name: playlist?.name,
				avatarUrl: avatar?.url,
				fullname: fullName,
				username:userName,
				owner
			},
		});
	}
	useEffect(() => {
		if (idx === playlistsLength - 1) {
			setLoading(false);
		}
	}, []);
	return (
		<div
			className="mb-3  w-full aspect-video max-w-100 md:max-w-190 lg:max-w-400  "
			onClick={hanldeShowPlaylistPage}
		>
			<div className="relative">
				<img
					src={videos[0]?.thumbnail?.url || dbanner}
					className=" w-full h-60 rounded-2xl z-0"
					onError={(e) => (e.target.src = dbanner)}
				/>
				<div className="absolute  bottom-2 p-2 right-2  rounded-xl text-center text-neutral-300 bg-gray-900 text-sm font-medium z-1 flex">
					<PlaylistIcon size={18} />{" "}
					<span className="mr-0.5 ml-1">{videos[0] ? videos.length : 0}</span>
					videos
				</div>
			</div>
			<div className="flex mt-3">
				<div className="h-10 w-10">
					<img
						src={avatar?.url || dpfp}
						className="rounded-full h-10 w-10"
						loading="lazy"
						onError={(e) => (e.target.src = dpfp)}
					/>
				</div>
				<span className="ml-4">
					<h3 className="text-left text-neutral-700 font-medium text-sm">
						{playlist.name}
					</h3>
					<h3 className="text-left text-neutral-600 font-medium text-xs">
						{fullName}.Playlist
					</h3>
				</span>
			</div>
		</div>
	);
}
