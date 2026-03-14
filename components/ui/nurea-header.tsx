'use client';

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
	UserSearch,
	Video,
	LifeBuoy,
	CalendarDays,
	ClipboardList,
	Settings,
	Menu,
	X,
	type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useTranslations } from '@/lib/i18n';
import ThemeSwitch from '@/components/ui/theme-switch';
import { LanguageSelector } from '@/components/ui/language-selector';
import { useAuth } from '@/hooks/use-auth';
import { UserDropdown } from '@/components/ui/user-dropdown';

type LinkItem = {
	title: string;
	href: string;
	icon: LucideIcon;
	description: string;
};

type NavContent = {
	patientLinks: LinkItem[];
	professionalLinks: LinkItem[];
};

function getNavContent(language: string): NavContent {
	const isEs = language === 'es';
	
	return {
		patientLinks: [
			{
				title: isEs ? 'Buscar Especialista' : 'Find Specialist',
				href: '/explore',
				description: isEs 
					? 'Directorio médico con filtros por especialidad, ubicación y disponibilidad' 
					: 'Medical directory with filters by specialty, location and availability',
				icon: UserSearch,
			},
			{
				title: isEs ? 'Consultas Virtuales' : 'Virtual Consultations',
				href: '/telemedicine',
				description: isEs 
					? 'Videollamadas con encriptación punto a punto. Tu privacidad, garantizada' 
					: 'End-to-end encrypted video calls. Your privacy, guaranteed',
				icon: Video,
			},
			{
				title: isEs ? 'Centro de Ayuda' : 'Help Center',
				href: '/support',
				description: isEs 
					? 'Guías de uso, FAQ y soporte técnico 24/7' 
					: 'User guides, FAQ and 24/7 technical support',
				icon: LifeBuoy,
			},
		],
		professionalLinks: [
			{
				title: isEs ? 'Gestión de Citas' : 'Appointment Management',
				href: '/professional/dashboard',
				description: isEs 
					? 'Agenda inteligente con recordatorios automáticos vía email' 
					: 'Smart scheduling with automatic email reminders',
				icon: CalendarDays,
			},
			{
				title: isEs ? 'Expediente Clínico' : 'Clinical Records',
				href: '/professional/records',
				description: isEs 
					? 'HCE digital con códigos CIE-10 y evolución del paciente' 
					: 'Digital EHR with ICD-10 codes and patient progress',
				icon: ClipboardList,
			},
			{
				title: isEs ? 'Configuración' : 'Settings',
				href: '/professional/settings',
				description: isEs 
					? 'Personaliza servicios, honorarios y horarios de atención' 
					: 'Customize services, fees and office hours',
				icon: Settings,
			},
		],
	};
}

const DropdownItem = memo(function DropdownItem({ 
	item, 
	onClose 
}: { 
	item: LinkItem; 
	onClose?: () => void;
}) {
	const Icon = item.icon;
	return (
		<NavigationMenuLink asChild>
			<Link
				href={item.href}
				onClick={onClose}
				className="group flex items-start gap-3 rounded-lg p-3 transition-all hover:bg-slate-100 focus:bg-slate-100 focus:outline-none dark:hover:bg-slate-800/50 dark:focus:bg-slate-800/50"
			>
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-primary transition-colors group-hover:border-primary/50 group-hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:group-hover:bg-slate-700">
					<Icon className="h-5 w-5" />
				</div>
				<div className="space-y-1">
					<p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">
						{item.title}
					</p>
					<p className="text-xs leading-snug text-slate-600 dark:text-slate-300">
						{item.description}
					</p>
				</div>
			</Link>
		</NavigationMenuLink>
	);
});

const MobileMenuItem = memo(function MobileMenuItem({ 
	item, 
	onClose 
}: { 
	item: LinkItem; 
	onClose: () => void;
}) {
	const Icon = item.icon;
	return (
		<Link
			href={item.href}
			onClick={onClose}
			className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800/50 dark:active:bg-slate-800/70"
		>
			<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-primary dark:border-slate-700 dark:bg-slate-800/80">
				<Icon className="h-4 w-4" />
			</div>
			<div>
				<p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
				<p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{item.description}</p>
			</div>
		</Link>
	);
});

function useScrolled(threshold = 10) {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		let ticking = false;
		
		const handleScroll = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					setScrolled(window.scrollY > threshold);
					ticking = false;
				});
				ticking = true;
			}
		};

		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [threshold]);

	return scrolled;
}

export function NureaHeader() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const scrolled = useScrolled(10);
	const { language } = useLanguage();
	const t = useTranslations(language);
	const { user, loading } = useAuth();

	const navContent = useMemo(() => getNavContent(language), [language]);
	const closeMobile = useCallback(() => setMobileOpen(false), []);
	const toggleMobile = useCallback(() => setMobileOpen(prev => !prev), []);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mobileOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => { document.body.style.overflow = ''; };
	}, [mobileOpen]);

	return (
		<header
			className={cn(
				'sticky top-0 z-50 w-full border-b transition-all duration-200',
				scrolled
					? 'border-border bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80'
					: 'border-transparent bg-transparent'
			)}
		>
			<nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* Logo */}
				<Link 
					href="/" 
					className="flex items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-accent/50"
				>
					<Image
						src="/logo.png"
						alt="NUREA"
						width={32}
						height={32}
						className="h-8 w-8 rounded-lg object-contain"
						priority
					/>
					<span className="text-xl font-semibold text-primary">NUREA</span>
					<span className="text-xs text-muted-foreground">.app</span>
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden items-center gap-1 lg:flex">
					<NavigationMenu>
						<NavigationMenuList>
							{/* Para Pacientes */}
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent text-sm font-medium data-[state=open]:bg-accent/50">
									{language === 'es' ? 'Para Pacientes' : 'For Patients'}
								</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[320px] gap-1 p-3">
										{navContent.patientLinks.map((item) => (
											<li key={item.href}>
												<DropdownItem item={item} />
											</li>
										))}
										<li className="mt-1 border-t pt-2">
											<p className="px-3 py-2 text-xs text-muted-foreground">
												{language === 'es' ? '¿Primera vez?' : 'First time?'}{' '}
												<Link href="/login" className="font-medium text-primary hover:underline">
													{language === 'es' ? 'Crea tu cuenta gratis' : 'Create free account'}
												</Link>
											</p>
										</li>
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>

							{/* Para Profesionales */}
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent text-sm font-medium data-[state=open]:bg-accent/50">
									{language === 'es' ? 'Para Profesionales' : 'For Professionals'}
								</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[320px] gap-1 p-3">
										{navContent.professionalLinks.map((item) => (
											<li key={item.href}>
												<DropdownItem item={item} />
											</li>
										))}
										<li className="mt-1 border-t pt-2">
											<p className="px-3 py-2 text-xs text-muted-foreground">
												{language === 'es' ? '¿Eres profesional de salud?' : 'Healthcare professional?'}{' '}
												<Link href="/auth/register?role=professional&step=verification" className="font-medium text-primary hover:underline">
													{language === 'es' ? 'Únete a NUREA' : 'Join NUREA'}
												</Link>
											</p>
										</li>
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>

							{/* Links directos */}
							<NavigationMenuItem>
								<Link href="#how-it-works" className="inline-flex h-9 items-center px-4 text-sm font-medium transition-colors hover:text-primary">
									{t.nav.howItWorks}
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link href="#pricing" className="inline-flex h-9 items-center px-4 text-sm font-medium transition-colors hover:text-primary">
									{t.nav.pricing}
								</Link>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				</div>

				{/* Desktop Actions */}
				<div className="hidden items-center gap-1 lg:flex">
					{loading ? (
						<div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
					) : user ? (
						<UserDropdown
							role={user.user_metadata?.role || 'patient'}
							user={{
								name: user.user_metadata?.first_name
									? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
									: user.email?.split('@')[0] || 'Usuario',
								email: user.email || '',
								avatar: user.user_metadata?.avatar_url,
								initials: user.user_metadata?.first_name?.[0] || user.email?.charAt(0).toUpperCase() || 'U',
								status: 'online',
							}}
						/>
					) : (
						<>
							<Button variant="ghost" size="sm" className="text-sm font-medium" asChild>
								<Link href="/login">{t.nav.signIn}</Link>
							</Button>
							<Button size="sm" className="rounded-full px-5 bg-teal-600 hover:bg-teal-700 text-white shadow-sm" asChild>
								<Link href="/login">{t.nav.getStarted}</Link>
							</Button>
						</>
					)}
					
					{/* Thin separator */}
					<div className="h-5 w-px bg-border/50 mx-1" />
					
					<LanguageSelector />
					<ThemeSwitch />
				</div>

				{/* Mobile Actions */}
				<div className="flex items-center gap-2 lg:hidden">
					<LanguageSelector />
					<ThemeSwitch />
					<Button
						size="icon"
						variant="ghost"
						onClick={toggleMobile}
						aria-expanded={mobileOpen}
						aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
						className="h-9 w-9"
					>
						{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
					</Button>
				</div>
			</nav>

			{/* Mobile Menu */}
			{mounted && mobileOpen && createPortal(
				<div className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-lg lg:hidden">
					<div className="flex h-full flex-col overflow-y-auto p-4">
						<div className="flex-1 space-y-6">
							{/* Pacientes */}
							<div>
								<h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									{language === 'es' ? 'Para Pacientes' : 'For Patients'}
								</h3>
								<div className="space-y-1">
									{navContent.patientLinks.map((item) => (
										<MobileMenuItem key={item.href} item={item} onClose={closeMobile} />
									))}
								</div>
							</div>

							{/* Profesionales */}
							<div>
								<h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									{language === 'es' ? 'Para Profesionales' : 'For Professionals'}
								</h3>
								<div className="space-y-1">
									{navContent.professionalLinks.map((item) => (
										<MobileMenuItem key={item.href} item={item} onClose={closeMobile} />
									))}
								</div>
							</div>

							{/* Links */}
							<div className="space-y-1">
								<Link
									href="#how-it-works"
									onClick={closeMobile}
									className="block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
								>
									{t.nav.howItWorks}
								</Link>
								<Link
									href="#pricing"
									onClick={closeMobile}
									className="block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
								>
									{t.nav.pricing}
								</Link>
							</div>
						</div>

						{/* Mobile Auth */}
						<div className="border-t border-border pt-4">
							{loading ? (
								<div className="h-10 w-full animate-pulse rounded-md bg-muted" />
							) : user ? (
								<Button variant="outline" className="w-full" asChild>
									<Link href="/dashboard" onClick={closeMobile}>
										{language === 'es' ? 'Ir al Panel' : 'Go to Dashboard'}
									</Link>
								</Button>
							) : (
								<div className="flex flex-col gap-2">
									<Button variant="outline" className="w-full" asChild>
										<Link href="/login" onClick={closeMobile}>{t.nav.signIn}</Link>
									</Button>
									<Button className="w-full" asChild>
										<Link href="/login" onClick={closeMobile}>{t.nav.getStarted}</Link>
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>,
				document.body
			)}
		</header>
	);
}
