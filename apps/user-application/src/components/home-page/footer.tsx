import { Link } from "@tanstack/react-router";




export function Footer() {
  return (
    <div className="w-full bg-[var(--color-100)]">
      <footer className="relative w-full bg-primary overflow-hidden pt-20 pb-0 rounded-t-4xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-24">

            {/* Logo */}
            <div className="md:col-span-1">
              <Link to="/" className="block">
                <img
                  src="/brand/logo-light.svg"
                  alt="stepps.ai"
                  className="h-8 w-auto"
                />
              </Link>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Extension</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://chromewebstore.google.com/detail/hlahheljlplnnagiogmihjgcjbnjehpc?utm_source=item-share-cb" target="_blank" className="text-base font-medium text-white hover:text-white/80 transition-colors">
                    Download the extension
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Contact</h3>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:support@stepps.ai" className="text-base font-medium text-white hover:text-white/80 transition-colors">
                    support@stepps.ai
                  </a>
                </li>
                <li>
                  <Link to="/webinar" className="text-base font-medium text-white hover:text-white/80 transition-colors">
                    Webinar
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/privacy" className="text-base font-medium text-white hover:text-white/80 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-base font-medium text-white hover:text-white/80 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright - moved here for desktop layout or keep at bottom? 
                 The image shows copyright at bottom left. I'll put it in a separate row or absolute.
                 Actually, let's follow the grid for links first.
             */}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end md:items-center pb-8 pt-8 border-t border-white/20">
            <p className="text-sm font-medium text-white/80">
              © 2025 stepps.ai All rights reserved.
            </p>
          </div>
        </div>

        {/* Huge Text Background */}
        <div className="w-full select-none pointer-events-none leading-none overflow-hidden">
          <h1
            className="text-[22vw] font-bold text-center text-white whitespace-nowrap leading-[0.8] tracking-tighter opacity-100"
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
            }}
          >
            stepps.ai
          </h1>
        </div>
      </footer>
    </div>
  )
}
