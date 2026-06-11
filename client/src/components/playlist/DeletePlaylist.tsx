import { useEffect } from "react";

export default function DeletePlaylistModal({ isOpen, onClose, onConfirm, playlistName }) {
	// Close on Escape
	useEffect(() => {
		const onKey = (e) => { if (e.key === "Escape") onClose(); };
		if (isOpen) window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

				{/* Body */}
				<div className="px-6 pt-6 pb-5">

					<h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
						Are you sure?
					</h2>
					<p className="text-sm text-neutral-400 dark:text-neutral-500 leading-relaxed">
						{playlistName
							? <>This will permanently delete <span className="text-neutral-600 dark:text-neutral-300 font-medium">"{playlistName}"</span>. Your videos won't be affected.</>
							: "This will permanently delete this playlist. Your videos won't be affected."
						}
					</p>
				</div>

				{/* Divider */}
				<div className="h-px bg-neutral-100 dark:bg-neutral-800" />

				{/* Actions */}
				<div className="flex gap-2 px-6 py-4">
					<button
						onClick={onClose}
						className="flex-1 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-medium"
					>
						No, keep it
					</button>
					<button
						onClick={() => { onConfirm?.(); onClose(); }}
						className="flex-1 py-2.5 text-sm rounded-xl bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white transition-all font-medium"
					>
						Yes, delete
					</button>
				</div>

			</div>
		</div>
	);
}


