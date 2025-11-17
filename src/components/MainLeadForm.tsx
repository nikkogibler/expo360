
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import type { Variants } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

const getFlagEmoji = (countryCode: string) => {
	if (countryCode === 'OT') return '🌐';
	if (!countryCode) return '';
	const codePoints = countryCode
		.toUpperCase()
		.split('')
		.map((char) => 0x1f1e6 + (char.charCodeAt(0) - 'A'.charCodeAt(0)));
	return String.fromCodePoint(...codePoints);
};

interface CountryCode {
	name: string;
	dial_code: string;
	code: string;
	emoji?: string;
}

const countryCodes: CountryCode[] = [
	{ name: 'México', dial_code: '+52', code: 'MX' },
	{ name: 'Estados Unidos', dial_code: '+1', code: 'US' },
	{ name: 'Canadá', dial_code: '+1', code: 'CA' },
	{ name: 'Argentina', dial_code: '+54', code: 'AR' },
	{ name: 'Colombia', dial_code: '+57', code: 'CO' },
	{ name: 'España', dial_code: '+34', code: 'ES' },
	{ name: 'Brasil', dial_code: '+55', code: 'BR' },
	{ name: 'Chile', dial_code: '+56', code: 'CL' },
	{ name: 'Perú', dial_code: '+51', code: 'PE' },
	{ name: 'Otro', dial_code: '', code: 'OT' }
];

countryCodes.forEach(country => {
	country.emoji = getFlagEmoji(country.code);
});

export type MainLeadFormVariant = 
		| 'kusam' 
		| 'saltillo' 
		| 'vasconcelos'
		| 'evento-especial'
		| 'salone-del-mobile-milan'
		| 'casual-market-atlanta'
		| 'ciff-copenhagen'
		| 'movelsul-brazil'
		| 'spoga-gafa-cologne';

interface MainLeadFormProps {
		variant?: MainLeadFormVariant;
		hideEmail?: boolean;
}

// Map variants to customer-friendly landing source names
const VARIANT_TO_LANDING_SOURCE: Record<MainLeadFormVariant, string> = {
		'kusam': 'Expo Mueble Internacional',
		'saltillo': 'Tienda Saltillo',
		'vasconcelos': 'Tienda Vasconcelos',
		'evento-especial': 'Evento Especial',
		'salone-del-mobile-milan': 'Salone del Mobile Milan',
		'casual-market-atlanta': 'Casual Market Atlanta',
		'ciff-copenhagen': 'CIFF Copenhagen',
		'movelsul-brazil': 'Movelsul Brazil',
		'spoga-gafa-cologne': 'Spoga+Gafa Cologne'
};

const getInstructionsPath = (customerId?: string) => {
	return `/kusam/instructions${customerId ? `?customer_id=${customerId}` : ''}`;
};

const MainLeadForm = ({ variant = 'kusam', hideEmail = false }: MainLeadFormProps) => {
						const [name, setName] = useState('');
						const [localWhatsapp, setLocalWhatsapp] = useState('');
						const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
						const [email, setEmail] = useState('');
						const [customerType, setCustomerType] = useState('');
						const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
						const [isDropdownOpen, setIsDropdownOpen] = useState(false);
						const [isLoadingCustomerStatus, setIsLoadingCustomerStatus] = useState(true);

						const router = useRouter();
						const pathname = usePathname();
						const searchParams = useSearchParams();
						const dropdownRef = useRef<HTMLDivElement>(null);
						const redirectFrom = searchParams.get('redirect_from');

		// Clear customer session if ?clear_session=true is present
		useEffect(() => {
			if (searchParams.get('clear_session') === 'true') {
				// Remove customer ID from localStorage
				localStorage.removeItem('kusam_customer_id');
				// Optionally clear customer Supabase session (do NOT log out admin)
				// If you store customer auth separately, clear it here
				// Reset other customer-related state if needed
				setCurrentCustomerId(null);
				setName('');
				setEmail('');
				setCustomerType('');
				setLocalWhatsapp('');
				setSelectedCountry(countryCodes[0]);
			}
		}, [searchParams]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [dropdownRef]);

	useEffect(() => {
		const initializeCustomer = async () => {
			let currentCustomerId = localStorage.getItem('kusam_customer_id');
			if (!currentCustomerId) {
				currentCustomerId = uuidv4();
				localStorage.setItem('kusam_customer_id', currentCustomerId);
			}
			setCurrentCustomerId(currentCustomerId);
			try {
				const { data: existingCustomer, error: fetchError } = await supabase
					.from('customers')
					.select('*')
					.eq('customer_id', currentCustomerId)
					.maybeSingle();
				if (fetchError) throw new Error(`Error fetching customer data: ${fetchError.message}`);
				console.log('[MainLeadForm] Existing customer:', existingCustomer);
				if (existingCustomer) {
					// Helper function to check if customer name is anonymous
					const isAnonymousName = (name: string | null | undefined): boolean => {
						if (!name) return true;
						return name.startsWith('Visitante Anónimo');
					};
					
					const isFullyRegistered = existingCustomer.name &&
						!isAnonymousName(existingCustomer.name) &&
						(existingCustomer.email !== undefined && existingCustomer.email !== null && !existingCustomer.email.endsWith('@temp.com')) &&
						existingCustomer.whatsapp &&
						existingCustomer.customer_type;
					console.log('[MainLeadForm] isFullyRegistered:', isFullyRegistered);
					if (isFullyRegistered) {
						   console.log('[MainLeadForm] DEBUG: variant:', variant, 'isFullyRegistered:', isFullyRegistered);
						   // For 'evento-especial', do NOT redirect, always show the form
						   if (variant === 'evento-especial') {
							   // Do nothing, just show the form
							   return;
						   } else if (variant === 'saltillo' || variant === 'vasconcelos') {
							   const cameFromAdmin = redirectFrom && redirectFrom.startsWith('/admin');
							   if (cameFromAdmin) {
								   router.push(`/admin/catalogo?customer_id=${currentCustomerId}`);
							   } else {
								   router.push(`/kusam/catalogo?customer_id=${currentCustomerId}`);
							   }
							   return;
						   } else if (variant === 'kusam') {
							   router.push(getInstructionsPath(currentCustomerId));
							   return;
						   }
					} else {
						if (isAnonymousName(existingCustomer.name)) {
							console.log('[MainLeadForm] Customer is anonymous, showing form.');
						}
						setName(isAnonymousName(existingCustomer.name) ? '' : existingCustomer.name || '');
						setEmail(existingCustomer.email?.endsWith('@temp.com') ? '' : existingCustomer.email || '');
						setCustomerType(existingCustomer.customer_type || '');
						const existingWhatsapp = existingCustomer.whatsapp || '';
						if (existingWhatsapp) {
							const parts = existingWhatsapp.split(' ');
							if (parts.length >= 2) {
								const countryMatch = countryCodes.find(c => c.dial_code === parts[0]);
								if (countryMatch) {
									setSelectedCountry(countryMatch);
									setLocalWhatsapp(parts.slice(1).join(' '));
								} else {
									setLocalWhatsapp(existingWhatsapp);
								}
							} else {
								setLocalWhatsapp(existingWhatsapp);
							}
						}
					}
			} else {
				console.log('[MainLeadForm] No customer found, showing blank form.');
					setName('');
					setEmail('');
					setCustomerType('');
				}
		} catch (error) {
			console.error('[MainLeadForm] Error initializing customer:', error);
			}
			setIsLoadingCustomerStatus(false);
		};
		initializeCustomer();
	}, [pathname, router, searchParams, redirectFrom, variant]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const fullWhatsappNumber = selectedCountry.dial_code === '' ? localWhatsapp : `${selectedCountry.dial_code}${localWhatsapp}`;
		if (variant === 'evento-especial') {
			if (!name || !fullWhatsappNumber || !customerType) {
				alert('Por favor, ingrese su nombre, WhatsApp y seleccione su industria.');
				return;
			}
		} else {
			if (!name || !fullWhatsappNumber || !email || !customerType) {
				alert('Por favor, complete todos los campos.');
				return;
			}
		}
		const sourceQrCode = searchParams.get('source_qr_code');
		if (currentCustomerId === null) {
			alert('Error de sesión. Por favor, recargue la página.');
			return;
		}
		const customerIdToUse = currentCustomerId;
		const { data: existingCustomerCheck, error: fetchError } = await supabase
			.from('customers')
			.select('customer_id')
			.eq('customer_id', customerIdToUse)
			.maybeSingle();
		if (fetchError && fetchError.code !== 'PGRST116') {
			alert('Hubo un error de base de datos. Por favor, intente de nuevo.');
			return;
		}
	// Removed unused variables: customerOpResult, opType
		if (existingCustomerCheck) {
			// opType = 'update';
			const { error } = await supabase
				.from('customers')
				.update({
					name,
					whatsapp: fullWhatsappNumber,
					email: email || '',
					customer_type: customerType || '',
					landing_source: VARIANT_TO_LANDING_SOURCE[variant]
				})
				.eq('customer_id', customerIdToUse)
				.select();
			if (error) {
				alert('Hubo un error al actualizar sus datos. Por favor, intente de nuevo.');
				return;
			}
			// customerOpResult = data;
		} else {
			// opType = 'insert';
			const { error } = await supabase
				.from('customers')
				.insert({
					customer_id: customerIdToUse,
					name,
					whatsapp: fullWhatsappNumber,
					email: email || '',
					customer_type: customerType || '',
					landing_source: VARIANT_TO_LANDING_SOURCE[variant]
				})
				.select();
			if (error) {
				alert('Hubo un error al registrar sus datos. Por favor, intente de nuevo.');
				return;
			}
			// customerOpResult = data;
		}
		if (sourceQrCode) {
			await supabase
				.from('customer_qr_scans')
				.insert({ customer_id: customerIdToUse, source_qr_code: sourceQrCode });
		}
		const redirectParams = new URLSearchParams(searchParams.toString());
		redirectParams.delete('redirect_from');
		redirectParams.delete('clear_session'); // Remove clear_session param after registration

		// Check variant to determine redirect path
		let defaultRedirectPath;
		if (variant === 'saltillo' || variant === 'vasconcelos') {
			const cameFromAdmin = redirectFrom && redirectFrom.startsWith('/admin');
			if (cameFromAdmin) {
				defaultRedirectPath = `/admin/catalogo?customer_id=${customerIdToUse}`;
			} else {
				defaultRedirectPath = `/kusam/catalogo?customer_id=${customerIdToUse}`;
			}
		} else if (variant === 'evento-especial') {
			defaultRedirectPath = `/kusam/catalogo?customer_id=${customerIdToUse}`;
		} else {
			defaultRedirectPath = `/kusam/instructions?customer_id=${customerIdToUse}`;
		}
		const newRedirectPath = redirectFrom ? `${redirectFrom}?${redirectParams.toString()}` : defaultRedirectPath;
		router.push(newRedirectPath);
	};

	if (isLoadingCustomerStatus) {
		return (
			<div className="relative min-h-screen flex items-center justify-center p-4 bg-white">
				 <video
						className="absolute inset-0 w-full h-full object-cover"
						src="/leaves1.mp4"
						autoPlay
						loop
						muted
						playsInline
						style={{ opacity: 0.10 }}
				/>
				<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="relative z-20 text-center"
				>
						<p className="text-xl text-gray-700 font-semibold">Cargando Experiencia Expo360...</p>
						<Image src="/logo.png" alt="Loading Logo" width={100} height={25} className="mx-auto mt-4 animate-pulse" />
				</motion.div>
			</div>
		);
	}

	const containerVariants: Variants = {
		hidden: { opacity: 0, y: 50 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 10,
				delay: 0.2
			}
		},
	};

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-white">
			<video
				className="absolute inset-0 w-full h-full object-cover"
				src="/leaves1.mp4"
				autoPlay
				loop
				muted
				playsInline
				style={{ opacity: 0.10 }}
			/>

			<motion.div
				className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-gray-200 relative z-20"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				<div className="mb-6 text-center">
					<Image
						src="/logo.png"
						alt="Kusam Outdoor Solutions Logo"
						width={200}
						height={50}
						priority
						className="mx-auto"
					/>
				</div>

				<div className="mb-6 text-center">
					<h1 className="text-3xl font-bold text-gray-800"></h1>
					{variant === 'evento-especial' && (
						<div className="flex flex-col items-center justify-center mb-4">
							<Image
								src="/other-images/jpgtest.jpg"
								alt="Kusam Evento Especial"
								width={400}
								height={220}
								style={{ objectFit: 'cover', borderRadius: '1rem' }}
								className="mx-auto"
								priority
							/>
						</div>
					)}
					{variant === 'kusam' && (
						<p className="text-gray-600 mt-2 text-lg">
							Su Experiencia en{' '}
							<span className="inline-flex items-center align-middle mx-1">
								<Image
									src="/expo_mueble.png"
									alt="Expo Mueble Internacional Logo"
									width={90}
									height={18}
									className="inline-block"
								/>
							</span>{' '}
							Comienza Aquí
						</p>
					)}
			       {(variant === 'vasconcelos' || variant === 'saltillo') && (
				       <div className="flex flex-col items-center justify-center mb-4">
					       <Image
						       src="/other-images/jpgtest.jpg"
						       alt="Kusam Evento Especial"
						       width={400}
						       height={220}
						       style={{ objectFit: 'cover', borderRadius: '1rem' }}
						       className="mx-auto"
						       priority
					       />
				       </div>
			       )}
				</div>

						<p className="text-gray-700 mb-6 text-center text-md">
																																	  {variant === 'evento-especial'
																																		  ? 'Regístrate para descubrir lo mejor de Kusam.'
																																		  : '¡Bienvenido! Para iniciar su recorrido interactivo y obtener una cotización personalizada, por favor complete sus datos.'}
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* ...existing form fields... */}
					<div>
						<label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
						<input
							type="text"
							id="name"
							name="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
							placeholder="Ej. Mónica García"
							required
						/>
					</div>
					<div>
						<label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp</label>
						<div className="relative mt-1 flex rounded-md shadow-sm" ref={dropdownRef}>
							<button
								type="button"
								className="relative z-10 inline-flex items-center space-x-2 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							>
								<span className="text-xl leading-none">{selectedCountry.emoji}</span>
								<span className="hidden sm:inline">{selectedCountry.dial_code}</span>
								<svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
									<path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
								</svg>
							</button>
							{isDropdownOpen && (
								<div className="absolute left-0 mt-12 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 max-h-60 overflow-y-auto">
									<div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="country-select-button">
										{countryCodes.map((country) => (
											<a
												key={country.code}
												href="#"
												className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
												role="menuitem"
												onClick={(e) => {
													e.preventDefault();
													setSelectedCountry(country);
													if (country.dial_code === '') {
														setLocalWhatsapp('');
													}
													setIsDropdownOpen(false);
												}}
											>
												<span className="mr-2 text-lg leading-none">{country.emoji}</span>
												{country.name} ({country.dial_code})
											</a>
										))}
									</div>
								</div>
							)}
							<input
								type="tel"
								id="localWhatsapp"
								name="localWhatsapp"
								value={localWhatsapp}
								onChange={(e) => setLocalWhatsapp(e.target.value)}
								className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
								placeholder={selectedCountry.dial_code === '' ? "Ej. +YY XXXXXXXXXX" : "Ej. 55 1234 5678"}
								required
							/>
						</div>
					</div>
					   {!hideEmail && (
						   <div>
							   <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
							   <input
								   type="email"
								   id="email"
								   name="email"
								   value={email}
								   onChange={(e) => setEmail(e.target.value)}
								   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
								   placeholder="Ej. su.correo@ejemplo.com"
								   required={variant !== 'evento-especial'}
							   />
						   </div>
					   )}
					   <div>
						   <label htmlFor="customerType" className="block text-sm font-medium text-gray-700">¿A qué te dedicas?</label>
						   <select
							   id="customerType"
							   name="customerType"
							   value={customerType}
							   onChange={(e) => setCustomerType(e.target.value)}
							   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
							   required
						   >
							   <option value="">Selecciona tu industria</option>
							   <option value="ArquitecturaDiseño">Despacho de Arquitectura/Diseño</option>
							   <option value="HoteleriaTurismo">Hotel / Resort / Turismo</option>
							   <option value="RestaurantesCafes">Restaurante / Cafetería</option>
							   <option value="DesarrolladorInmobiliario">Desarrollador Inmobiliario</option>
							   <option value="ConstructorContratista">Constructora / Contratista</option>
							   <option value="Inversionista">Inversionista</option>
							   <option value="SectorPublico">Sector Público (Gobierno)</option>
							   <option value="SpaBienestar">Spa / Centro de Bienestar</option>
							   <option value="ClubDeportivoSocial">Club Deportivo / Social</option>
							   <option value="ResidencialParticular">Cliente Residencial / Particular</option>
							   <option value="ComercioRetail">Comercio / Retail</option>
							   <option value="Educacion">Institución Educativa</option>
							   <option value="Industrial">Sector Industrial</option>
							   <option value="SaludMedicina">Salud / Medicina (Clínicas, Hospitales)</option>
							   <option value="Agroindustria">Agroindustria</option>
							   <option value="OtroNegocio">Otro Tipo de Negocio</option>
							   <option value="Estudiante">Estudiante / Académico</option>
						   </select>
					   </div>
					<button
						   type="submit"
						   className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold bg-stone-400 text-white hover:bg-stone-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-600 transition duration-150 ease-in-out"
						   style={{
							   backgroundImage: `url('/wood/var4.png')`,
							   backgroundSize: '100px 100px',
							   backgroundRepeat: 'repeat',
							   backgroundBlendMode: 'multiply'
						   }}
					   >
						   {variant === 'evento-especial' ? 'Explora Nuestro Catalogo' : 'Comienza A Explorar'}
					   </button>
				</form>
			</motion.div>
		</div>
	);
};

export default MainLeadForm;
