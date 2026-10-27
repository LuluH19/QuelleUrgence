import { Metadata } from 'next'
import LegalPage, { ExternalLink, LegalSection, ToComplete, legalLinkClassName } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Données personnelles',
  description:
    'Politique de protection des données personnelles (RGPD) et utilisation du stockage local sur Quelles Urgences.',
}

const thClassName = 'text-left align-top font-bold border border-gray-400 bg-gray-100 px-3 py-2'
const tdClassName = 'align-top border border-gray-400 px-3 py-2'

export default function DonneesPersonnellesPage() {
  return (
    <LegalPage title="Données personnelles" lastUpdated={<ToComplete>date</ToComplete>}>
      <p>
        Cette page explique quelles données sont utilisées lorsque vous consultez Quelles Urgences,
        pourquoi, et quels sont vos droits, conformément au Règlement général sur la protection des
        données (RGPD, règlement (UE) 2016/679) et à la loi n° 78-17 du 6 janvier 1978 modifiée
        (loi Informatique et Libertés).
      </p>
      <p>
        En résumé : le site ne demande ni compte, ni nom, ni adresse e-mail. Il ne dépose aucun
        cookie publicitaire ou de mesure d&apos;audience. Votre position n&apos;est jamais enregistrée
        par nos serveurs.
      </p>

      <LegalSection id="responsable" title="Responsable du traitement">
        <p>
          Le responsable du traitement est <ToComplete>nom de l&apos;éditeur</ToComplete>, joignable à
          l&apos;adresse <ToComplete>adresse e-mail de contact pour les données personnelles</ToComplete>.
        </p>
        <p>
          Délégué à la protection des données (DPO) :{' '}
          <ToComplete>coordonnées du DPO, ou supprimer cette ligne si aucun DPO n&apos;est désigné</ToComplete>
        </p>
      </LegalSection>

      <LegalSection id="donnees-traitees" title="Données traitées">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-400">
            <caption className="text-left font-bold pb-2">
              Données utilisées, finalité, base légale et durée de conservation
            </caption>
            <thead>
              <tr>
                <th scope="col" className={thClassName}>Donnée</th>
                <th scope="col" className={thClassName}>Finalité</th>
                <th scope="col" className={thClassName}>Base légale</th>
                <th scope="col" className={thClassName}>Durée de conservation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className={thClassName}>
                  Position géographique (si vous l&apos;autorisez)
                </th>
                <td className={tdClassName}>
                  Trouver les hôpitaux proches de vous et les afficher sur la carte. La position est
                  obtenue par votre navigateur, utilisée uniquement dans votre navigateur et transmise
                  à l&apos;API OpenDataSoft sous forme de filtre de recherche. Elle n&apos;est ni
                  envoyée à nos serveurs ni enregistrée.
                </td>
                <td className={tdClassName}>
                  Consentement (article 6.1.a du RGPD), recueilli par la fenêtre d&apos;autorisation
                  de votre navigateur. En cas de refus, Paris est utilisé comme position par défaut.
                </td>
                <td className={tdClassName}>
                  Aucune conservation par le site : la position n&apos;est utilisée que le temps de
                  l&apos;affichage de la page.
                </td>
              </tr>
              <tr>
                <th scope="row" className={thClassName}>
                  Préférences et historique enregistrés dans votre navigateur
                </th>
                <td className={tdClassName}>
                  Mémoriser vos réglages d&apos;accessibilité (taille du texte, etc.) et, le cas
                  échéant, les hôpitaux que vous avez consultés. Voir la section{' '}
                  <a href="#stockage-local" className={legalLinkClassName}>
                    Cookies et stockage local
                  </a>
                  .
                </td>
                <td className={tdClassName}>
                  Stockage strictement nécessaire au service demandé par l&apos;utilisateur (article
                  82 de la loi Informatique et Libertés).
                </td>
                <td className={tdClassName}>
                  Jusqu&apos;à ce que vous les effaciez depuis votre navigateur. Ces données restent
                  sur votre appareil et ne nous sont pas transmises.
                </td>
              </tr>
              <tr>
                <th scope="row" className={thClassName}>
                  Données techniques de connexion (adresse IP, navigateur, pages demandées)
                </th>
                <td className={tdClassName}>
                  Acheminer les pages, assurer la sécurité et le bon fonctionnement du site. Ces
                  données sont traitées par l&apos;hébergeur et par les services tiers appelés par
                  votre navigateur (voir ci-dessous).
                </td>
                <td className={tdClassName}>
                  Intérêt légitime (article 6.1.f du RGPD) : fournir un service fiable et sécurisé.
                </td>
                <td className={tdClassName}>
                  Selon la politique de chaque prestataire.{' '}
                  <ToComplete>durée de conservation des journaux chez l&apos;hébergeur</ToComplete>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Le site ne traite aucune donnée de santé vous concernant : les informations affichées
          portent sur les établissements, pas sur vous.
        </p>
      </LegalSection>

      <LegalSection id="destinataires" title="Services tiers et destinataires">
        <p>
          Pour fonctionner, votre navigateur contacte directement les services suivants, qui
          reçoivent à cette occasion votre adresse IP et les informations techniques habituelles
          d&apos;une requête web :
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>
            <span className="font-bold">Vercel Inc.</span> (États-Unis), hébergeur du site.{' '}
            <ExternalLink href="https://vercel.com/legal/privacy-policy">
              Politique de confidentialité de Vercel
            </ExternalLink>
            .
          </li>
          <li>
            <span className="font-bold">OpenDataSoft</span>, pour la recherche des établissements de
            santé (jeu de données osm-france-healthcare). Reçoit votre position si vous
            l&apos;avez autorisée, ou celle de Paris par défaut.
          </li>
          <li>
            <span className="font-bold">OpenStreetMap</span>, pour l&apos;affichage des fonds de carte.{' '}
            <ExternalLink href="https://osmfoundation.org/wiki/Privacy_Policy">
              Politique de confidentialité de la Fondation OpenStreetMap
            </ExternalLink>
            .
          </li>
          <li>
            <span className="font-bold">unpkg.com</span>, pour le chargement des feuilles de style de la
            bibliothèque cartographique Leaflet.
          </li>
          <li>
            <span className="font-bold">AP-HP</span> (mon.aphp.fr), pour l&apos;affichage de
            l&apos;affluence des services d&apos;urgences.
          </li>
        </ul>
        <p>
          Certains de ces prestataires peuvent traiter des données hors de l&apos;Union européenne,
          notamment aux États-Unis.{' '}
          <ToComplete>
            garanties encadrant ces transferts (par exemple certification au Data Privacy Framework
            ou clauses contractuelles types), à vérifier auprès de chaque prestataire
          </ToComplete>
        </p>
        <p>Aucune donnée n&apos;est vendue ni utilisée à des fins publicitaires.</p>
      </LegalSection>

      <LegalSection id="stockage-local" title="Cookies et stockage local">
        <p>
          Quelles Urgences ne dépose <span className="font-bold">aucun cookie</span> de mesure
          d&apos;audience, de publicité ou de réseau social. Aucun bandeau de consentement n&apos;est
          donc nécessaire.
        </p>
        <p>
          Le site utilise le stockage local de votre navigateur (<span lang="en">localStorage</span>)
          uniquement pour des fonctionnalités que vous activez vous-même :
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>
            <span className="font-bold">Préférences d&apos;accessibilité</span> : par exemple la taille du
            texte choisie, pour la conserver d&apos;une page à l&apos;autre et lors de vos prochaines
            visites.
          </li>
          <li>
            <span className="font-bold">Historique des hôpitaux consultés</span> (si la fonctionnalité est
            disponible) : pour vous permettre de retrouver rapidement un établissement.
          </li>
        </ul>
        <p>
          Ces informations restent sur votre appareil et ne sont jamais envoyées à nos serveurs. Vous
          pouvez les supprimer à tout moment en effaçant les données de navigation du site dans les
          réglages de votre navigateur.
        </p>
        <p>
          Les services tiers listés ci-dessus (fonds de carte, feuilles de style) peuvent appliquer
          leurs propres règles ; consultez leurs politiques de confidentialité.
        </p>
      </LegalSection>

      <LegalSection id="droits" title="Vos droits">
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation et
          d&apos;opposition concernant vos données, ainsi que du droit de retirer votre consentement à
          tout moment (par exemple en désactivant l&apos;accès à la position dans votre navigateur).
          Le site ne conservant pas de données vous identifiant, il est possible que nous ne puissions
          retrouver aucune donnée vous concernant.
        </p>
        <p>
          Pour exercer vos droits, écrivez à{' '}
          <ToComplete>adresse e-mail ou postale de contact</ToComplete>.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à
          la Commission nationale de l&apos;informatique et des libertés (CNIL) :{' '}
          <ExternalLink href="https://www.cnil.fr/fr/plaintes">www.cnil.fr/fr/plaintes</ExternalLink>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
