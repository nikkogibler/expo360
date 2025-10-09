"use client";
import React, { useEffect, useState } from "react";
import { assignTagsToPrompt } from '../../../../utils/promptTags';

import BurgerMenu from "../../../../components/BurgerMenu";
import AdminMenu from "../../../../components/AdminMenu";
import CompactTagDropdown from "../../../../components/CompactTagDropdown";
import ClickableImageThumbnail from "../../../../components/ClickableImageThumbnail";
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
	const [burgerOpen, setBurgerOpen] = useState(false);
	
	// Multi-select state
	const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(new Set());
	const [isSelectMode, setIsSelectMode] = useState(false);

	// Collapsed rows state
	const [collapsedRows, setCollapsedRows] = useState<Set<string>>(new Set());
	const [allCollapsed, setAllCollapsed] = useState(false);

	// Toggle individual row collapse
	const toggleRowCollapse = (promptId: string) => {
		setCollapsedRows(prev => {
			const newSet = new Set(prev);
			if (newSet.has(promptId)) {
				newSet.delete(promptId);
			} else {
				newSet.add(promptId);
			}
			return newSet;
		});
	};

	// Toggle all rows collapse
	const toggleAllCollapse = () => {
		if (allCollapsed) {
			setCollapsedRows(new Set());
			setAllCollapsed(false);
		} else {
			const allIds = filteredPrompts.map(p => p.id);
			setCollapsedRows(new Set(allIds));
			setAllCollapsed(true);
		}
	};

	// Shared image gallery state - fetch once, reuse for all thumbnails
	const [galleryImages, setGalleryImages] = useState<Array<{ name: string; url: string; thumbnailUrl: string; created_at: string }>>([]);
	const [galleryLoading, setGalleryLoading] = useState(true);
	const [galleryError, setGalleryError] = useState<string | null>(null);

	// Fetch gallery images once on mount
	useEffect(() => {
		fetchGalleryImages();
	}, []);

	const fetchGalleryImages = async () => {
		try {
			setGalleryLoading(true);
			setGalleryError(null);

			// List all images from the product-images bucket
			const { data: files, error: listError } = await supabase.storage
				.from('product-images')
				.list('', { 
					limit: 200, 
					sortBy: { column: 'created_at', order: 'desc' }
				});

			if (listError) {
				throw listError;
			}

			// Filter for image files and generate public URLs (excluding thumbnails folder)
			const imageFiles = files
				.filter(file => {
					const isImage = file.name.match(/\.(png|jpg|jpeg|webp|gif)$/i);
					const notThumbnailFolder = file.name !== 'thumbnails';
					return isImage && notThumbnailFolder;
				})
				.map(file => {
					// Get the full-size image URL
					const { data: urlData } = supabase.storage
						.from('product-images')
						.getPublicUrl(file.name);
					
					// Try to get thumbnail URL (thumbnails folder)
					const { data: thumbnailData } = supabase.storage
						.from('product-images')
						.getPublicUrl(`thumbnails/${file.name}`);
					
					return {
						name: file.name,
						url: urlData.publicUrl,
						thumbnailUrl: thumbnailData.publicUrl, // Use for display
						created_at: file.created_at || ''
					};
				});

			setGalleryImages(imageFiles);
		} catch (err) {
			console.error('Error fetching gallery images:', err);
			setGalleryError(err instanceof Error ? err.message : 'Failed to load gallery images');
		} finally {
			setGalleryLoading(false);
		}
	};

	// Toggle select mode
	const toggleSelectMode = () => {
		setIsSelectMode(!isSelectMode);
		setSelectedPrompts(new Set());
	};

	// Toggle individual prompt selection
	const togglePromptSelection = (promptId: string) => {
		setSelectedPrompts(prev => {
			const newSet = new Set(prev);
			if (newSet.has(promptId)) {
				newSet.delete(promptId);
			} else {
				newSet.add(promptId);
			}
			return newSet;
		});
	};

	// Select all visible prompts
	const selectAllPrompts = () => {
		const allIds = filteredPrompts.map(p => p.id);
		setSelectedPrompts(new Set(allIds));
	};

	// Deselect all prompts
	const deselectAllPrompts = () => {
		setSelectedPrompts(new Set());
	};

	// Bulk delete selected prompts
	const handleBulkDelete = async () => {
		if (selectedPrompts.size === 0) {
			alert('No prompts selected');
			return;
		}

		const confirmed = window.confirm(
			`Are you sure you want to delete ${selectedPrompts.size} prompt(s)?\n\nThis action cannot be undone.`
		);

		if (!confirmed) {
			return;
		}

		try {
			const deletePromises = Array.from(selectedPrompts).map(async (promptId) => {
				const response = await fetch('/api/delete-prompt', {
					method: 'DELETE',
					headers: { 
						'Content-Type': 'application/json',
						'Referer': window.location.href
					},
					body: JSON.stringify({ promptId })
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
					throw new Error(`Failed to delete ${promptId}: ${errorData.error}`);
				}

				return promptId;
			});

			const deletedIds = await Promise.all(deletePromises);
			
			// Remove deleted prompts from local state
			setPrompts(prevPrompts => prevPrompts.filter(prompt => !deletedIds.includes(prompt.id)));
			
			// Clear selection and exit select mode
			setSelectedPrompts(new Set());
			setIsSelectMode(false);
			
			alert(`Successfully deleted ${deletedIds.length} prompt(s)`);
		} catch (error) {
			console.error('Error during bulk delete:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			alert(`Failed to delete some prompts: ${errorMessage}`);
		}
	};

	// Handle tag updates for individual prompts
	const handleTagsUpdate = (promptId: string, newTags: string[]) => {
		setPrompts(prevPrompts => 
			prevPrompts.map(prompt => 
				prompt.id === promptId 
					? { ...prompt, tags: newTags }
					: prompt
			)
		);
	};

	// Handle image updates for individual prompts
	const handleImageUpdate = (promptId: string, newImageUrl: string) => {
		console.log('handleImageUpdate called:', { promptId, newImageUrl });
		setPrompts(prevPrompts => 
			prevPrompts.map(prompt => 
				prompt.id === promptId 
					? { ...prompt, output_image: newImageUrl }
					: prompt
			)
		);
	};

	// Handle prompt deletion
	const handleDeletePrompt = async (promptId: string, promptText: string) => {
		// Show confirmation dialog
		const truncatedPrompt = promptText.length > 50 ? promptText.substring(0, 50) + '...' : promptText;
		const confirmed = window.confirm(`Are you sure you want to delete this prompt?\n\n"${truncatedPrompt}"\n\nThis action cannot be undone.`);
		
		if (!confirmed) {
			return;
		}

		try {
			const response = await fetch('/api/delete-prompt', {
				method: 'DELETE',
				headers: { 
					'Content-Type': 'application/json',
					'Referer': window.location.href
				},
				body: JSON.stringify({ promptId })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `HTTP ${response.status}: Failed to delete prompt`);
			}

			// Remove the prompt from local state
			setPrompts(prevPrompts => prevPrompts.filter(prompt => prompt.id !== promptId));
			
			console.log(`Successfully deleted prompt ${promptId}`);
		} catch (error) {
			console.error('Error deleting prompt:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			alert(`Failed to delete prompt: ${errorMessage}`);
		}
	};

			useEffect(() => {
				const fetchPrompts = async () => {
					setLoading(true);
					setError(null);
					// Fetch prompts
					const { data, error } = await supabase
						.from("image_prompts")
						.select("prompt_id, created_at, prompt_text, tokens_used, output_image, user, tela, estructura, tags")
						.order("created_at", { ascending: false });
					if (error) {
						setError(error.message);
						setPrompts([]);
						setLoading(false);
						return;
					}
							// Process and map the data
									const processedPrompts = (Array.isArray(data) ? data : []).map((row: {
														prompt_id: string;
														prompt_text: string;
														user?: string;
														created_at: string;
														tokens_used?: number;
														output_image?: string;
														tela?: string;
														estructura?: string;
														tags?: string[] | null;
													}) => {
														// Handle JSONB tags column - it might be null, empty array, or valid array
														let tagsFromDB: string[] = [];
														if (row.tags) {
															if (Array.isArray(row.tags)) {
																tagsFromDB = row.tags.filter(tag => tag && typeof tag === 'string');
															}
														}
														
														// If no valid tags from DB, generate them
														const finalTags = tagsFromDB.length > 0 ? tagsFromDB : assignTagsToPrompt(row.prompt_text);
														
														return {
															id: String(row.prompt_id ?? ''),
															prompt: String(row.prompt_text ?? ''),
															tags: finalTags,
															created_by: typeof row.user === 'string' ? row.user : undefined,
															created_at: String(row.created_at ?? ''),
															tokens_used: typeof row.tokens_used === 'number' ? row.tokens_used : undefined,
															output_image: typeof row.output_image === 'string' ? row.output_image : undefined,
															user: typeof row.user === 'string' ? row.user : undefined,
															tela: typeof row.tela === 'string' ? row.tela : undefined,
															estructura: typeof row.estructura === 'string' ? row.estructura : undefined,
														};
													});

									setPrompts(processedPrompts);
									
									// Debug: Log tag statistics and image URL issues
									const tagStats = processedPrompts.reduce((acc, prompt) => {
										if (prompt.tags && prompt.tags.length > 0) {
											acc.withTags++;
											acc.totalTags += prompt.tags.length;
										} else {
											acc.withoutTags++;
										}
										return acc;
									}, { withTags: 0, withoutTags: 0, totalTags: 0 });
									
									// Check for problematic image URLs
									const imageStats = processedPrompts.reduce((acc, prompt) => {
										if (prompt.output_image) {
											acc.withImages++;
											// Check if URL looks problematic
											if (prompt.output_image.includes('---') || prompt.output_image.includes('kusam-furniture--') || prompt.output_image.includes('---1759')) {
												acc.problematicUrls++;
												if (acc.problematicUrls <= 3) { // Log first 3 for debugging
													console.warn('Problematic image URL detected:', prompt.output_image);
												}
											}
										} else {
											acc.withoutImages++;
										}
										return acc;
									}, { withImages: 0, withoutImages: 0, problematicUrls: 0 });
									
									console.log('Data Statistics:', {
										total: processedPrompts.length,
										tags: {
											withTags: tagStats.withTags,
											withoutTags: tagStats.withoutTags,
											averageTagsPerPrompt: tagStats.withTags > 0 ? (tagStats.totalTags / tagStats.withTags).toFixed(1) : 0
										},
										images: {
											withImages: imageStats.withImages,
											withoutImages: imageStats.withoutImages,
											problematicUrls: imageStats.problematicUrls
										}
									});
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
											<div className="flex flex-row items-center" style={{ position: 'relative' }}>
												<BurgerMenu isOpen={burgerOpen} onClick={() => setBurgerOpen((o) => !o)} />
												<AdminMenu open={burgerOpen} setOpen={setBurgerOpen} currentPage="prompts" />
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
								className="border rounded px-2 py-1 text-sm min-w-[180px] text-black bg-transparent focus:bg-white"
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
						
						{/* Collapse All button */}
						<div className="flex flex-col">
							<label className="text-xs font-semibold text-gray-700 mb-1">&nbsp;</label>
							<button
								onClick={toggleAllCollapse}
								className="border rounded px-3 py-1 text-sm text-black bg-transparent hover:bg-white transition-colors"
								style={{ borderColor: 'rgba(140,108,94,0.7)' }}
								title={allCollapsed ? "Expand all rows" : "Collapse all rows"}
							>
								{allCollapsed ? '⬇ Expand All' : '⬆ Collapse All'}
							</button>
						</div>

						{/* Select Multiple button */}
						<div className="flex flex-col">
							<label className="text-xs font-semibold text-gray-700 mb-1">&nbsp;</label>
							<button
								onClick={toggleSelectMode}
								className="border rounded px-3 py-1 text-sm text-black bg-transparent hover:bg-white transition-colors font-semibold"
								style={{ borderColor: 'rgba(140,108,94,0.7)' }}
							>
								{isSelectMode ? '✕ Cancel Select' : '☑ Select Multiple'}
							</button>
						</div>
					</div>
				</div>

				{/* Bulk actions toolbar */}
				{isSelectMode && (
					<div className="w-full max-w-6xl mx-auto bg-amber-50 border rounded-lg p-4 mb-4 flex items-center justify-between" style={{ borderColor: 'rgba(140,108,94,0.7)' }}>
						<div className="flex items-center gap-4">
							<span className="text-sm font-semibold" style={{ color: '#8C6C5E' }}>
								{selectedPrompts.size} selected
							</span>
							<button
								onClick={selectAllPrompts}
								className="text-sm px-3 py-1 rounded transition-colors border"
								style={{ 
									borderColor: 'rgba(140,108,94,0.7)',
									backgroundColor: 'transparent',
									color: '#8C6C5E'
								}}
								onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(140,108,94,0.1)'}
								onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
							>
								Select All ({filteredPrompts.length})
							</button>
							<button
								onClick={deselectAllPrompts}
								className="text-sm px-3 py-1 rounded transition-colors border"
								style={{ 
									borderColor: 'rgba(140,108,94,0.7)',
									backgroundColor: 'transparent',
									color: '#8C6C5E'
								}}
								onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(140,108,94,0.1)'}
								onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
							>
								Deselect All
							</button>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={handleBulkDelete}
								disabled={selectedPrompts.size === 0}
								className="px-4 py-2 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed border"
								style={{ 
									backgroundColor: '#C13C3C',
									borderColor: '#A02C2C'
								}}
								onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#A02C2C')}
								onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#C13C3C')}
							>
								🗑 Delete ({selectedPrompts.size})
							</button>
						</div>
					</div>
				)}

				<div className="w-full max-w-6xl overflow-x-auto mt-0">
					<table className="min-w-full border-separate border-spacing-y-2">
						<thead className="sticky top-0 z-10" style={{ backgroundColor: '#738075' }}>
							<tr>
								{isSelectMode && (
									<th className="px-4 py-3 text-left font-semibold uppercase border-b border-amber-300 text-white w-[50px]" style={{ fontSize: '0.9em' }}>
										<input
											type="checkbox"
											checked={selectedPrompts.size === filteredPrompts.length && filteredPrompts.length > 0}
											onChange={(e) => e.target.checked ? selectAllPrompts() : deselectAllPrompts()}
											className="w-4 h-4 cursor-pointer"
										/>
									</th>
								)}
								<th className="px-4 py-3 text-left font-semibold uppercase border-b border-amber-300 text-white w-[80px]" style={{ fontSize: '0.9em' }}>Image</th>
								<th className="px-4 py-3 text-left font-semibold uppercase border-b border-amber-300 text-white" style={{ fontSize: '0.9em' }}>Prompt</th>
								<th className="px-4 py-3 text-left font-semibold uppercase border-b border-amber-300 text-white w-[140px]" style={{ fontSize: '0.9em' }}>Tags</th>
								<th className="px-4 py-3 text-left font-semibold uppercase border-b border-amber-300 text-white w-[100px]" style={{ fontSize: '0.9em' }}>User</th>
								<th className="px-4 py-3 text-left font-semibold uppercase border-b border-amber-300 text-white w-[120px]" style={{ fontSize: '0.9em' }}>Date</th>
								<th className="px-4 py-3 text-left font-semibold uppercase border-b border-amber-300 text-white w-[80px]" style={{ fontSize: '0.9em' }}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredPrompts.length === 0 && !loading && !error && (
								<tr>
									<td colSpan={isSelectMode ? 7 : 6} className="text-center text-gray-500 text-lg py-12">No prompts found. Check your Supabase table or filters.</td>
								</tr>
							)}
							{filteredPrompts.map((prompt) => {
								const isCollapsed = collapsedRows.has(prompt.id);
								return (
								<tr key={prompt.id} className="bg-white hover:bg-amber-50 transition-all border border-amber-100 rounded-lg shadow-sm">
									{isSelectMode && (
										<td className="px-4 py-2 align-middle w-[50px]">
											<input
												type="checkbox"
												checked={selectedPrompts.has(prompt.id)}
												onChange={() => togglePromptSelection(prompt.id)}
												className="w-4 h-4 cursor-pointer"
											/>
										</td>
									)}
									<td className="px-2 py-2 align-middle w-[80px]">
										{!isCollapsed && (
											<ClickableImageThumbnail
												key={`${prompt.id}-${prompt.output_image}`}
												promptId={prompt.id}
												currentImageUrl={prompt.output_image}
												onImageUpdate={(newImageUrl) => handleImageUpdate(prompt.id, newImageUrl)}
												width={64}
												height={64}
												className="w-16 h-16"
												promptText={prompt.prompt}
												galleryImages={galleryImages}
												galleryLoading={galleryLoading}
												galleryError={galleryError}
											/>
										)}
									</td>
														<td className="px-4 py-2 max-w-[400px] text-gray-800 text-sm font-medium align-top">
															<div className="flex items-start gap-2">
																{/* Collapse toggle button */}
																<button
																	onClick={() => toggleRowCollapse(prompt.id)}
																	className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0 mt-0.5"
																	title={isCollapsed ? "Expand row" : "Collapse row"}
																>
																	{isCollapsed ? '▶' : '▼'}
																</button>
																<div className="flex-1">
																	<span className={isCollapsed ? 'line-clamp-1' : 'whitespace-pre-line'}>{prompt.prompt}</span>
																	{!isCollapsed && (
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
																	)}
																</div>
															</div>
														</td>
									<td className="px-4 py-2 align-top w-[140px]">
										<CompactTagDropdown
											promptId={prompt.id}
											tags={prompt.tags || []}
											onTagsUpdate={(newTags: string[]) => handleTagsUpdate(prompt.id, newTags)}
											className="w-full"
										/>
									</td>
									<td className="px-4 py-2 align-top text-xs text-gray-700 w-[100px]">{prompt.user || prompt.created_by || <span className="text-gray-400">—</span>}</td>
									<td className="px-4 py-2 align-top text-xs text-gray-500 w-[120px]">{new Date(prompt.created_at).toLocaleString()}</td>
									<td className="px-4 py-2 align-top w-[80px]">
										<button
											onClick={() => handleDeletePrompt(prompt.id, prompt.prompt)}
											title="Delete prompt"
											className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
										>
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<polyline points="3,6 5,6 21,6"></polyline>
												<path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
												<line x1="10" y1="11" x2="10" y2="17"></line>
												<line x1="14" y1="11" x2="14" y2="17"></line>
											</svg>
										</button>
									</td>
								</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		);
}
