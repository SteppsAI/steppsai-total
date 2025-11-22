import { Link } from "@tanstack/react-router";
import { WaitlistForm } from '@/components/waitlist-form'

function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: {
  width: number
  height: number
  x: string
  y: string
  squares: [number, number][]
  className?: string
}) {
  const patternId = 'footer-grid-pattern'

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y}>
          {squares.map(([x, y]) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="relative w-full">
      {/* CTA Section - Dark Background */}
      <div className="bg-brand-dark text-white py-20 px-4 sm:px-6 lg:px-8 rounded-t-[2.5rem] mt-20 relative overflow-hidden">
        {/* Background Pattern - Using GridPattern like teams section */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/10">
              <GridPattern
                width={20}
                height={20}
                x="-12"
                y="4"
                squares={[
                  [4, 3],
                  [2, 1],
                  [7, 3],
                  [10, 6],
                  [15, 8],
                  [3, 9],
                  [12, 2],
                  [8, 7],
                ]}
                className="fill-white/10 stroke-white/20 absolute inset-0 h-full w-full"
              />
            </div>
            {/* Mask gradients - only affect the pattern layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-dark/60" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-24">

            {/* Left Side: Heading & Description */}
            <div className="max-w-2xl w-full text-center md:text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.2] font-sans text-white">
                Document processes, share knowledge
              </h2>
              <p className="text-lg text-white/60 mb-8 max-w-xl leading-relaxed">
                Join the waitlist for stepps.ai today. Be the first to generate beautiful step-by-step guides when we launch.
              </p>

              <WaitlistForm variant="footer" />
            </div>
          </div>

          {/* Footer Links Section - Better Responsive Layout */}
          <div className="mt-24 pt-12 border-t border-white/10">

            {/* Brand & Links Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-12">

              {/* Brand Column */}
              <div className="md:col-span-1">
                <Link to="/" className="flex justify-center md:justify-start mb-6">
                  <img
                    src="/public/logos/logo-symbol.svg"
                    alt="stepps.ai Symbol"
                    className="h-10 w-auto"
                  />
                </Link>
              </div>

              {/* Links Column */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">

                {/* Contact Links */}
                <div className="space-y-4 text-center md:text-left">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
                  <ul className="space-y-3">
                    <li>
                      <a href="mailto:support@stepps.ai" className="text-sm text-white/60 hover:text-white transition-colors">
                        support@stepps.ai
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Legal Links */}
                <div className="space-y-4 text-center md:text-left">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
                  <ul className="space-y-3">
                    <li>
                      <Link to="/" className="text-sm text-white/60 hover:text-white transition-colors">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link to="/" className="text-sm text-white/60 hover:text-white transition-colors">
                        Terms of Service
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Social/Other Links */}
                <div className="space-y-4 text-center md:text-left">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
                  <ul className="space-y-3">
                    <li>
                      <Link to="/" className="text-sm text-white/60 hover:text-white transition-colors">
                        About
                      </Link>
                    </li>
                    <li>
                      <Link to="/" className="text-sm text-white/60 hover:text-white transition-colors">
                        Waitlist
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="pt-8 border-t border-white/5">
              <div className="text-center">
                <p className="text-xs text-white/40">
                  © 2025 stepps.ai All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
