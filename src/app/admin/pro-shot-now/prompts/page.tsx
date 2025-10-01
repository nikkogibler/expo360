"use client";
import React, { useEffect, useState } from "react";

import HamburgerMenu from "../../../../components/HamburgerMenu";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabaseClient";

	interface Prompt {
		id: string;
		prompt: string;
		tags?: string[];
		created_by?: string;
		created_at: string;
		tokens_used?: number;
		output_image?: string;
		user?: string;
		tela?: string;
		estructura?: string;
	}

export default function PromptVisualizer() {
	// Copy to clipboard handler
	const handleCopyPrompt = (promptText: string) => {
		if (navigator && navigator.clipboard) {
			navigator.clipboard.writeText(promptText);
		} else {
			// fallback
			const textarea = document.createElement('textarea');
			textarea.value = promptText;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
		}
	};
	const router = useRouter();
	const [prompts, setPrompts] = useState<Prompt[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

			useEffect(() => {
				const fetchPrompts = async () => {
					setLoading(true);
					setError(null);
					// Fetch prompts
					const { data, error } = await supabase
						.from("image_prompts")
						.select("prompt_id, created_at, prompt_text, tokens_used, output_image, user, tela, estructura")
						.order("created_at", { ascending: false });
					if (error) {
						setError(error.message);
						setPrompts([]);
						setLoading(false);
						return;
					}
							// Use output_image column directly for card backgrounds
									setPrompts(
													(Array.isArray(data) ? data : []).map((row: {
														prompt_id: string;
														prompt_text: string;
														user?: string;
														created_at: string;
														tokens_used?: number;
														output_image?: string;
														tela?: string;
														estructura?: string;
													}) => ({
												id: String(row.prompt_id ?? ''),
												prompt: String(row.prompt_text ?? ''),
												tags: [],
												created_by: typeof row.user === 'string' ? row.user : undefined,
												created_at: String(row.created_at ?? ''),
												tokens_used: typeof row.tokens_used === 'number' ? row.tokens_used : undefined,
												output_image: typeof row.output_image === 'string' ? row.output_image : undefined,
												user: typeof row.user === 'string' ? row.user : undefined,
												tela: typeof row.tela === 'string' ? row.tela : undefined,
												estructura: typeof row.estructura === 'string' ? row.estructura : undefined,
											}))
									);
							setLoading(false);
				};
				fetchPrompts();
			}, []);

		// const [debugInfo, setDebugInfo] = useState('');

		// Filtering and sorting state
		const [selectedTag, setSelectedTag] = useState<string>('');
		const [selectedUser, setSelectedUser] = useState<string>('');
		const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

		// Get unique tags and users for dropdowns
		const allTags = Array.from(new Set(prompts.flatMap(p => p.tags || []))).filter(Boolean);
		const allUsers = Array.from(new Set(prompts.map(p => p.user || p.created_by).filter(Boolean)));

		// Filter and sort prompts
		const filteredPrompts = prompts
			.filter(p =>
				// Exclude prompts containing 'car' (case-insensitive)
				!p.prompt?.toLowerCase().includes('car') &&
				(selectedTag ? (p.tags || []).includes(selectedTag) : true) &&
				(selectedUser ? (p.user === selectedUser || p.created_by === selectedUser) : true)
			)
			.sort((a, b) => {
				if (sortOrder === 'desc') {
					return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
				} else {
					return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
				}
			});
		return (
				<div
					className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-10"
					style={{
						backgroundImage: "url('/vine_2b.png')",
						backgroundRepeat: "repeat",
						backgroundSize: "400px 400px",
						backgroundPosition: "center",
					}}
				>
										{/* Header with Back Arrow, Logo (left) and Hamburger Menu (right) */}
										<div className="w-full max-w-6xl mx-auto flex flex-row items-center justify-between mb-4">
											  <div className="flex flex-row items-center gap-3" style={{ marginLeft: '-40px' }}>
																	<button
																		onClick={() => router.push('/admin/pro-shot-now')}
													style={{
														background: 'none',
														border: 'none',
														cursor: 'pointer',
														color: '#666',
														padding: '8px',
														borderRadius: '6px',
														transition: 'all 0.2s ease',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														marginTop: '7px',
													}}
													onMouseEnter={e => {
														e.currentTarget.style.color = '#333';
														e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
													}}
													onMouseLeave={e => {
														e.currentTarget.style.color = '#666';
														e.currentTarget.style.backgroundColor = 'transparent';
													}}
												>
													<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
														<path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
													</svg>
												</button>
																						<div onClick={() => router.push('/admin/pro-shot-now')} style={{ cursor: 'pointer' }}>
																							<Image
																								src="/kusam_main.webp"
																								alt="Kusam Logo"
																								width={120}
																								height={30}
																								style={{ objectFit: 'contain', height: 'auto', opacity: 0.8 }}
																								priority
																							/>
																						</div>
											</div>
											<div className="flex flex-row items-center">
												<HamburgerMenu />
											</div>
										</div>
					<div className="w-full max-w-6xl mx-auto mb-8 flex justify-center items-center" style={{ minHeight: '280px' }}>
									<Image
										src="/admin/prompts_header.png"
										alt="Prompt Visualizer Header"
										width={1200}
										height={420}
										style={{ maxHeight: '420px', minHeight: '420px', objectFit: 'cover', display: 'block', margin: '0 auto', marginLeft: '80px', width: '150%' }}
										priority
									/>
					</div>
				{loading && <div className="text-lg text-gray-700">Cargando prompts...</div>}
				{error && (
					<div className="text-red-600 font-semibold">
						Error: {error}
					</div>
				)}
				{/* Filter and sort controls - right aligned, improved styling */}
				<div className="w-full max-w-6xl mx-auto flex justify-end mb-6">
					<div className="flex flex-row gap-4 items-end">
						<div className="flex flex-col">
							<label className="text-xs font-semibold text-gray-700 mb-1" htmlFor="filter-tag">Tag</label>
							<select
								id="filter-tag"
								className="border rounded px-2 py-1 text-sm min-w-[100px] text-black bg-transparent focus:bg-white"
								style={{ borderColor: 'rgba(140,108,94,0.7)' }}
								value={selectedTag}
								onChange={e => setSelectedTag(e.target.value)}
							>
								<option value="">All</option>
								{allTags.map(tag => (
									<option key={tag} value={tag}>{tag}</option>
								))}
							</select>
						</div>
						<div className="flex flex-col">
							<label className="text-xs font-semibold text-gray-700 mb-1" htmlFor="filter-user">User</label>
							<select
								id="filter-user"
								className="border rounded px-2 py-1 text-sm min-w-[100px] text-black bg-transparent focus:bg-white"
								style={{ borderColor: 'rgba(140,108,94,0.7)' }}
								value={selectedUser}
								onChange={e => setSelectedUser(e.target.value)}
							>
								<option value="">All</option>
								{allUsers.map(user => (
									<option key={user} value={user}>{user}</option>
								))}
							</select>
						</div>
						<div className="flex flex-col">
							<label className="text-xs font-semibold text-gray-700 mb-1" htmlFor="sort-order">Sort</label>
							<select
								id="sort-order"
								className="border rounded px-2 py-1 text-sm min-w-[120px] text-black bg-transparent focus:bg-white"
								style={{ borderColor: 'rgba(140,108,94,0.7)' }}
								value={sortOrder}
								onChange={e => setSortOrder(e.target.value as 'desc' | 'asc')}
							>
								<option value="desc">Most Recent</option>
								<option value="asc">Oldest First</option>
							</select>
						</div>
					</div>
				</div>

				<div className="w-full max-w-6xl overflow-x-auto mt-0">
					<table className="min-w-full border-separate border-spacing-y-2">
						<thead className="sticky top-0 z-10" style={{ backgroundColor: '#738075' }}>
							<tr>
								<th className="px-4 py-3 text-left font-semibold uppercase border-b border-amber-300 text-white" style={{ fontSize: '0.9em' }}>Image</th>
								<th className="px-4 py-3 text-left font-semibold uppercase border-b border-amber-300 text-white" style={{ fontSize: '0.9em' }}>Prompt</th>
								<th className="px-4 py-3 text-left font-semibold uppercase border-b border-amber-300 text-white" style={{ fontSize: '0.9em' }}>Tags</th>
								<th className="px-4 py-3 text-left font-semibold uppercase border-b border-amber-300 text-white" style={{ fontSize: '0.9em' }}>User</th>
								<th className="px-4 py-3 text-left font-semibold uppercase border-b border-amber-300 text-white" style={{ fontSize: '0.9em' }}>Date</th>
							</tr>
						</thead>
						<tbody>
							{filteredPrompts.length === 0 && !loading && !error && (
								<tr>
									<td colSpan={5} className="text-center text-gray-500 text-lg py-12">No prompts found. Check your Supabase table or filters.</td>
								</tr>
							)}
							{filteredPrompts.map((prompt) => (
								<tr key={prompt.id} className="bg-white hover:bg-amber-50 transition-all border border-amber-100 rounded-lg shadow-sm">
									<td className="px-2 py-2 align-middle">
															{prompt.output_image ? (
																  <Image src={prompt.output_image} alt="Prompt output" width={64} height={64} className="w-16 h-16 object-cover rounded shadow border border-amber-200" onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = '/file.svg'; }} />
															) : (
											<span className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 border border-amber-100">No image</span>
										)}
									</td>
														<td className="px-4 py-2 max-w-[400px] whitespace-pre-line text-gray-800 text-sm font-medium align-top">
															<span>{prompt.prompt}</span>
															<button
																onClick={() => handleCopyPrompt(prompt.prompt)}
																title="Copy prompt"
																style={{ marginLeft: 8, verticalAlign: 'middle', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
															>
																<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
																	<rect x="7" y="7" width="9" height="9" rx="2" stroke="#b45309" strokeWidth="1.5" fill="#fff9eb"/>
																	<rect x="4" y="4" width="9" height="9" rx="2" stroke="#b45309" strokeWidth="1.5" fill="#fff9eb"/>
																</svg>
															</button>
														</td>
									<td className="px-4 py-2 align-top">
										<div className="flex flex-wrap gap-1">
											{prompt.tags && prompt.tags.length > 0 ? prompt.tags.map((tag: string) => (
												<span key={tag} className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">{tag}</span>
											)) : <span className="text-gray-400 text-xs">—</span>}
										</div>
									</td>
									<td className="px-4 py-2 align-top text-xs text-gray-700">{prompt.user || prompt.created_by || <span className="text-gray-400">—</span>}</td>
									<td className="px-4 py-2 align-top text-xs text-gray-500">{new Date(prompt.created_at).toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		);
}
