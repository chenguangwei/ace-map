import * as Navbar from '@heroui/navbar';
import Link from 'next/link';
import Logo from '@/lib/assets/Logo';
import CreditBadge from '@/lib/components/CreditBadge';
import ThemeSwitch from '@/lib/components/ThemeSwitch';

const Nav = () => {
	return (
		<Navbar.Navbar className="z-50">
			<Navbar.NavbarBrand>
				<Logo />
				<Link href="/" className="text-xl font-semibold">
					MapQuiz<span className="text-amber-500">.pro</span>
				</Link>
			</Navbar.NavbarBrand>
			<Navbar.NavbarContent justify="end">
				<Navbar.NavbarItem className="hidden sm:flex">
					<Link
						href="/quizzes"
						className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
					>
						Quiz Library
					</Link>
				</Navbar.NavbarItem>
				<Navbar.NavbarItem>
					<CreditBadge />
				</Navbar.NavbarItem>
				<Navbar.NavbarItem>
					<ThemeSwitch />
				</Navbar.NavbarItem>
			</Navbar.NavbarContent>
		</Navbar.Navbar>
	);
};

export default Nav;
