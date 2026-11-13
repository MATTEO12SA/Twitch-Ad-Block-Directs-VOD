# Validation et contribution

## Version 38.0.5 — 13 novembre 2026

- Base : 38.0.4 (commit `6a1ac69`). Ajout : `hookedTwitchWorkers`, `checkUnhookedPlayerWorker`, `tryUnhookedPageReload`, et le type de rechargement `worker-recovery` (remplace aussi un lecteur sain, nouvelle instance et nouveau jeton).
- Corps du moteur : SHA-256 `9d7ed7ecb21cd2dfb570e5012edb29eea77fe64baf19f96243cc150a1ba20600`.
- Le nouveau test exécute le vrai bloc de code avec une horloge simulée : Worker instrumenté ignoré, rien avant 5 secondes, rechargement du lecteur, puis rechargement de page, puis silence ; refus du rechargement de page s'il date de moins de 10 minutes ; aucune action sur une VOD, une vidéo en pause ou un onglet caché.
- **91 tests Node réussis** et **128 scénarios natifs réussis**.
- Essais réels sur Twitch avec l'outil d'injection tardive (script injecté une fois le direct en lecture) :
  - 38.0.4 : « chargé » s'affiche, la coupure simulée n'est pas détectée ;
  - 38.0.5, script de nouveau en retard après le rechargement de page : rechargement du lecteur, rechargement de page, puis message « le blocage n'est pas actif », sans boucle ;
  - 38.0.5, script à l'heure après le rechargement de page : Worker instrumenté, coupure simulée détectée et bloquée.
- Usage normal sans faux déclenchement : direct avec coupure simulée (y compris après le rechargement de fin de coupure), direct avec TwitchNoSub, VOD.
- Non couvert : la fréquence réelle des démarrages tardifs avec Violentmonkey n'a pas été mesurée.

## Version 38.0.4 — 13 novembre 2026

- Base : 38.0.3 (commit `97cfc53`). Un seul changement : `pruneStreamInfos` ne supprime un flux non interrogé depuis 30 minutes que si un autre flux du même Worker a été interrogé pendant cette durée.
- Le nouveau test exécute la vraie fonction, extraite du script : flux en pause depuis trois heures conservé avec ses adresses de playlists, flux quitté supprimé quand un autre est actif, entrée mal formée toujours supprimée. Sur le code de la 38.0.3, il échoue au premier cas.
- Corps du moteur : SHA-256 `fbad54fac2db1e66057b118ecc09542c5fe7dcbcb7b7ce418a1ac9bb9f7534af`.
- **90 tests Node réussis** et **128 scénarios natifs réussis**. Essais réels sur Twitch sans erreur : direct avec coupure simulée, VOD.
- Non couvert : la pause réelle de plus de 30 minutes suivie d'une publicité n'a pas été rejouée sur Twitch.

## Version 38.0.3 — 13 novembre 2026

- Base : 38.0.2 (commit `acf19e4`). Changement limité à la console.
- Moteur : les 116 appels `console.log` et les 2 `console.error` passent par `vaftLog`, déclarée dans le moteur et transmise au Worker. Huit lignes toujours affichées sont ajoutées, ainsi que la commande `matteo12saDebug()` et le message `SetDebugLog` vers le Worker. Corps du moteur : SHA-256 `3588813f5c60ea52064813ee0dc1bd475e08a076be1c8776aa1349b1c31740f5`.
- Module VOD : une fonction `reportBlocked` et son appel après le remplacement de l'adresse. Un test vérifie qu'une console indisponible n'empêche pas l'interception.
- **89 tests Node réussis** (3 nouveaux : ligne VOD, console indisponible, comportement de `vaftLog`) et **128 scénarios natifs réussis**.
- Essais réels sur Twitch, sans erreur :
  - console par défaut pendant une coupure simulée : version chargée, pub détectée, pub bloquée avec le flux `site`, fin de la pub, rechargement du lecteur, et rien d'autre ;
  - `matteo12saDebug()` appelée en cours de route : le journal détaillé apparaît, y compris les lignes du Worker ;
  - VOD : deux lignes « Pub VOD bloquée (pré-roll) » et lecture normale.

## Version 38.0.2 — 12 novembre 2026

- Vérifications faites juste avant la publication sur `main` :
  - relecture de chaque ligne modifiée dans son contexte, et des lignes voisines du code retiré ;
  - trois coupures simulées à la suite sur un direct (deux normales, un pire cas) : aucune erreur, retour en 720p après chacune ;
  - retour sur l'onglet après une vraie pause par le bouton du lecteur : sur une VOD, la vidéo reste en pause sans script et avec la 38.0.2, alors que la 38.0.1 la relançait ; sur un direct, la 38.0.1 et la 38.0.2 la relancent ;
  - une fausse vidéo publicitaire `media-amazon.com` ajoutée à côté du lecteur est cachée sur un direct et laissée telle quelle sur une VOD.
- Base : 38.0.1 (commit `c92649f`). Six corrections du moteur et un retrait de code, décrits dans le journal des versions. Chaque ligne modifiée porte la mention `MATTEO12SA`.
- Par rapport au fichier de ryanbr : 166 lignes en moins, 25 lignes propres à ce dépôt. Corps du moteur : SHA-256 `609d761ac6e6b2cec54e0138234384725ce5008f9c1f6f695dd69b4736452d85`. Le module VOD est identique, caractère pour caractère, à celui de la 37.0.8.
- Analyse automatique après les changements : aucune fonction, option ni champ inutilisé ; aucune référence restante au code retiré.
- 86 tests Node et 128 scénarios natifs réussis. Boucle de surveillance : 10 passages en 6 secondes, avant et après 15 retours sur l'onglet.
- Essais réels sur Twitch avec la 38.0.2, sans erreur : direct avec coupure simulée (720p continu, rechargement puis reprise), pire cas simulé (360p pendant la coupure, retour en 720p), VOD, highlight et page de chaîne (demande publicitaire remplacée), puis direct et VOD publique avec TwitchNoSub.
- Pendant ces essais, une chaîne a cessé de diffuser quelques minutes : la lecture ne démarrait avec aucune version, puis a repris avec les quatre versions comparées (38.0.2, 38.0.1, fichier de ryanbr, 37.0.8). Ce n'est pas un défaut du script.
- Toujours non couvert : une vraie coupure publicitaire avec la 38.0.2, les chaînes en 1440p HEVC, une VOD réservée aux abonnés lue avec TwitchNoSub, les longues sessions.

## Version 38.0.1 — 12 novembre 2026 (version de test)

- Relecture complète du script 38.0.0. Défaut trouvé dans le moteur d'origine : `monitorPlayerBuffering` se reprogramme sans condition, et l'écouteur `visibilitychange` l'appelle aussi directement à chaque retour sur l'onglet. Chaque retour ajoute donc une boucle permanente.
- Mesure sur Twitch (minuteries comptées pendant 6 secondes, Edge sans interface) : 38.0.0 et fichier de ryanbr non modifié, 10 puis 110 après 10 retours simulés ; 37.0.8, 10 puis 10 ; 38.0.1, 10 puis 10, y compris après 30 retours.
- Correction : `clearTimeout(monitorPlayerBuffering.timer)` avant de reprogrammer, et l'identifiant du minuteur est conservé.
- Le corps du moteur a maintenant pour SHA-256 `09d1dc79592eb686802f5e1b97edd6d1f8eea64006f100e312744c47a7351ce2`. Par rapport au fichier de ryanbr : la ligne du bandeau est remplacée, et la ligne `setTimeout(monitorPlayerBuffering, nextDelay);` est remplacée par trois lignes (un commentaire et la correction).
- 86 tests Node et 128 scénarios natifs réussis. Essais réels refaits avec la 38.0.1 : direct avec coupure simulée (720p continu, reprise après rechargement) et VOD (demande publicitaire remplacée), sans erreur.

## Version 38.0.0 — 12 novembre 2026 (version de test)

- Base : 37.0.8 (commit `f180cd1`).
- Moteur des directs : `vaft/vaft.user.js` de ryanbr/TwitchAdSolutions au commit `74f1248f22a61fcbb559882f93cb60ca25b414e8` (blob git `c80fb54fb3bedc72d0b2d0cf8ad3e90607fa6744`, version 68.5.7). Le corps du fichier après le bloc de métadonnées a pour SHA-256 `ba3df7aa9b02f23d9a61c0b013a39541039ba888b34d6ea50e48aeb160763abc`.
- Une seule ligne est modifiée (texte du bandeau). Le corps obtenu a pour SHA-256 `53c6d2c3a3705c472e6b285121b9bf6bb8707b5779a054782ebe6dc88cc0bf2e` ; le test « live engine is upstream vaft 68.5.7 with only the notice text changed » le vérifie.
- Pour reproduire : télécharger ce fichier à ce commit, retirer le bloc de métadonnées, remplacer la ligne `adBlockDiv.P.textContent = …` par celle du dépôt, normaliser les fins de ligne en LF, puis calculer le SHA-256.
- **86 tests Node réussis** et **128 scénarios natifs réussis** (32 par placement et par navigateur, Edge et Chrome) ; le compteur Node est de 132 avec les quatre groupes parents.
- Le test de coexistence est adapté : le moteur ajoute son compteur de requêtes autour de `XMLHttpRequest.open`, donc la fonction change quand l'ancien complément démarre en premier ; le test vérifie que le module VOD intégré ne s'empile pas.
- Essais réels sur Twitch le 12 novembre 2026 : Edge sans interface, son coupé, profil vierge, sans compte, script injecté au démarrage du document. Aucune erreur du script dans aucun essai.
  - Direct, 75 s : moteur chargé, Worker instrumenté, lecture continue en 720p.
  - Direct avec coupure simulée (`simulateAds(1)`, 36 s) : bandeau « Pub bloquée », secours `site`, lecture continue en 720p, rechargement en fin de coupure puis reprise en 720p. Sur la même chaîne, la 37.0.8 utilise `popout` et repasse brièvement en 360p après son rechargement.
  - Direct, pire cas simulé (`simulateAds(5)`, tous les secours en qualité source refusés) : secours `autoplay` en 360p sans interruption, puis retour en 720p après le rechargement de fin de coupure.
  - VOD, highlight et rediffusion sur page de chaîne : la demande publicitaire est remplacée par la réponse locale et la vidéo démarre. Témoin sans script : la demande part vers `edge.ads.twitch.tv`.
  - Avec le userscript TwitchNoSub 1.2.1 ajouté, sur un direct et sur une VOD publique : chaîne de Workers fonctionnelle, lecture normale.
- Non couvert : une vraie coupure publicitaire en direct (aucune n'est survenue), les chaînes en 1440p HEVC, une VOD réservée aux abonnés lue avec TwitchNoSub, les longues sessions. Ces points demandent l'essai de l'utilisateur.

## Version 37.0.8 — 12 novembre 2026

- Essai de l'utilisateur sur Twitch avec la version de test : concluant le 12 novembre 2026.
- Base : commit `1c57bc3acf7d5bb174be81fdd751db291972aab9` (37.0.7).
- Observation sur Twitch, navigateur sans extension ni compte, chaîne publique : six demandes de pré-roll relevées. Quatre correspondent au filtre 37.0.7 (chargement direct et navigation interne vers `/videos/<id>`). Deux lui échappent : un highlight (`pj.v = HIGHLIGHT`) et une rediffusion lancée sur la page d'une chaîne hors ligne (page et `u` = `/<chaîne>`). Tous les autres paramètres sont identiques.
- Avant la correction : les six nouveaux tests positifs échouent sur le code 37.0.7. Après : syntaxe valide, **86 tests Node réussis**.
- **124 scénarios natifs réussis** : 31 par placement et par navigateur (Edge et Chrome installés, Playwright 1.65.0). Le compteur Node est de **128** avec les quatre groupes parents.
- Le hash du moteur direct reste identique. Le test de comparaison avec l'ancien complément liste chaque différence autorisée.
- Non couvert par les essais automatisés : aucune publicité Twitch réelle n'y est bloquée. Les vidéos de type `UPLOAD` et les mid-rolls demandés pendant la navigation avec le mini-lecteur n'ont pas été observés.

## Version 37.0.7 — 9 novembre 2026

- Base : commit `13fec116d7d37b0235fdb35ed03dc5731f310e71` (37.0.5).
- Avant la correction : les nouveaux tests positifs mid-roll (interception, navigation SPA, nouveau module chargé avant l'ancien complément) échouent ; les 68 autres tests réussissent.
- Après la correction : syntaxe valide, **71 tests Node réussis**.
- **112 scénarios natifs réussis** : 28 par placement (`preroll`, `midroll`) et par navigateur, Edge 157.0.4341.42 et Chrome 156.0.8078.80, avec Playwright 1.65.0. Le compteur Node est de **116**, car il inclut les quatre groupes parents.
- Requêtes HTTP(S) fictives, profils isolés sans extensions : aucune publicité Twitch réelle n'a été bloquée durant ces essais automatisés. Reprise effective de la VOD, son et image à valider par l'utilisateur.
- Le hash du moteur direct reste identique. Le test comparant le module à l'ancien complément autorise uniquement le contrôle d'origine déjà présent et la condition de placement modifiée.
- L'ancien complément chargé en premier conserve son filtre pré-roll : cette limite est explicitement testée. Le désactiver et recharger la page après la mise à jour.

## Résultats de la version 37.0.4

Contrôles exécutés le 26 octobre 2026 :

| Vérification | Résultat | Portée |
| --- | --- | --- |
| Syntaxe du userscript | Réussie | Fichier distribuable complet |
| Tests Node.js | 38 réussis | Ciblage, compatibilité du complément, métadonnées et conservation du moteur des directs |
| Edge 156.0.4314.42 | 24 scénarios réussis | Userscript complet et XHR natif sur des pages de test locales |
| Chrome 156.0.8078.48 | 24 scénarios réussis | Mêmes scénarios sur des pages de test locales |
| Essais utilisateur sur Twitch | Pré-roll observé bloqué | Complément 0.1.0, Edge, Violentmonkey et TwitchNoSub |

Les essais utilisateur ont alterné complément désactivé (pré-roll visible) et activé (démarrage de la VOD sans ce pré-roll). Les captures réseau montrent des réponses locales `200`, de type XML, contenant `<VAST version="3.0"></VAST>`. Elles confirment le fonctionnement pour ce format, sans prouver la couverture de toutes les publicités Twitch.

La version 37.0.4 intégrée reprend le code du complément, à l'exception du contrôle d'origine qui reproduit ses anciennes règles `@match`. Le code JavaScript préexistant de la 37.0.3 est vérifié par empreinte après normalisation des fins de ligne. Les modifications des métadonnées sont contrôlées séparément.

Les tests de navigateur injectent le fichier complet dans un contexte isolé, sans profil personnel ni extension. Toutes les requêtes HTTP(S) sont servies par des données fictives. Ils ne contactent pas Twitch et ne remplacent pas un essai avec Violentmonkey et TwitchNoSub.

## Reproduire les contrôles

Avec Node.js 22 ou une version supérieure, depuis la racine du dépôt :

```sh
npm --prefix .github/checks run check
npm --prefix .github/checks test
```

Ces commandes ne demandent aucune dépendance supplémentaire. GitHub Actions les exécute sur les pushes et les pull requests.

Pour les tests de navigateur, depuis la racine du dépôt, entrer dans le dossier technique et installer Playwright comme outil de développement local :

```sh
cd .github/checks
npm install --no-save --package-lock=false playwright@1.65.0
npm run test:browser
```

Sous Windows, la suite utilise Chrome et Edge s'ils sont présents aux emplacements standards. Sinon, elle utilise le Chromium fourni par Playwright, à installer avec `npx playwright install chromium`. Un navigateur précis peut être choisi avec la variable d'environnement `VAFT_TEST_EXECUTABLE`. `VAFT_TEST_NODE_MODULES` permet d'utiliser une installation existante de Playwright.

La sortie Node compte aussi les tests parents. Avec Chrome et Edge et les deux placements, **116 tests** correspondent à **112 scénarios et 4 groupes**.

## Ce qui est testé

- Ciblage de la requête XHR GET VAST 3 de pré-roll ou mid-roll pour la VOD actuellement affichée.
- Passage inchangé des directs, autres placements, bannières, requêtes `fetch /ads`, autres domaines, autres formats et données ambiguës ou invalides.
- Réponse XML vide, statut 200, événements natifs, en-têtes personnalisés et type de réponse `document`.
- Annulation avant et après l'envoi, réutilisation d'un XHR, appels synchrones et arguments de la méthode native `open`.
- Navigation VOD → direct → VOD sans rechargement.
- Coexistence pré-roll du complément et du script intégré dans les deux ordres de chargement, sans empilement des interceptions ; limite du mid-roll si l'ancien complément est chargé d'abord.
- Conservation des nom, identifiant et URL de mise à jour, de `@grant none` et de l'absence de dépendance distante `@require`.

La réponse locale utilise une URL `data:`. Son `responseURL` est donc local. Une politique CSP interdisant `data:` dans `connect-src` entraîne une erreur native : la suite vérifie cette limite, elle ne la contourne pas. Les captures utilisateur confirment l'acceptation de cette réponse dans la session Twitch testée.

## Pour signaler un problème

Ouvrir une [issue](https://github.com/MATTEO12SA/Twitch-Ad-Block-Directs-VOD/issues) en précisant la version du script, le navigateur, le gestionnaire, les autres scripts actifs et si le problème concerne un direct ou une VOD. Décrire les étapes et le résultat attendu ; un lien public vers la vidéo peut aider.

Pour une publicité VOD, les informations utiles sont la méthode et le chemin de la requête, son format de réponse, les marqueurs `rt`, `bp` et `pj.v`, et l'effet de l'activation/désactivation du script après rechargement. Ne pas publier de cookies, jetons, URL signées, HAR brut ou en-têtes de connexion. Les tests du dépôt utilisent exclusivement des valeurs fictives.

Un changement doit rester limité au problème reproduit, passer les contrôles et être décrit dans le journal des versions. Les nouveaux formats publicitaires doivent être validés avant d'élargir le ciblage.
