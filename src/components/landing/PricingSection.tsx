'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, Zap } from 'lucide-react'
import Button from '@/components/ui/Button'

const features = [
  'Unlimited score entries',
  'Rolling 5-round average tracker',
  'Monthly charity draw entry',
  'Performance analytics dashboard',
  'Charity impact reports',
  'Priority support',
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-[#060910]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sky-400 text-sm font-semibold uppercase tracking-wider">Simple Pricing</span>
          <h2 className="mt-3 text-4xl font-bold text-white">One Plan. Everything Included.</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            No tiers, no hidden fees. Just clean, simple access for every golfer who wants to make a difference.
          </p>
        </motion.div>

        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-md"
          >
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-sky-500/30 to-emerald-500/10" />
            <div className="relative rounded-2xl bg-[#0e1420] p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white">Digital Heroes</span>
                <span className="ml-auto px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 text-xs font-medium border border-sky-500/25">
                  Most Popular
                </span>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">£5</span>
                  <span className="text-slate-400 text-lg">/month</span>
                </div>
                <p className="text-slate-400 text-sm mt-2">Billed monthly. Cancel anytime.</p>
              </div>

              <ul className="space-y-3 mb-8">
                {features.map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/signup" className="block">
                <Button variant="primary" size="lg" className="w-full">
                  Get Started Today
                </Button>
              </Link>

              <p className="text-center text-xs text-slate-500 mt-4">
                No credit card required for trial
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
