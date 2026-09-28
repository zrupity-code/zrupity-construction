# Zrupity Construction · site vitrine de démonstration

> **Site fictif.** Zrupity Construction n'est pas une entreprise réelle : l'entreprise, les coordonnées, les chiffres et les avis clients sont imaginaires. Ce projet a été réalisé par [Zrupity Développement](https://zrupity-developpement.vercel.app/) pour montrer son savoir-faire en création de sites vitrines.

**Voir le site en ligne : https://zrupity-code.github.io/zrupity-construction/**

## Aperçu

Site vitrine une page pour une entreprise du bâtiment :

- en-tête fixe avec menu mobile et lien actif selon la section affichée ;
- accueil plein écran, compteurs animés ;
- vidéo de marque dans un lecteur sur mesure (lecture automatique muette, barre de progression, son, plein écran, zoom au défilement) ;
- services avec cartes photo, chantier « de A à Z » en 4 étapes à défilement automatique ;
- galerie avec agrandissement des photos, avis clients, formulaire de contact avec validation ;
- design adaptatif (ordinateur, tablette, mobile), respect du réglage « réduire les animations ».

## Technique

HTML, CSS et JavaScript natifs, sans framework ni dépendance : aucune étape de compilation.

```
index.html      structure et contenus
css/style.css   design (variables CSS, grilles, animations)
js/main.js      interactions (IntersectionObserver, lecteur vidéo, galerie)
images/         photos optimisées et logo
videos/         vidéo de marque
```

Pour le lancer en local, il suffit d'ouvrir `index.html` dans un navigateur.
