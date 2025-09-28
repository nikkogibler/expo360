
// Ensure 'use client' is at the very top
'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';

interface Product {
	id: string;
	name: string;
	sku: string;
	price: number;
	image_url: string;
	description?: string;
	is_active: boolean;
	category?: string;
	colección?: string;
	created_at: string;
	updated_at: string;
}

interface ProductCardProps {
	product: Product;
	index: number;
}

const containerVariants: Variants = {
	hidden: { opacity: 0, y: 50 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			stiffness: 100,
			damping: 10,
			delay: 0.2,
			staggerChildren: 0.1
		}
	}
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { 
		opacity: 1, 
		y: 0, 
		transition: { 
			type: 'spring', 
			stiffness: 100 
		} 
	}
};

const ProductCard = ({ product, index }: ProductCardProps) => {
	const [imageError, setImageError] = useState(false);
	const [imageLoading, setImageLoading] = useState(true);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [retryCount, setRetryCount] = useState(0);
	const [imageKey, setImageKey] = useState(0);
	const [loadingProgress, setLoadingProgress] = useState(0);

	const formatCurrency = (amount: number) => {
		return `$${new Intl.NumberFormat('es-MX', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount)} MXN`;
	};

	const handleImageError = useCallback(() => {
		if (retryCount < 2) {
			const retryDelay = Math.pow(2, retryCount) * 800;
			setTimeout(() => {
				setRetryCount(prev => prev + 1);
				setImageError(false);
				setImageLoading(true);
				setImageKey(prev => prev + 1);
				setLoadingProgress(0);
			}, retryDelay);
		} else {
			setImageError(true);
			setImageLoading(false);
			setImageLoaded(false);
			setLoadingProgress(0);
		}
	}, [product.image_url, retryCount]);

	const handleImageLoad = useCallback(() => {
		setImageError(false);
		setImageLoading(false);
		setImageLoaded(true);
		setLoadingProgress(100);
	}, [product.image_url]);

	useEffect(() => {
		setImageError(false);
		setImageLoading(true);
		setImageLoaded(false);
		setRetryCount(0);
		setImageKey(0);
		setLoadingProgress(0);
	}, [product.image_url]);

	return (
		<Link href={`/evento-especial/catalogo/${product.sku}`} passHref>
			<motion.div
				className="bg-white p-4 rounded-lg shadow-md border border-gray-100 cursor-pointer overflow-hidden relative group"
				variants={itemVariants}
				initial="hidden"
				animate="visible"
				whileHover={{ scale: 1.02 }}
				transition={{ type: 'spring', stiffness: 300, damping: 10 }}
			>
				<div className="relative w-full h-64 sm:h-72 md:h-64 lg:h-72 mb-4 overflow-hidden rounded-md bg-white">
					{imageLoading && !imageError && (
						<div className="absolute inset-0 flex items-center justify-center bg-white z-20">
							<div className="text-center">
								<div className="relative w-8 h-8 mx-auto mb-2">
									<div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-100"></div>
								</div>
								<p className="text-xs text-gray-500 font-medium">
									{retryCount > 0 ? `Reintentando (${retryCount + 1}/3)...` : `Cargando... ${Math.round(loadingProgress)}%`}
								</p>
							</div>
						</div>
					)}
					{!imageError && product.image_url ? (
						<Image
							key={`product-${product.id}-${imageKey}`}
							src={product.image_url}
							alt={product.name}
							fill
							sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
							className={`object-contain transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
							onError={handleImageError}
							onLoad={handleImageLoad}
							priority={index < 6}
							quality={index < 6 ? 85 : 75}
							unoptimized={false}
							loading={index < 6 ? "eager" : "lazy"}
							placeholder="blur"
							blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center bg-white">
							<Image
								src="/expo_mueble.png"
								alt={`${product.name} - Imagen de muestra`}
								fill
								sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
								className="object-contain transition-transform duration-300 group-hover:scale-105 opacity-60"
								priority={index < 6}
								loading={index < 6 ? "eager" : "lazy"}
							/>
							<div className="absolute inset-0 bg-white bg-opacity-5 flex items-center justify-center">
								<span className="text-xs text-gray-500 bg-white bg-opacity-95 px-2 py-1 rounded shadow-sm">
									Imagen no disponible
								</span>
							</div>
						</div>
					)}
					<div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-semibold z-30">
						{formatCurrency(product.price)}
					</div>
				</div>
				<div className="space-y-2">
					<h3 className="text-lg font-semibold text-gray-800 line-clamp-2 min-h-[3rem]">
						{product.name}
					</h3>
					<p className="text-sm text-gray-500 uppercase tracking-wide">
						SKU: {product.sku}
					</p>
					{product.description && (
						<p className="text-sm text-gray-600 line-clamp-2">
							{product.description}
						</p>
					)}
					<div className="flex flex-wrap gap-2">
						{product.category && (
							<span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
								{product.category}
							</span>
						)}
						{product.colección && (
							<span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs">
								✨ {product.colección}
							</span>
						)}
					</div>
				</div>
			</motion.div>
		</Link>
	);
};

export default function EventoEspecialCatalogPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [selectedCollection, setSelectedCollection] = useState<string>('all');
	const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('name');
	const [categories, setCategories] = useState<string[]>([]);
	const [collections, setCollections] = useState<string[]>([]);

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { data: productsData, error: productsError } = await supabase
				.from('products')
				.select('*')
				.eq('is_active', true)
				.order('name', { ascending: true });
			if (productsError) throw productsError;
			const typedProducts = (productsData as Product[]).filter(product => !product.name.startsWith('XX'));
			setProducts(typedProducts);
			setFilteredProducts(typedProducts);
			const uniqueCategories = [...new Set(typedProducts.map(p => p.category).filter(Boolean))] as string[];
			setCategories(uniqueCategories.sort());
			const uniqueCollections = [...new Set(typedProducts.map(p => p.colección).filter(collection => collection && collection.trim() !== ''))] as string[];
			setCollections(uniqueCollections.sort());
		} catch (err: unknown) {
			let errorMessage = 'Error al cargar los productos.';
			if (err instanceof Error) errorMessage = err.message;
			else if (typeof err === 'object' && err !== null && 'message' in err) errorMessage = (err as PostgrestError).message;
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	}, []);

	const filterAndSortProducts = useCallback(() => {
		let filtered = [...products];
		if (searchTerm) {
			filtered = filtered.filter(product =>
				product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.colección?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		if (selectedCategory !== 'all') {
			filtered = filtered.filter(product => product.category === selectedCategory);
		}
		if (selectedCollection !== 'all') {
			filtered = filtered.filter(product => product.colección === selectedCollection);
		}
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'price':
					return a.price - b.price;
				case 'newest':
					return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
				case 'name':
				default:
					return a.name.localeCompare(b.name);
			}
		});
		setFilteredProducts(filtered);
	}, [products, searchTerm, selectedCategory, selectedCollection, sortBy]);

	useEffect(() => { fetchProducts(); }, [fetchProducts]);
	useEffect(() => { filterAndSortProducts(); }, [filterAndSortProducts]);

	return (
		<>
			<Head>
				<title>Catálogo Especial | Kusam Evento</title>
				<meta name="description" content="Catálogo especial para evento Kusam." />
			</Head>
			<div className="relative min-h-screen flex flex-col p-4 pt-10 pb-10">
				<div className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('/vine_2b.png')`, opacity: 1, zIndex: -1 }} />
				<motion.div className="max-w-7xl mx-auto w-full relative z-10" variants={containerVariants} initial="hidden" animate="visible" role="main" aria-label="Catálogo de productos">
					<header className="text-center mb-8">
						<div className="mb-6">
							<Image src="/kusam_main.webp" alt="Kusam Evento Especial" width={200} height={50} priority className="mx-auto" />
						</div>
						<div className="mb-6 w-full">
							<Image src="/catalog_header1.png" alt="Catálogo de productos - Evento Especial" width={800} height={200} priority className="w-full h-auto object-contain" />
						</div>
					</header>
					<section className="p-6 rounded-lg shadow-md border border-gray-200 mb-8 relative" style={{ backgroundImage: `url('/vine_2.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} aria-label="Buscar y filtrar productos">
						<div className="flex flex-col gap-4 relative z-10">
							<div className="flex-1">
								<input id="product-search" type="text" placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border-2 border-amber-950 rounded-md focus:ring-2 focus:ring-amber-950 focus:border-amber-950 text-amber-950 placeholder-amber-950 bg-transparent" />
							</div>
							<div className="flex flex-col md:flex-row gap-4 items-center">
								<div className="flex-1">
									<select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white">
										<option value="all" className="text-black">Todas las categorías</option>
										{categories.map(category => (<option key={category} value={category} className="text-black">{category}</option>))}
									</select>
								</div>
								<div className="flex-1">
									<select value={selectedCollection} onChange={(e) => setSelectedCollection(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white">
										<option value="all" className="text-black">Todas las colecciones</option>
										{collections.map(collection => (<option key={collection} value={collection} className="text-black">{collection}</option>))}
									</select>
								</div>
								<div className="flex-1">
									<select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'newest')} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white">
										<option value="name" className="text-black">Nombre</option>
										<option value="price" className="text-black">Precio</option>
										<option value="newest" className="text-black">Más Recientes</option>
									</select>
								</div>
							</div>
							<div className="text-sm text-gray-600">Mostrando {filteredProducts.length} de {products.length} productos</div>
							{(selectedCategory !== 'all' || selectedCollection !== 'all' || searchTerm) && (
								<button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedCollection('all'); }} className="self-start px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">Limpiar Filtros</button>
							)}
						</div>
					</section>
					<main role="main" aria-label="Lista de productos">
						{loading ? (
							<section className="text-center py-20" aria-label="Cargando productos">
								<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
								<p className="text-gray-600 text-lg mt-4">Cargando productos...</p>
							</section>
						) : error ? (
							<div className="text-center py-20">
								<p className="text-red-600 text-lg">{error}</p>
								<button onClick={fetchProducts} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Reintentar</button>
							</div>
						) : filteredProducts.length === 0 ? (
							<div className="text-center py-20">
								<p className="text-gray-600 text-lg">No se encontraron productos que coincidan con tu búsqueda.</p>
								<button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedCollection('all'); }} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Limpiar Filtros</button>
							</div>
						) : (
							<motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" variants={containerVariants}>
								{filteredProducts.map((product, index) => (
									<ProductCard key={product.id} product={product} index={index} />
								))}
							</motion.div>
						)}
					</main>
				</motion.div>
			</div>
		</>
	);
}
