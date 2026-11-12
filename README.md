# Twitch Ad Block — Directs & VOD

**Par MATTEO12SA · Pour Violentmonkey · Version 38.0.1**

Un userscript pour bloquer les publicités des directs Twitch avec VAFT et filtrer certains formats publicitaires vidéo avant et pendant les rediffusions.

**[Installer ou mettre à jour le script](https://raw.githubusercontent.com/MATTEO12SA/Twitch-Ad-Block-Directs-VOD/main/vaft.user.js)** · [Signaler un problème](https://github.com/MATTEO12SA/Twitch-Ad-Block-Directs-VOD/issues) · [Historique des versions](.github/CHANGELOG.md)

## Installation

1. Installer [Violentmonkey](https://violentmonkey.github.io/get-it/).
2. Garder une seule version de VAFT active. Désactiver les anciens scripts TwitchAdSolutions et l'ancien complément **VOD VAST - test** s'il est encore installé.
3. Cliquer sur **Installer ou mettre à jour le script**, puis confirmer dans Violentmonkey.
4. Vérifier la version **38.0.1**, puis recharger Twitch.

Si le lien affiche uniquement du code, copier son contenu dans l'éditeur de l'entrée existante **TwitchAD VAFT MATTEO12SA**, remplacer l'ancien code, enregistrer puis recharger Twitch. Le nom et le namespace restent identiques pour conserver cette entrée lors des mises à jour.

**TwitchNoSub est un script distinct.** Le garder actif si la lecture de vos rediffusions en dépend ; il n'est pas inclus ici.

## Ce qui est pris en charge

- **Directs :** moteur vaft 68.5.7 du fork [ryanbr/TwitchAdSolutions](https://github.com/ryanbr/TwitchAdSolutions), repris avec deux changements documentés (bandeau « Pub bloquée », correction de la boucle de surveillance). Il cherche d'abord un flux de secours en qualité source et garde le 360p en dernier recours.
- **Rediffusions et highlights :** filtrage ciblé des demandes VAST 3 de pré-roll et de mid-roll, sans bandeau supplémentaire. Depuis la 37.0.8, il s'applique aussi aux highlights et aux rediffusions lancées sur la page d'une chaîne.
- **Limites :** les autres formats et les publicités fixes affichées à la pause ne sont pas ciblés par l'ajout VOD. Certaines publicités peuvent encore passer.

La 38.0.0 remplace uniquement le moteur des directs ; le filtre VOD de la 37.0.8 est inchangé. **Le nouveau moteur n'est pas validé par les tests automatisés : il doit être essayé sur de vrais directs.** Pour les VOD, le blocage d'une vraie coupure mid-roll et la reprise normale restent à confirmer. [Détails de validation](.github/checks/README.md).

## Mises à jour et aide

Les mises à jour automatiques proviennent de la branche `main` de ce dépôt et sont recherchées périodiquement par Violentmonkey. Le lien d'installation permet aussi une mise à jour manuelle. Recharger Twitch après la mise à jour.

Pour [signaler un problème](https://github.com/MATTEO12SA/Twitch-Ad-Block-Directs-VOD/issues), préciser la version, le navigateur, les scripts actifs et les étapes du problème. Pour une publicité, indiquer s'il s'agit d'un direct ou d'une VOD, et à quel moment elle apparaît. Ne pas publier de cookies ni de jetons de connexion.

## Crédits

Projet indépendant fondé sur [TwitchAdSolutions](https://github.com/pixeltris/TwitchAdSolutions) et, depuis la 38.0.0, sur le moteur des directs de son fork [ryanbr/TwitchAdSolutions](https://github.com/ryanbr/TwitchAdSolutions) (licence MIT), avec un ajout pour les VOD. [Crédits d'origine](https://github.com/cleanlock/VideoAdBlockForTwitch#credits) · [Licence MIT](LICENSE).
