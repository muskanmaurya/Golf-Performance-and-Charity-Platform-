'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

const charities = [
  {
    name: 'Macmillan Cancer Support',
    description: 'Providing care and support to people affected by cancer and their families.',
    raised: '£28,400',
    image: 'https://images.pexels.com/photos/6647035/pexels-photo-6647035.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
  },
  {
    name: 'Age UK',
    description: 'Championing the wellbeing of older people and campaigning for their rights.',
    raised: '£19,200',
    image: 'https://images.pexels.com/photos/7551659/pexels-photo-7551659.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
  },
  {
    name: 'Mind Mental Health',
    description: 'Supporting those experiencing mental health problems and fighting for their rights.',
    raised: '£22,100',
    image: 'https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
  },
]

export default function CharitiesSection() {
  return (
    <section id="charities" className="py-24 bg-[#080b12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Our Partners</span>
          <h2 className="mt-3 text-4xl font-bold text-white">Charities We Support</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Every subscription directly funds these incredible organisations. Together, we&apos;re making a real difference.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {charities.map(({ name, description, raised, image }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-2xl overflow-hidden bg-[#0e1420] border border-[#1e2a3a] hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1420] to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                    {raised} raised
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-white mb-2">{name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>And many more charity partners joining soon</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
