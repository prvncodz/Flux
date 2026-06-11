import { useState, useEffect, useRef } from "react";


export default function AddVideosModal({
	isOpen,
	onClose,
	onAdd,
	videos = MOCK_USER_VIDEOS,
	alreadyAdded = ALREADY_IN_PLAYLIST,
}) {
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState(new Set());
	const searchRef = useRef(null);

	// Reset state when modal opens
	useEffect(() => {
		if (isOpen) {
			setSelected(new Set());
			setSearch("");
			setTimeout(() => searchRef.current?.focus(), 80);
		}
	}, [isOpen]);

	// Close on Escape
	useEffect(() => {
		const onKey = (e) => { if (e.key === "Escape") onClose(); };
		if (isOpen) window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isOpen, onClose]);

	const filtered = videos.filter((v) =>
		v.title.toLowerCase().includes(search.toLowerCase())
	);

	const toggle = (id) => {
		if (alreadyAdded.has(id)) return;
		setSelected((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	};

	const handleAdd = () => {
		onAdd?.([...selected]);
		onClose();
	};

	if (!isOpen) return null;

	return (
		// Backdrop
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			{/* Modal */}
			<div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">

				{/* Header */}
				<div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
					<div>
						<h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
							Add videos
						</h2>
						<p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
							Select videos to add to this playlist
						</p>
					</div>
					<button
						onClick={onClose}
						className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
						aria-label="Close"
					>
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
							<path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
						</svg>
					</button>
				</div>

				{/* Search */}
				<div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
					<div className="relative">
						<svg
							className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
							width="14" height="14" viewBox="0 0 16 16" fill="none"
						>
							<circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
							<path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
						</svg>
						<input
							ref={searchRef}
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search your videos..."
							className="w-full pl-8 pr-4 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 focus:ring-offset-0 transition"
						/>
						{search && (
							<button
								onClick={() => setSearch("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
							>
								<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
									<path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
								</svg>
							</button>
						)}
					</div>
				</div>

				{/* Video list */}
				<div className="overflow-y-auto flex-1 min-h-0 max-h-72 px-2 py-2">
					{filtered.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-10 text-neutral-400 dark:text-neutral-600">
							<svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mb-2 opacity-40">
								<rect x="4" y="8" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
								<path d="M13 12l7 4-7 4V12z" fill="currentColor" />
							</svg>
							<p className="text-sm">No videos found</p>
						</div>
					) : (
						filtered.map((video) => {
							const isAdded = alreadyAdded.has(video._id);
							const isSelected = selected.has(video._id);
							return (
								<button
									key={video._id}
									onClick={() => toggle(video._id)}
									disabled={isAdded}
									className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                    ${isAdded
											? "opacity-40 cursor-not-allowed"
											: isSelected
												? "bg-neutral-900 dark:bg-neutral-100"
												: "hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
										}
                  `}
								>
									{/* Thumbnail */}
									<div className={`w-14 h-9 rounded-lg shrink-0 overflow-hidden ${video.color} flex items-center justify-center relative`}>
										{video.thumbnail ? (
											<img src={video.thumbnail?.url} alt="" className="w-full h-full object-cover" />
										) : (
											<svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-50">
												<path d="M5 3.5l8 4.5-8 4.5V3.5z" fill="currentColor" />
											</svg>
										)}
									</div>

									{/* Info */}
									<div className="flex-1 min-w-0">
										<p className={`text-sm font-medium truncate leading-tight ${isSelected
											? "text-white dark:text-neutral-900"
											: "text-neutral-800 dark:text-neutral-200"
											}`}>
											{video.title}
										</p>
										{isAdded && (
											<p className="text-xs text-neutral-400 mt-0.5">Already in playlist</p>
										)}
									</div>

									{/* Checkbox */}
									<div className={`
                    w-5 h-5 rounded-full shrink-0 flex items-center justify-center border transition-all
                    ${isAdded
											? "border-neutral-300 dark:border-neutral-600"
											: isSelected
												? "bg-white dark:bg-neutral-900 border-white dark:border-neutral-900"
												: "border-neutral-300 dark:border-neutral-600"
										}
                  `}>
										{isSelected && (
											<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
												<path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
													className="text-neutral-900 dark:text-neutral-100" />
											</svg>
										)}
										{isAdded && (
											<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
												<path d="M1.5 5l2.5 2.5 4.5-5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										)}
									</div>
								</button>
							);
						})
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between px-5 py-4 border-t border-neutral-100 dark:border-neutral-800">
					<span className="text-xs text-neutral-400 dark:text-neutral-500">
						{selected.size === 0
							? "No videos selected"
							: `${selected.size} video${selected.size !== 1 ? "s" : ""} selected`}
					</span>
					<div className="flex items-center gap-2">
						<button
							onClick={onClose}
							className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={handleAdd}
							disabled={selected.size === 0}
							className="px-4 py-2 text-sm rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
						>
							Add {selected.size > 0 ? `(${selected.size})` : ""}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}


