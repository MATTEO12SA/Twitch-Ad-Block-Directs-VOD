# Journal des versions

## 38.0.4 — 13 novembre 2026

- **Publicités non bloquées après une longue pause :** quand un direct restait en pause plus de 30 minutes, le moteur oubliait ce flux. À la reprise, ses playlists passaient sans filtre et les publicités s'affichaient jusqu'au rechargement de la page.
- Cause : un nettoyage périodique supprimait tout flux non interrogé depuis 30 minutes, alors qu'un lecteur en pause n'interroge rien mais reprend avec les mêmes playlists.
- Correction : un flux ancien n'est oublié que si un autre flux est actif dans le même Worker, c'est-à-dire quand on a changé de chaîne. Même approche que [Helli24/TwitchAdSolutions](https://github.com/Helli24/TwitchAdSolutions) v68.11.0, qui a identifié ce défaut.
- Rien d'autre ne change : flux de secours, lecteur, console et filtre VOD sont identiques à la 38.0.3.
- Validation : 90 tests Node (un nouveau, qui échoue sur la 38.0.3 et réussit ici), 128 scénarios natifs Chrome/Edge, essais réels sur Twitch (direct avec coupure simulée, VOD) sans erreur. Une vraie pause de 30 minutes n'a pas été rejouée sur Twitch.

## 38.0.3 — 13 novembre 2026

Console du navigateur (F12) uniquement. Le blocage des publicités n'est pas modifié.

- **Balise :** chaque ligne écrite par le script commence par une balise violette `MATTEO12SA`, y compris les lignes venant du Worker du lecteur.
- **Console calme par défaut :** seules les lignes utiles s'affichent. Le journal technique (116 messages) reste disponible avec la commande `matteo12saDebug()` dans la console, et `matteo12saDebug(false)` revient au mode court. Le choix est conservé d'une page à l'autre.
- **Lignes en français, toujours affichées :** version chargée, pub détectée, pub bloquée avec le flux de secours utilisé (en vert), passage en 360p faute de flux propre (en orange), fin de la pub avec sa durée, rechargement du lecteur, plantage du lecteur, et présence d'un autre script VAFT.
- **Rediffusions :** une ligne « Pub VOD bloquée » à chaque demande publicitaire remplacée, avec le type (pré-roll ou mid-roll) et un compteur. Twitch envoie souvent deux demandes au lancement d'une VOD. La logique du filtre est inchangée.
- Le texte est transmis à la console comme valeur et non comme format : un `%` dans un message ne peut pas le déformer.
- Validation : 89 tests Node (dont 3 nouveaux sur la console), 128 scénarios natifs Chrome/Edge, puis essais réels sur Twitch : console par défaut et journal détaillé activé en cours de route pendant une coupure simulée, ligne « Pub VOD bloquée » sur une VOD.

## 38.0.2 — 12 novembre 2026

Corrections issues de la relecture complète du moteur, sans changement du blocage lui-même :

- **Requête bloquée pour toujours :** si le traitement d'une playlist échoue dans le Worker, la requête du lecteur est maintenant rejetée au lieu de rester en attente sans fin (deux endroits).
- **Appel GraphQL sans en-têtes :** l'interception de `fetch` ne suppose plus que chaque appel `gql` fournit des en-têtes.
- **Mauvaise vidéo visée :** après un rechargement et au retour sur l'onglet, le moteur agit sur la vidéo du lecteur et plus sur « la première vidéo de la page », qui peut être une publicité cachée.
- **Comportements réservés au direct :** le recalage sur le direct après un rechargement, la relance automatique au retour sur l'onglet et la mise en pause des vidéos publicitaires séparées ne s'appliquent plus aux VOD. Une VOD mise en pause reste en pause.
- **Code retiré :** l'envoi de faux signaux « publicité vue » à Twitch (166 lignes). Il était désactivé par défaut et ne s'exécutait jamais ; le réglage `twitchAdSolutions_disableAdSpoofing` n'existe plus.
- Chaque ligne modifiée du moteur porte la mention `MATTEO12SA`. Le module VOD est identique à celui de la 37.0.8.
- Validation : 86 tests Node, 128 scénarios natifs Chrome/Edge, puis essais réels sur Twitch sans erreur : direct avec coupure simulée (cas normal et pire cas, puis trois coupures à la suite), VOD, highlight, page de chaîne, et avec TwitchNoSub.
- Comportement vérifié sur Twitch : une VOD mise en pause pendant que l'onglet est caché reste en pause au retour, comme sans script (la 38.0.1 la relançait). Sur un direct, la relance au retour est conservée.
- Première version du nouveau moteur publiée sur `main`. Une vraie coupure publicitaire en direct avait été bloquée chez l'utilisateur avec la 38.0.1.

## 38.0.1 — 12 novembre 2026 (version de test, non publiée sur `main`)

- **Correction d'un défaut du moteur d'origine** : à chaque retour sur l'onglet Twitch, la surveillance du lecteur lançait une boucle supplémentaire sans arrêter la précédente. Mesuré sur Twitch : 10 passages en 6 secondes au départ, 110 après 10 retours sur l'onglet. La 37.0.8 n'avait pas ce défaut.
- Effet possible sur une longue session : charge du processeur croissante et fausses détections de blocage, puisque plusieurs boucles comparent l'état du lecteur à quelques millisecondes d'intervalle.
- Correction : la surveillance garde un seul minuteur et annule le précédent avant de se reprogrammer (deux lignes). Après correction : 10 passages en 6 secondes, même après 30 retours sur l'onglet.
- Le moteur diffère maintenant du fichier de ryanbr par deux changements documentés : le texte du bandeau et cette correction. Le module VOD est inchangé.
- Validation : 86 tests Node, 128 scénarios natifs Chrome/Edge, puis essais réels sur Twitch (direct avec coupure simulée, VOD) sans erreur.

## 38.0.0 — 12 novembre 2026 (version de test, non publiée sur `main`)

- **Nouveau moteur des directs** : celui de vaft 68.5.7 du fork [ryanbr/TwitchAdSolutions](https://github.com/ryanbr/TwitchAdSolutions), fichier `vaft/vaft.user.js` au commit `74f1248f22a61fcbb559882f93cb60ca25b414e8`, repris tel quel. Une seule ligne diffère : le bandeau affiche « Pub bloquée ».
- Motif : essai de l'utilisateur sur des directs avec ce script, sans publicité ni baisse de qualité. Le moteur 37.0.0 essayait `embed`, `popout` puis `autoplay` (360p), et n'essayait que `autoplay` pendant 1,5 s après chaque rechargement du lecteur.
- Ce que ce moteur change : flux de secours `site`, `popout`, `mobile_web`, `embed` en qualité source, 360p en dernier recours ; mémorisation du secours qui fonctionne ; cinq marqueurs de publicité ; fin de coupure confirmée après plusieurs playlists propres ; rechargement du lecteur seulement si nécessaire ; masquage des bandeaux publicitaires de Twitch ; plus de trucage de la visibilité de l'onglet ; les cadres imbriqués de même origine sont ignorés.
- Le module VOD de la 37.0.8 est conservé sans changement. Le moteur ajoute son propre compteur autour de `XMLHttpRequest.open` ; le module VOD reste le dernier installé.
- Nom, namespace et URL de mise à jour conservés. Réglages facultatifs du moteur : clés `localStorage` `twitchAdSolutions_*`, décrites dans le dépôt de ryanbr.
- Garder un seul script actif : désactiver « TwitchAdSolutions (vaft) » de ryanbr s'il est installé.
- Limites connues du moteur d'origine : dernière mise à jour le 27 août 2026 ; ses utilisateurs signalent depuis fin octobre des pauses autour des coupures.
- Validation : 86 tests Node et 128 scénarios natifs Chrome/Edge réussis, qui couvrent le module VOD et le démarrage du moteur. Essais réels sur Twitch sans erreur (direct, coupure simulée, VOD, highlight, page de chaîne, avec TwitchNoSub) : détail dans `.github/checks/README.md`. Aucune vraie coupure publicitaire en direct n'a été observée pendant ces essais.

## 37.0.8 — 12 novembre 2026

- Deux demandes de pré-roll VOD observées sur Twitch le 12 novembre 2026 échappaient à la 37.0.7, alors qu'elles ont le format déjà pris en charge :
  - **highlight** : `pj.v` vaut `HIGHLIGHT` au lieu de `ARCHIVE` ;
  - **rediffusion lancée sur la page d'une chaîne hors ligne** : la page est `/<chaîne>` et le paramètre `u` désigne cette page, pas une page `/videos/<id>`.
- Le module VOD accepte désormais les contenus `ARCHIVE` et `HIGHLIGHT`. La condition « même VOD que la page » devient « `u` désigne la page Twitch affichée » (même chemin ; barre finale, paramètres et préfixe `www` ignorés).
- Les autres conditions sont conservées : XHR GET, adresse exacte, VAST 3, placement `preroll` ou `midroll`, `pbid=twitch`, `csai` / `web_csai`, emplacement vidéo unique, paramètres non ambigus.
- Restent intacts : les contenus `LIVE`, les types non observés (`UPLOAD` par exemple), les demandes qui nomment une autre page, les requêtes `fetch /ads` et les bannières.
- Aucun changement au moteur des directs, aux Workers, aux qualités ni au lecteur. Nom, namespace et URL de mise à jour conservés.
- Validation : 86 tests Node et 124 scénarios natifs simulés Chrome/Edge réussis. Essai de l'utilisateur sur Twitch concluant le 12 novembre 2026.

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
