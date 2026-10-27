import { Metadata } from 'next'
import Link from 'next/link'
import LegalPage, { ExternalLink, LegalSection, ToComplete, legalLinkClassName } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site Quelles Urgences : éditeur, hébergeur, sources des données.',
}

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" lastUpdated={<ToComplete>date</ToComplete>}>
      <p>
        Conformément à l&apos;article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans
        l&apos;économie numérique (LCEN), les informations suivantes sont portées à la connaissance
        des utilisateurs du site Quelles Urgences.
      </p>

      <LegalSection id="editeur" title="Éditeur du site">
        <dl className="grid grid-cols-1 sm:grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
          <dt className="font-bold">Nom ou raison sociale</dt>
          <dd><ToComplete>nom de l&apos;éditeur (personne physique ou morale)</ToComplete></dd>
          <dt className="font-bold">Statut juridique</dt>
          <dd><ToComplete>forme juridique, capital social le cas échéant</ToComplete></dd>
          <dt className="font-bold">Adresse</dt>
          <dd><ToComplete>adresse postale</ToComplete></dd>
          <dt className="font-bold">SIRET / RCS</dt>
          <dd><ToComplete>numéro SIRET ou RCS, ou mention &quot;projet non commercial&quot;</ToComplete></dd>
          <dt className="font-bold">Contact</dt>
          <dd><ToComplete>adresse e-mail de contact</ToComplete></dd>
          <dt className="font-bold">Directeur de la publication</dt>
          <dd><ToComplete>nom du directeur de la publication</ToComplete></dd>
        </dl>
      </LegalSection>

      <LegalSection id="hebergeur" title="Hébergeur">
        <address className="not-italic flex flex-col gap-1">
          <span className="font-bold">Vercel Inc.</span>
          <span>440 N Barranca Avenue #4133</span>
          <span>Covina, CA 91723</span>
          <span>États-Unis</span>
          <span>
            Site web : <ExternalLink href="https://vercel.com">vercel.com</ExternalLink>
          </span>
        </address>
      </LegalSection>

      <LegalSection id="avertissement" title="Avertissement médical">
        <p>
          Quelles Urgences est un outil d&apos;information. Il ne remplace pas un avis médical et ne
          constitue pas un service de régulation des urgences. Les informations d&apos;affluence et les
          caractéristiques des établissements sont fournies à titre indicatif et peuvent être
          incomplètes ou ne pas être à jour.
        </p>
        <p className="font-bold">
          En cas d&apos;urgence vitale, appelez le 15 (SAMU), le 112 (numéro d&apos;urgence européen) ou
          le 114 (par SMS ou application, pour les personnes sourdes, malentendantes ou ayant des
          difficultés à parler).
        </p>
      </LegalSection>

      <LegalSection id="sources" title="Sources des données">
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>
            Liste et caractéristiques des établissements de santé : jeu de données{' '}
            <ExternalLink href="https://public.opendatasoft.com/explore/dataset/osm-france-healthcare/">
              osm-france-healthcare
            </ExternalLink>{' '}
            diffusé par OpenDataSoft, issu des contributeurs OpenStreetMap, sous licence ODbL.
          </li>
          <li>
            Fonds de carte : ©{' '}
            <ExternalLink href="https://www.openstreetmap.org/copyright">
              les contributeurs OpenStreetMap
            </ExternalLink>
            , affichés avec la bibliothèque Leaflet.
          </li>
          <li>
            Affluence des services d&apos;urgences : données publiées par l&apos;Assistance Publique -
            Hôpitaux de Paris (AP-HP) sur{' '}
            <ExternalLink href="https://mon.aphp.fr">mon.aphp.fr</ExternalLink>.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="propriete-intellectuelle" title="Propriété intellectuelle">
        <p>
          Les contenus propres au site (textes, logo, éléments graphiques) sont la propriété de
          l&apos;éditeur, sauf mention contraire. Les données issues de sources tierces restent soumises
          à leurs licences respectives.{' '}
          <ToComplete>licence du code source et des contenus, crédits des images</ToComplete>
        </p>
      </LegalSection>

      <LegalSection id="donnees" title="Données personnelles et accessibilité">
        <p>
          Le traitement des données personnelles et l&apos;utilisation du stockage local sont décrits
          sur la page{' '}
          <Link href="/donnees-personnelles" className={legalLinkClassName}>
            Données personnelles
          </Link>
          . L&apos;état de conformité au Référentiel général d&apos;amélioration de l&apos;accessibilité
          (RGAA) est présenté dans la{' '}
          <Link href="/accessibilite" className={legalLinkClassName}>
            déclaration d&apos;accessibilité
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
