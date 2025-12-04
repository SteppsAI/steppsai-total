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
  NavbarButton,
} from "@/components/ui/resizable-navbar";

const navigation = [
  { name: "Why Stepps", link: "#save-time" },
  { name: "Who is it for", link: "#who-is-it-for" },
  { name: "How it works", link: "#how-it-works" },
  { name: "FAQ", link: "#faq" },
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
          <a
            href="/app"
            className="relative z-20 text-sm font-medium font-sans leading-6 text-zinc-600 hover:text-black dark:text-neutral-300 dark:hover:text-white transition-colors whitespace-nowrap px-4 py-2"
          >
            Log in
          </a>
          <NavbarButton href="#black-friday" className="rounded-full font-sans relative z-20">
            Launch Special Offer
          </NavbarButton>
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
              className="block w-full rounded-md px-3 py-2 text-base font-medium text-zinc-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <div className="my-2 h-px bg-gray-200 w-full dark:bg-zinc-800" />
          <a
            href="/app"
            className="block w-full rounded-md px-3 py-2 text-base font-medium text-zinc-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Log in
          </a>
          <NavbarButton
            href="#black-friday"
            className="w-full rounded-full font-sans mt-2"
          >
            Launch Special Offer
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </NavbarComponent>
  );
}
