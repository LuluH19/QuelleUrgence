import { cognitiveModeInitScript } from '@/lib/cognitiveMode';

/** À placer dans <head> : applique le mode simple avant le premier affichage. */
export default function CognitiveModeScript() {
  return <script dangerouslySetInnerHTML={{ __html: cognitiveModeInitScript }} />;
}
