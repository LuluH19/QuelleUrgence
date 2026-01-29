import FAQItem from "@/components/FAQItems";
function FAQSection() {
    return (
        <section className="pt-6 pb-20 px-4 flex flex-col gap-4 items-center" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-lg md:text-xl lg:text-2xl font-bold text-left w-full uppercase">F.A.Q</h2>
        <div className="space-y-4 w-full">
          <FAQItem 
            question="Comment trouver un hôpital sur Quelles Urgences ?"
            answer="Il suffit d&apos;utiliser le moteur de recherche ou la carte interactive du site pour accéder rapidement à la liste des hôpitaux disponibles dans votre zone géographique."
          />
          
          <FAQItem 
            question="Les informations sur le flux des hôpitaux sont-elles mises à jour en temps réel ?"
            answer="Oui, le site affiche le flux d&apos;activité de chaque hôpital en temps réel afin d&apos;aider les utilisateurs à estimer les temps d&apos;attente et choisir l&apos;établissement le plus adapté."
          />
          
          <FAQItem 
            question="Puis-je consulter les spécificités de chaque hôpital ?"
            answer="Oui, chaque fiche d&apos;établissement indique les services de prise en charge, l&apos;accessibilité pour les personnes en situation de handicap, ainsi que les accès pompiers et autres dispositifs essentiels."
          />
          
          <FAQItem 
            question="Le site est-il accessible aux personnes ayant des besoins spécifiques ?"
            answer="Quelles Urgences est conçu pour être accessible à tous, avec une interface simple, claire et compatible avec les principaux outils d'assistance."
          />
        </div>
      </section>
    )
}

export default FAQSection;