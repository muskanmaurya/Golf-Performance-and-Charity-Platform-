'use client'

import { motion } from 'framer-motion'
import { UserPlus, Target, Gift, HeartHandshake } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up and subscribe for just £5/month. Your first month includes a full trial with access to all features.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
  {
    step: '02',
    icon: Target,
    title: 'Log Your Scores',
    description: 'Enter your Stableford scores (1-45) after each round. The platform tracks your latest 5 rounds and calculates your rolling average.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    step: '03',
    icon: Gift,
    title: 'Enter Charity Draws',
    description: 'As an active subscriber, you\'re automatically entered into monthly charity prize draws. Win amazing prizes while supporting great causes.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    step: '04',
    icon: HeartHandshake,
    title: 'Make a Difference',
    description: 'A portion of every subscription goes directly to our charity partners. Track the collective impact of the Digital Heroes community.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#080b12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sky-400 text-sm font-semibold uppercase tracking-wider">The Process</span>
          <h2 className="mt-3 text-4xl font-bold text-white">How It Works</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            From signup to making an impact — four simple steps to get started.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ step, icon: Icon, title, description, color, bg, border }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative group"
            >
              <div className="h-full p-6 rounded-2xl bg-[#0e1420] border border-[#1e2a3a] hover:border-[#2a3a4e] transition-all duration-300 hover:shadow-lg hover:shadow-black/30">
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-11 h-11 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-4xl font-black text-[#1e2a3a]">{step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 right-0 translate-x-1/2 w-6 h-px bg-gradient-to-r from-[#1e2a3a] to-transparent z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
