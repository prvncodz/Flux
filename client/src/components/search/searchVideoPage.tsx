import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Feed from "../home/videofeed/feed";

const SearchVideoPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = searchParams.get("query");
	const navigate = useNavigate();
	const [searchInput, setSearchInput] = useState(searchQuery || "");

	useEffect(() => {
		setSearchInput(searchQuery);
	}, [searchParams]);

	function handleSearch() {
		setSearchParams({ query: searchInput })
	}
	return (
		<div>
			<div className="h-screen w-full overflow-auto">
				<div className="h-auto w-full transition-all flex gap-5 items-center sticky">
					<button
						onClick={() => navigate("/")}
						className="flex flex-start ml-5"
					>
						<ArrowLeft />
					</button>
					<div className="w-80 h-10 rounded-full border border-gray-200 my-2 flex md:w-[60vw] md:ml-25 lg:mx-auto  lg:w-[50vw]">
						<input
							type="text"
							name="query"
							placeholder="Search on flux"
							className="h-full w-full placeholder:text-gray-500 text-gray-700 pl-9 pr-5 flex flex-start focus:outline-none"
							onKeyDown={(e) => {
								if (e.key == "Enter") {
									e.target.blur();
									handleSearch();
								}
							}}
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
						/>
						<div
							className="h-10 w-18 rounded-4xl bg-gray-100 flex items-center justify-center flex-end"
							onClick={(e) => {
								e.target.blur();
								handleSearch();
							}}
						>
							<Search size={20} />
						</div>
					</div>
				</div>
				<Feed fetchType={"search"} searchQuery={searchQuery} />
			</div>
		</div>
	);
};

export default SearchVideoPage;
