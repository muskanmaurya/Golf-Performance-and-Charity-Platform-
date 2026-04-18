import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import HowItWorks from '@/components/landing/HowItWorks'
import PricingSection from '@/components/landing/PricingSection'
import CharitiesSection from '@/components/landing/CharitiesSection'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <PricingSection />
      <CharitiesSection />
      <Footer />
    </main>
  )
}
