# Planning de Semaine

Application Angular mobile-first pour saisir un planning hebdomadaire de travail.

## Fonctions

- Saisie des horaires avec `input type="time"` (rouleau natif sur smartphone selon le navigateur)
- Pas de 5 minutes (`step=300`)
- Regles horaires:
  - Lundi a jeudi: arrivee 08:00-09:30, depart 16:30-17:30
  - Vendredi: arrivee 08:00-09:30, depart 15:30-16:00
  - Pause repas fixe: 12:00-13:00
- Option `jour ferie` par jour : bloque la modification des heures et compte automatiquement `7h24`
- L'option `jour ferie` desactive `sport` pour eviter les conflits de calcul
- Calcul automatique du total hebdomadaire
- Affichage de l'ecart par rapport a 37h (en plus / en moins)
- Export texte du planning (une ligne par jour) + copie presse-papiers

## Lancer en local

```powershell
npm install
npm start
```

Puis ouvrir `http://localhost:4200/`.

## Verification rapide

```powershell
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

## Build pour GitHub Pages

L'URL cible est : `https://fredoune77.github.io/planning`

Le build GitHub Pages :

- genere les fichiers statiques dans `D:\outilsdev\wks\untitled\docs`
- positionne le `base href` sur `/planning/`
- cree `404.html` pour les routes SPA
- cree `.nojekyll`

Commande :

```powershell
npm run build:github-pages
```

Set-Location "D:\outilsdev\wks\untitled\planning-semaine"
npm run build:github-pages
Ensuite, il suffit de publier le contenu du dossier `docs` dans le depot GitHub Pages configure pour le projet `planning`.

