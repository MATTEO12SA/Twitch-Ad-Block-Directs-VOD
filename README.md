# Twitch Ad Block — Directs & VOD

**Par MATTEO12SA · Pour Violentmonkey · Version 37.0.8**

Un userscript pour bloquer les publicités des directs Twitch avec VAFT et filtrer certains formats publicitaires vidéo avant et pendant les rediffusions.

**[Installer ou mettre à jour le script](https://raw.githubusercontent.com/MATTEO12SA/Twitch-Ad-Block-Directs-VOD/main/vaft.user.js)** · [Signaler un problème](https://github.com/MATTEO12SA/Twitch-Ad-Block-Directs-VOD/issues) · [Historique des versions](.github/CHANGELOG.md)

## Installation

1. Installer [Violentmonkey](https://violentmonkey.github.io/get-it/).
2. Garder une seule version de VAFT active. Désactiver les anciens scripts TwitchAdSolutions et l'ancien complément **VOD VAST - test** s'il est encore installé.
3. Cliquer sur **Installer ou mettre à jour le script**, puis confirmer dans Violentmonkey.
4. Vérifier la version **37.0.8**, puis recharger Twitch.

Si le lien affiche uniquement du code, copier son contenu dans l'éditeur de l'entrée existante **TwitchAD VAFT MATTEO12SA**, remplacer l'ancien code, enregistrer puis recharger Twitch. Le nom et le namespace restent identiques pour conserver cette entrée lors des mises à jour.

**TwitchNoSub est un script distinct.** Le garder actif si la lecture de vos rediffusions en dépend ; il n'est pas inclus ici.

## Ce qui est pris en charge

- **Directs :** moteur VAFT et bandeau « Pub bloquée ».
- **Rediffusions et highlights :** filtrage ciblé des demandes VAST 3 de pré-roll et de mid-roll, sans bandeau supplémentaire. Depuis la 37.0.8, il s'applique aussi aux highlights et aux rediffusions lancées sur la page d'une chaîne.
- **Limites :** les autres formats et les publicités fixes affichées à la pause ne sont pas ciblés par l'ajout VOD. Certaines publicités peuvent encore passer.

La 37.0.8 élargit uniquement le filtre VOD à deux cas observés sur Twitch. Le moteur des directs et les commandes du lecteur restent identiques. Les tests automatisés passent ; **le blocage réel de ces deux cas, celui d'une vraie coupure mid-roll et la reprise normale de la VOD restent à confirmer sur Twitch**. [Détails de validation](.github/checks/README.md).

## Mises à jour et aide

Les mises à jour automatiques proviennent de la branche `main` de ce dépôt et sont recherchées périodiquement par Violentmonkey. Le lien d'installation permet aussi une mise à jour manuelle. Recharger Twitch après la mise à jour.

Pour [signaler un problème](https://github.com/MATTEO12SA/Twitch-Ad-Block-Directs-VOD/issues), préciser la version, le navigateur, les scripts actifs et les étapes du problème. Pour une publicité, indiquer s'il s'agit d'un direct ou d'une VOD, et à quel moment elle apparaît. Ne pas publier de cookies ni de jetons de connexion.

## Crédits

Projet indépendant fondé sur [TwitchAdSolutions](https://github.com/pixeltris/TwitchAdSolutions), avec un ajout pour les VOD. [Crédits d'origine](https://github.com/cleanlock/VideoAdBlockForTwitch#credits) · [Licence MIT](LICENSE).
