import { Metadata } from 'next'
import Link from 'next/link'
import LegalPage, { ExternalLink, LegalSection, ToComplete, legalLinkClassName } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: "Déclaration d'accessibilité",
  description: "Déclaration d'accessibilité (RGAA) du site Quelles Urgences.",
}

export default function AccessibilitePage() {
  return (
    <LegalPage title="Déclaration d'accessibilité" lastUpdated={<ToComplete>date</ToComplete>}>
      <p>
        <ToComplete>nom de l&apos;éditeur</ToComplete> s&apos;engage à rendre son site internet
        accessible conformément à l&apos;article 47 de la loi n° 2005-102 du 11 février 2005.
      </p>
      <p>
        Cette déclaration d&apos;accessibilité s&apos;applique au site Quelles Urgences{' '}
        (<ToComplete>adresse URL du site</ToComplete>).
      </p>

      <LegalSection id="etat-conformite" title="État de conformité">
        <p>
          Le site Quelles Urgences est{' '}
          <ToComplete>totalement / partiellement / non</ToComplete> conforme avec le référentiel
          général d&apos;amélioration de l&apos;accessibilité (RGAA), version{' '}
          <ToComplete>version du RGAA utilisée pour l&apos;audit</ToComplete>
          {' '}en raison des non-conformités et des dérogations énumérées ci-dessous.
        </p>
      </LegalSection>

      <LegalSection id="resultats" title="Résultats des tests">
        <p>
          L&apos;audit de conformité réalisé par <ToComplete>nom de la personne ou de l&apos;organisme
          ayant réalisé l&apos;audit</ToComplete> révèle que{' '}
          <ToComplete>pourcentage</ToComplete> % des critères du RGAA sont respectés.
        </p>
        <p>
          Tant qu&apos;aucun audit n&apos;a été réalisé, le site doit être déclaré « non conforme ».
        </p>
      </LegalSection>

      <LegalSection id="contenus-non-accessibles" title="Contenus non accessibles">
        <h3 className="text-base md:text-lg font-bold">Non-conformités</h3>
        <p>
          <ToComplete>liste des critères non respectés issue de l&apos;audit</ToComplete>
        </p>
        <h3 className="text-base md:text-lg font-bold">Dérogations pour charge disproportionnée</h3>
        <p>
          <ToComplete>liste des dérogations, ou &quot;aucune&quot;</ToComplete>
        </p>
        <h3 className="text-base md:text-lg font-bold">Contenus non soumis à l&apos;obligation d&apos;accessibilité</h3>
        <p>
          <ToComplete>par exemple cartes interactives et contenus de tiers, à confirmer</ToComplete>
        </p>
        <p>
          La carte interactive peut être difficile à utiliser avec certaines technologies
          d&apos;assistance. Les mêmes établissements sont consultables sous forme de{' '}
          <Link href="/hopitaux" className={legalLinkClassName}>
            liste des hôpitaux
          </Link>
          , avec recherche et filtres.
        </p>
      </LegalSection>

      <LegalSection id="mesures" title="Mesures d'accessibilité mises en place">
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>Lien d&apos;évitement « Aller au contenu principal » en début de page.</li>
          <li>Focus clavier visible sur les éléments interactifs.</li>
          <li>Réglage de la taille du texte, mémorisé dans votre navigateur.</li>
          <li>Alternatives textuelles pour les images porteuses d&apos;information.</li>
          <li>Liste des hôpitaux proposée en alternative à la carte interactive.</li>
        </ul>
      </LegalSection>

      <LegalSection id="etablissement" title="Établissement de cette déclaration d'accessibilité">
        <p>
          Cette déclaration a été établie le <ToComplete>date de la déclaration</ToComplete>.
        </p>
        <h3 className="text-base md:text-lg font-bold">Technologies utilisées pour la réalisation du site</h3>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>HTML5</li>
          <li>CSS</li>
          <li>JavaScript (React, Next.js)</li>
        </ul>
        <h3 className="text-base md:text-lg font-bold">Environnement de test</h3>
        <p>
          <ToComplete>
            combinaisons de navigateurs et de technologies d&apos;assistance utilisées (par exemple
            NVDA avec Firefox, VoiceOver avec Safari)
          </ToComplete>
        </p>
        <h3 className="text-base md:text-lg font-bold">Outils pour évaluer l&apos;accessibilité</h3>
        <p>
          <ToComplete>outils utilisés lors de l&apos;audit</ToComplete>
        </p>
        <h3 className="text-base md:text-lg font-bold">Pages du site ayant fait l&apos;objet de la vérification de conformité</h3>
        <p>
          <ToComplete>liste des pages auditées</ToComplete>
        </p>
      </LegalSection>

      <LegalSection id="retour-information" title="Retour d'information et contact">
        <p>
          Si vous n&apos;arrivez pas à accéder à un contenu ou à un service, vous pouvez contacter le
          responsable du site pour être orienté vers une alternative accessible ou obtenir le contenu
          sous une autre forme :{' '}
          <ToComplete>adresse e-mail ou formulaire de contact</ToComplete>.
        </p>
      </LegalSection>

      <LegalSection id="voies-recours" title="Voies de recours">
        <p>Cette procédure est à utiliser dans le cas suivant :</p>
        <p>
          vous avez signalé au responsable du site un défaut d&apos;accessibilité qui vous empêche
          d&apos;accéder à un contenu ou à un des services du portail et vous n&apos;avez pas obtenu de
          réponse satisfaisante.
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>
            <ExternalLink href="https://www.defenseurdesdroits.fr/nous-contacter-355">
              Écrire un message au Défenseur des droits
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://www.defenseurdesdroits.fr/carte-des-delegues">
              Contacter le délégué du Défenseur des droits près de chez vous
            </ExternalLink>
          </li>
          <li>
            Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre) :
            <address className="not-italic mt-1 flex flex-col">
              <span>Défenseur des droits</span>
              <span>Libre réponse 71120</span>
              <span>75342 Paris CEDEX 07</span>
            </address>
          </li>
        </ul>
      </LegalSection>
    </LegalPage>
  )
}
