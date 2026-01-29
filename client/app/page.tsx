import Image from 'next/image'
import Link from 'next/link';
import Header from '@/components/Header'
import MapWrapper from '@/components/MapWrapper'
import FAQSection from '@/app/components/FAQSection'

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-white">
      <section className="relative shadow-[0_4px_4px_rgba(0,0,0,0.25)]" aria-label="En-tête de la page">
        <div className="absolute top-0 left-0 w-full h-full">
          <Image 
            src="/images/home/hero-banner.webp" 
            alt="Vue d'un service d'urgences hospitalier moderne et accueillant" 
            objectFit="cover"
            fill={true}
            preload={true}
            placeholder='blur'
            blurDataURL='/images/home/hero-banner.webp'
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/40 z-10" aria-hidden="true"></div>
        </div>
        <div className="relative z-10 flex flex-row justify-around items-center gap-4 pt-4 px-4 w-full">
          <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white text-left">Quelles Urgences</h1>
          <div>
            <Image 
              src="/images/home/doctor.webp" 
              alt="Professionnel de santé souriant prêt à accueillir les patients"
              width={2000}
              height={2000}
              quality={100}
              placeholder='blur'
              blurDataURL='/images/home/doctor.webp'
              loading="lazy"
              className="w-auto h-auto max-h-[118px] sm:max-h-none"
            />
          </div>
        </div>
      </section>
      <section id="main-content" className="pt-6 px-4 flex flex-col gap-4 items-center" aria-labelledby="about-heading">
        <h2 id="about-heading" className="text-lg md:text-xl lg:text-2xl font-bold text-left w-full">Qu&apos;est-ce que Quelles Urgences ?</h2>
        <div className="text-sm md:text-base lg:text-lg text-left flex flex-col gap-4 w-full">
          <p>
            Quelles Urgences est une plateforme en ligne conçue pour faciliter l&apos;accès aux informations essentielles sur les établissements hospitaliers. Elle permet aux utilisateurs de consulter rapidement la liste des hôpitaux, de visualiser en temps réel leur flux d&apos;activité et d&apos;anticiper ainsi les temps d&apos;attente. Grâce à une interface claire, chacun peut identifier l&apos;établissement le plus adapté à ses besoins et organiser son déplacement en toute sérénité.
          </p>
          <p>
            Le site met également en avant les spécificités propres à chaque hôpital, comme les modalités de prise en charge, l&apos;accessibilité pour les personnes à mobilité réduite ou encore les accès réservés aux services de secours. En centralisant ces données fiables et actualisées, Quelles Urgences devient un outil simple et indispensable pour rendre le parcours de soins plus fluide et mieux informé.
          </p>
        </div>
        <div className="flex flex-row items-center justify-center gap-4">
          <Link 
            href="/hopitaux"
            className="bg-primary text-white px-4 py-2 rounded-2xl font-bold w-fit hover:opacity-90 transition-opacity focus:outline-none focus:ring-4 focus:ring-red-600" 
            aria-label="Accéder à la liste complète des hôpitaux disponibles"
          >
            Accéder à la liste des hôpitaux
          </Link>
          <Link
            href="/map"
            className='bg-primary text-white px-4 py-2 rounded-2xl font-bold w-fit hover:opacity-90 transition-opacity focus:outline-none focus:ring-4 focus:ring-red-600' 
            aria-label="Accéder à la carte interactive des hôpitaux"
          >
            Accéder à la carte
          </Link>
        </div>
      </section>
      <FAQSection />
    </main>
    </>
  )
}