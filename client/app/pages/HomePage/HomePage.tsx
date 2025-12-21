'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './HomePage.module.scss'

export default function HomePage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const faqItems = [
    {
      question: "Comment trouver un hôpital sur Services & Accès ?",
      answer: "Vous pouvez utiliser la liste des hôpitaux ou la carte interactive pour localiser l'établissement le plus proche de vous."
    },
    {
      question: "Les informations sur le flux des hôpitaux sont-elles mises à jour en temps réel ?",
      answer: "Oui, les informations sur le flux d'activité des hôpitaux sont mises à jour en temps réel pour vous permettre d'anticiper les temps d'attente."
    },
    {
      question: "Puis-je consulter les spécificités de chaque hôpital ?",
      answer: "Absolument. Chaque hôpital dispose d'une page détaillée avec ses modalités de prise en charge, son accessibilité et ses services spécifiques."
    },
    {
      question: "Le site est-il accessible aux personnes ayant des besoins spécifiques ?",
      answer: "Services & Accès est conçu pour être accessible à tous, avec une interface simple et des informations sur l'accessibilité de chaque établissement pour les personnes à mobilité réduite."
    }
  ]

  return (
    <div className={styles.homePage}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Services & Accès</h1>
          <div className={styles.headerImage}>
            <Image 
              src="/doctor-image.svg"
              alt="Médecin" 
              width={118}
              height={118}
              className={styles.doctorImage}
              unoptimized
            />
          </div>
        </div>
      </header>

      {/* What is Services & Accès Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Qu&apos;est-ce que Services & Accès ?</h2>
        <div className={styles.content}>
          <p className={styles.paragraph}>
            Services & Accès est une plateforme en ligne conçue pour faciliter l&apos;accès aux informations essentielles sur les établissements hospitaliers. Elle permet aux utilisateurs de consulter rapidement la liste des hôpitaux, de visualiser en temps réel leur flux d&apos;activité et d&apos;anticiper ainsi les temps d&apos;attente. Grâce à une interface claire, chacun peut identifier l&apos;établissement le plus adapté à ses besoins et organiser son déplacement en toute sérénité.
          </p>
          <p className={styles.paragraph}>
            Le site met également en avant les spécificités propres à chaque hôpital, comme les modalités de prise en charge, l&apos;accessibilité pour les personnes à mobilité réduite ou encore les accès réservés aux services de secours. En centralisant ces données fiables et actualisées, Services & Accès devient un outil simple et indispensable pour rendre le parcours de soins plus fluide et mieux informé.
          </p>
          <button className={styles.primaryButton}>
            Accéder à la liste des hôpitaux
          </button>
        </div>
      </section>

      {/* Map Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Passer par la carte</h2>
        <div className={styles.content}>
          <div className={styles.mapContainer}>
            <div id="map" className={styles.map}>
              {/* OpenStreetMap will be integrated here with geolocation and distance calculation */}
            </div>
          </div>
          <button className={styles.primaryButton}>
            Accéder à la carte
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>F.A.Q</h2>
        <div className={styles.faqContainer}>
          {faqItems.map((item, index) => (
            <div 
              key={index} 
              className={styles.faqItem}
              onClick={() => toggleFaq(index)}
            >
              <div className={styles.faqQuestion}>
                <span>{item.question}</span>
                <span className={styles.faqIcon}>
                  {expandedFaq === index ? '▲' : '▼'}
                </span>
              </div>
              {expandedFaq === index && (
                <div className={styles.faqAnswer}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className={styles.callSection}>
          <p className={styles.callText}>
            Services & Accès est conçu pour être accessible à tous, avec une interface simple et intuitive pour faciliter votre recherche d&apos;informations hospitalières.
          </p>
          <button className={styles.callButton}>
            <span className={styles.phoneIcon}>📞</span>
            Appeler le 114
          </button>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className={styles.footer}>
        <div className={styles.footerIcons}>
          <Image 
            src="/Localisation.svg"
            alt="Localisation" 
            width={24}
            height={24}
            className={styles.footerIcon}
            unoptimized
          />
          <Image 
            src="/accueil.svg"
            alt="Accueil" 
            width={24}
            height={24}
            className={styles.footerIcon}
            unoptimized
          />
          <Image 
            src="/Hopital.svg"
            alt="Hôpital" 
            width={24}
            height={24}
            className={styles.footerIcon}
            unoptimized
          />
        </div>
      </footer>
    </div>
  )
}

