"use client";
import { useState } from "react";
import {
  ResizableNavbar as NavbarComponent,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,

} from "@/components/ui/resizable-navbar";


const navigation = [
  { name: "Webinar", link: "/webinar" },
  { name: "Why Stepps", link: "/#save-time" },
  { name: "How it works", link: "/#how-it-works" },
  { name: "FAQ", link: "/#faq" },
  { name: "Extension ↗", link: "https://chromewebstore.google.com/detail/hlahheljlplnnagiogmihjgcjbnjehpc?utm_source=item-share-cb"},
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <NavbarComponent className="px-8 top-2">
      <NavBody>
        <NavbarLogo />
        <NavItems items={navigation} />
        {/* Spacer to balance the logo on the left, or just the buttons */}
        <div className="flex items-center gap-2">
          {/* <Link
            to="/auth/login"
            className="relative z-20 text-base font-semibold font-sans leading-6 text-[var(--color-900)] hover:text-[var(--color-700)] dark:text-neutral-200 dark:hover:text-white transition-colors whitespace-nowrap px-5 py-2.5"
          >
            Log in
          </Link> */}
          <a
            href="/#waitlist"
            className="btn-glass-primary group inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 relative z-20"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="relative block h-[1.2em] overflow-hidden">
                <span className="block transition-transform duration-500 ease-in-out group-hover:-translate-y-full">
                  Join Waitlist
                </span>
                <span className="absolute top-full left-0 block transition-transform duration-500 ease-in-out group-hover:-translate-y-full">
                  Join Waitlist
                </span>
              </span>
              <img src="/icons/3d/rocket.png" alt="Rocket" className="w-5 h-5 object-contain group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </a>
        </div>
      </NavBody>
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        >
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.link}
              className="block w-full rounded-md px-3 py-2 text-base font-medium text-[var(--color-900)] hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <div className="my-2 h-px bg-gray-200 w-full dark:bg-zinc-800" />
          {/* <Link
            to="/auth/login"
            className="block w-full rounded-md px-4 py-2.5 text-base font-semibold text-[var(--color-900)] hover:bg-gray-50"
          >
            Log in
          </Link> */}
          <a
            href="/#waitlist"
            className="btn-glass-primary w-full group inline-flex h-12 items-center justify-center rounded-full mt-2 text-base font-medium text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="relative block h-[1.2em] overflow-hidden">
                <span className="block transition-transform duration-500 ease-in-out group-hover:-translate-y-full">
                  Join Waitlist
                </span>
                <span className="absolute top-full left-0 block transition-transform duration-500 ease-in-out group-hover:-translate-y-full">
                  Join Waitlist
                </span>
              </span>
              <img src="/icons/3d/rocket.png" alt="Rocket" className="w-5 h-5 object-contain group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </a>
        </MobileNavMenu>
      </MobileNav>
    </NavbarComponent>
  );
}
