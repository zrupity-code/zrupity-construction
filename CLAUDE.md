# Zrupity Construction · notes pour Claude

## Contexte

Projet de **Zrupity Développement** (portfolio : https://zrupity-developpement.vercel.app/, compte GitHub : `zrupity-code`). Deux sites vitrines **fictifs** ont été créés pour montrer ce savoir-faire à des clients :

- Zrupity Construction : https://github.com/zrupity-code/zrupity-construction, en ligne sur https://zrupity-code.github.io/zrupity-construction/
- Zrupity Barber : https://github.com/zrupity-code/zrupity-barber, en ligne sur https://zrupity-code.github.io/zrupity-barber/

## Règles

- Entreprise **imaginaire** : adresse, téléphone, chiffres, avis, équipe et tarifs sont inventés. Ne jamais les remplacer par des données présentées comme réelles.
- Garder visibles les mentions « site fictif » : titre de l'onglet, badge en bas à gauche vers le portfolio, pied de page, et la balise `noindex`.
- Chaque push sur `main` redéploie le site sur GitHub Pages en 1 à 2 minutes.
- Pas de tiret cadratin (—) dans les textes. Répondre en français.

## Ce projet

- Entreprise du bâtiment fictive, slogan « Votre projet, notre ambition ».
- HTML, CSS, JavaScript natifs, sans build : `index.html`, `css/style.css`, `js/main.js`, `images/`, `videos/`. Ouvrir `index.html` pour tester.
- Contenu : accueil plein écran, barre de chiffres sobre (fond anthracite), vidéo de marque dans un lecteur sur mesure (lecture auto muette, en boucle, zoom au défilement), services en cartes photo, chantier en 4 étapes à défilement automatique, galerie « Sur le terrain », avis, formulaire (n'envoie rien, c'est une démo).
- Identité : anthracite + or `#d6953a`, logo blanc sur fond sombre (`images/logo-blanc.png`).
- Photos : images de l'utilisateur (générées par IA), découpées et optimisées.

## Tâche en attente : ajout au portfolio

Dans le projet du portfolio (Next.js, déployé sur Vercel), ajouter **les deux projets** dans la section réalisations, au même format que les autres cartes (Le Valentino, Neven Horlogerie, Cupper, Crée ton CV IA), avec un badge « Site fictif de démonstration » :

- Vignettes 1200×750 à télécharger dans `public/` et afficher avec `next/image` :
  https://zrupity-code.github.io/zrupity-construction/images/apercu-portfolio.jpg et
  https://zrupity-code.github.io/zrupity-barber/apercu-portfolio.jpg
- Lien direct vers le site en ligne (nouvel onglet) et lien « Code source » vers GitHub.
- Vérifier le rendu sur ordinateur et mobile, puis commit et déploiement Vercel.
