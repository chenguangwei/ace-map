import * as Navbar from '@heroui/navbar';
import Link from 'next/link';
import Github from '@/lib/assets/Github';
import Logo from '@/lib/assets/Logo';
import ThemeSwitch from '@/lib/components/ThemeSwitch';

const Nav = () => {
	return (
		<Navbar.Navbar className="z-50">
			<Navbar.NavbarBrand>
				<Logo />
				<Link href="/" className="text-xl font-semibold">
					Ace Map
				</Link>
			</Navbar.NavbarBrand>
			<Navbar.NavbarContent justify="end">
				<Navbar.NavbarItem>
					<a href="https://github.com/navithecoderboi">
						<Github />
					</a>
				</Navbar.NavbarItem>
				<Navbar.NavbarItem>
					<ThemeSwitch />
				</Navbar.NavbarItem>
			</Navbar.NavbarContent>
		</Navbar.Navbar>
	);
};

export default Nav;
