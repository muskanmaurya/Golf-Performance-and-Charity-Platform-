import Link from 'next/link'
import { Zap, Battery as Twitter, Drama as Instagram, Link as Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#060910] border-t border-[#1e2a3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                Digital <span className="gradient-text">Heroes</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              A golf performance and charity platform connecting passionate golfers with causes that matter. Track your game, compete for prizes, change lives.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-[#0e1420] border border-[#1e2a3a] flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-sky-500/40 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-3">
              {['Dashboard', 'Leaderboard', 'Charity Draws', 'Pricing'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Privacy Policy', 'Terms of Service', 'Contact'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1e2a3a] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Digital Heroes. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Made with purpose for golfers who give back.
          </p>
        </div>
      </div>
    </footer>
  )
}
