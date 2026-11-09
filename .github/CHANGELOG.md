# Journal des versions

## 37.0.7 — 9 novembre 2026

- Étend uniquement la condition de placement du module VOD de `preroll` à `preroll` ou `midroll`. Les autres conditions (XHR GET, adresse exacte, VAST 3, même VOD, contexte ARCHIVE/csai/web_csai, emplacement vidéo unique, paramètres non ambigus) sont conservées.
- Aucun changement au moteur des directs, aux Workers, aux qualités, au lecteur, aux requêtes `fetch /ads` ni aux bannières de pause. Aucun nouveau bandeau.
- Tests de régression sur les mid-rolls, les exclusions, l'annulation, la réutilisation de XHR et les navigations VOD/direct. Validation : 71 tests Node et 112 scénarios natifs simulés Chrome/Edge réussis.
- Le marqueur partagé avec l'ancien complément est conservé. Désactiver ce complément puis recharger Twitch : s'il démarre d'abord, le nouveau module ne remplace pas son filtre limité aux pré-rolls.
- Nom, namespace et URL de mise à jour conservés. La mise à jour depuis la 37.0.5 garde la même entrée Violentmonkey.
- Validation réelle de la réponse VAST vide lors d'un mid-roll et de la reprise du lecteur encore nécessaire. Cette version ne garantit pas le blocage de tous les formats.

## 37.0.4 — 26 octobre 2026

### Pré-rolls VOD VAST

- Intégration du traitement testé séparément dans **TwitchAD VOD VAST - test MATTEO12SA** 0.1.0. Le moteur VAFT des directs, les qualités, les playlists et les Workers ne sont pas modifiés par cet ajout.
- Sur une page VOD, une requête **XHR GET** vers `https://edge.ads.twitch.tv/2018-01-01/3p/ads` est remplacée par une réponse locale XML sans annonce uniquement si elle correspond au format observé : `rt=vast3`, `bp=preroll`, `pbid=twitch`, marqueurs `ARCHIVE` / `web_csai` / `csai` dans `pj`, emplacement vidéo `twitch-player-ui` et paramètre `u` désignant la même VOD que la page.
- Réponse utilisée : `<VAST version="3.0"></VAST>`, selon la [réponse « No Ad » du standard VAST 3.0, section 2.4.2.4](https://iabtechlab.com/wp-content/uploads/2016/04/VASTv3_0.pdf#page=56). Aucun bandeau supplémentaire n'est affiché sur les VOD.
- Les contextes inconnus, les autres requêtes et les mid-rolls sont laissés à leur traitement d'origine. Les bannières et les autres formats publicitaires ne sont pas couverts.
- Les méthodes XHR d'envoi, d'annulation et de gestion des en-têtes ainsi que les événements restent natifs. Une protection partagée avec le complément de test évite une double installation du traitement.

### Installation et validation

- Le nom, le `@namespace`, les adresses de mise à jour GitHub et la licence sont conservés.
- Après la mise à jour en 37.0.4, le complément de test peut être désactivé ou supprimé. TwitchNoSub reste distinct et n'est pas inclus.
- Validation utilisateur du complément sous Edge, Violentmonkey et TwitchNoSub : comparaisons répétées activé/désactivé et captures de réponses locales 200 XML vides pendant le démarrage d'une VOD.
- Ajout de contrôles automatisés avec des requêtes fictives. Ils vérifient le ciblage et le comportement du transport ; ils ne représentent pas une validation de tous les formats Twitch.
- Nouvelle présentation du projet : installation directe, périmètre des fonctionnalités, mises à jour indépendantes et consignes de contribution. Les crédits et la licence du projet d'origine restent conservés.

## 37.0.3

- Traduction du bandeau existant en **« Pub bloquée »**, avec les mêmes conditions d'affichage et le même fonctionnement que la 37.0.2.

## 37.0.2

- Base indépendante de TwitchAdSolutions (vaft), avec le nom **TwitchAD VAFT MATTEO12SA** et les métadonnées de publication et de mise à jour propres à ce dépôt.
