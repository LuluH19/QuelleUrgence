```powershell
┌─────────────────────┐
│     Utilisateur     │
└─────────┬───────────┘
          │
          ▼
┌──────────────────────────────┐
│            HOME              │
│ Présentation du service      │
│ Accès Liste / Carte          │
└─────────┬────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│ Demande de géolocalisation navigateur   │
└─────────┬───────────────┬───────────────┘
          │               │
          │ Acceptée      │ Refusée / erreur
          ▼               ▼
┌──────────────────┐   ┌──────────────────┐
│ Coordonnées GPS  │   │ Fallback : Paris │
│ utilisateur      │   │ (valeur par défaut)
└─────────┬────────┘   └─────────┬────────┘
          │                      │
          └──────────┬───────────┘
                     ▼
        ┌────────────────────────────────┐
        │ Calcul des établissements       │
        │ hospitaliers les plus proches   │
        └─────────┬──────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────┐
│        Agrégateur de données : HospitalWithMock    │
├────────────────────────────────────────────────────┤
│ • Données Hôpital                                  │
│   - Nom                                            │
│   - Téléphone                                      │
│   - Adresse                                        │
│   - Coordonnées géographiques                      │
│                                                    │
│ • Données Services (Mock)                          │
│   - Accès pompiers                                 │
│   - Assistante sociale                             │
│   - Spécialités médicales                          │
│                                                    │
│ • Données Accessibilité                            │
│   - PMR : parking, entrée, toilettes, assises      │
└─────────┬──────────────────────────────────────────┘
          │
          ▼
┌───────────────────────────────┐
│        Exploration             │
└─────────┬───────────┬─────────┘
          │           │
          ▼           ▼
┌──────────────────┐  ┌────────────────────────────┐
│   Vue Liste       │  │ Carte interactive Leaflet │
│ Filtrage dynamique│  │ Marqueurs d urgence       │
└─────────┬────────┘  └─────────┬──────────────────┘
          │                     │
          ▼                     ▼
┌─────────────────────────────────────────────┐
│ Recherche & Filtres avancés                 │
├─────────────────────────────────────────────┤
│ • Recherche textuelle (nom hôpital)         │
│ • Spécifications                            │
│   - Accès pompiers                          │
│   - Assistante sociale                      │
│   - Accessibilité PMR                       │
│ • Spécialisations médicales (15+)           │
│   - Cardiologie, Rhumatologie, Gynécologie  │
│   - Neurochirurgie, Chirurgie pédiatrique…  │
└─────────┬───────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│     Fiche établissement hospitalier  │
├──────────────────────────────────────┤
│ • Coordonnées & contact              │
│ • Spécialités médicales              │
│ • Accessibilité PMR                  │
│ • Flux d activité (Mock)             │
│   → Indicateur d affluence           │
└─────────┬────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│        Prise de décision utilisateur │
│ Choix de l établissement le plus     │
│ adapté à sa situation                │
└──────────────────────────────────────┘

```