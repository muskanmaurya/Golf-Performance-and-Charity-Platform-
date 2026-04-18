'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Heart, Trophy } from 'lucide-react'
import Button from '@/components/ui/Button'

const stats = [
  { value: '2,400+', label: 'Active Players' },
  { value: '£84K', label: 'Raised for Charity' },
  { value: '12', label: 'Charity Partners' },
  { value: '99.9%', label: 'Uptime' },
]

const floatingBadges = [
  { icon: TrendingUp, label: 'Track Performance', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20', delay: 0 },
  { icon: Heart, label: 'Support Charities', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', delay: 0.1 },
  { icon: Trophy, label: 'Win Prizes', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', delay: 0.2 },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient grid-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-sky-500/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/4 blur-[80px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          Now Live — Season 2025 is Open
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6"
        >
          Golf. Performance.
          <br />
          <span className="gradient-text">Purpose.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Track your Stableford scores, compete in monthly charity draws, and support causes that matter — all for just <strong className="text-white">£5/month</strong>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link href="/auth/signup">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
              See How It Works
            </Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-20"
        >
          {floatingBadges.map(({ icon: Icon, label, color, bg, delay }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + delay }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${bg} ${color}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto border-t border-[#1e2a3a] pt-10"
        >
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-white mb-1">{value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
