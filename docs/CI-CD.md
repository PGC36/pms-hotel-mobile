# CI/CD App Móvil — PMS Hotel Boutique Aurora

Este documento describe la canalización de la app móvil (GitHub Actions y Jenkins), el análisis con SonarQube Cloud (o, como alternativa, un servidor SonarQube self-hosted) y su Quality Gate, y los builds nativos con Expo EAS. Responde al issue #24.

La app es Expo/React Native: **no se empaqueta en Docker**. Los entregables son builds nativos de EAS (APK/AAB Android, build de simulador iOS). **Nada se publica automáticamente en App Store ni Play Store.**

## Resumen

| Evento                         | Pipeline                                 | Qué hace                                                                                                                                                         |
| ------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR hacia `develop` o `main`    | `.github/workflows/ci.yml`               | `npm ci`, formato, TypeScript, lint, pruebas + cobertura, build de validación (`expo export`), SonarQube + Quality Gate (si hay secrets y el servidor responde)  |
| Push a `main`                  | `.github/workflows/ci.yml`               | La misma validación sobre el código ya fusionado                                                                                                                 |
| Push a `develop` (merge de PR) | `.github/workflows/mobile-eas-build.yml` | **Solo si el PR tiene la etiqueta `build`**: reejecuta la validación y genera el build **preview** de QA (APK Android instalable). Sin la etiqueta, no hace nada |
| Tag `vX.Y.Z`                   | `.github/workflows/mobile-eas-build.yml` | Reejecuta la validación y genera el build **production**: AAB Android firmado + build de simulador iOS, adjuntos a un GitHub Release                             |
| Manual (`workflow_dispatch`)   | ambos                                    | `ci.yml` sin parámetros; `mobile-eas-build.yml` con perfil `preview` o `production` y simulador iOS opcional                                                     |
| Jenkins on-premise             | `Jenkinsfile`                            | Las mismas validaciones y SonarQube; build preview en `develop` solo con el parámetro `EAS_PREVIEW_BUILD`, y release en tags                                     |

Ninguna credencial está en el repositorio: todo llega por secrets de GitHub o credenciales de Jenkins. Si faltan, la etapa correspondiente **se omite con un aviso explícito** y nunca se reporta como aprobada. Las validaciones básicas (formato, tipos, lint, pruebas, build de validación) no necesitan ninguna credencial.

## Etapas y scripts

Cada etapa es un script de `package.json`, idéntico en local, Actions y Jenkins:

| Etapa               | Script                   | Detalle                                                                                                                                            |
| ------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Instalación         | `npm ci`                 | Reproducible desde `package-lock.json`. Node 20 (`>= 20.19.4`, mínimo de React Native 0.86)                                                        |
| Formato             | `npm run format:check`   | Prettier (`.prettierrc.json`). `.gitattributes` fuerza LF para que no falle en Windows                                                             |
| TypeScript          | `npm run typecheck`      | `tsc --noEmit`                                                                                                                                     |
| Lint                | `npm run lint`           | `expo lint` (ESLint + `eslint-config-expo` + `eslint-config-prettier`)                                                                             |
| Pruebas + cobertura | `npm run test:coverage`  | `c8 npm test`: corre los scripts de `scripts/test-*.ts` (con `tsx`) y genera `coverage/lcov.info` (config en `.c8rc.json`)                         |
| Build de validación | `npm run build:validate` | `expo export --platform all --output-dir dist`: compila los bundles Android, iOS y web con Metro. Detecta errores de bundling sin credenciales EAS |
| SonarQube           | `npm run sonar`          | `@sonar/scan` (devDependency, compatible con Node 20). Lee `sonar-project.properties`                                                              |

`npm run ci` ejecuta en orden todo lo anterior salvo SonarQube. Es lo que conviene correr antes de abrir un PR.

Cualquier fallo de formato, tipos, lint, pruebas o build hace fallar el job y, por lo tanto, el PR. Al final de cada run, el **resumen del job** (pestaña _Summary_) muestra una tabla con el resultado de cada etapa, incluida una línea inequívoca de SonarQube: `✅ Quality Gate aprobado`, `❌ Quality Gate rechazado…` o `⚠️ OMITIDO — <motivo>. No es un Quality Gate aprobado.`

### Agregar pruebas

`npm test` encadena los scripts `scripts/test-*.ts`. Para sumar una prueba, crea otro `scripts/test-<tema>.ts` (mismo estilo: `assert` propio, `throw` ante fallo) y agrégalo a la cadena de `test` en `package.json`. La cobertura se recalcula sola.

## Variables y secrets

### GitHub → Settings → Secrets and variables → Actions

| Secret               | Obligatorio                                                   | Uso                                                                                                                     |
| -------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `SONAR_TOKEN`        | No (sin él se omite SonarQube)                                | Token de análisis. Cloud: _My Account → Security_. Self-hosted: _Project Analysis Token_ `ci-pms-hotel-mobile`          |
| `SONAR_HOST_URL`     | No (sin él se omite SonarQube)                                | `https://sonarcloud.io` en Cloud. En self-hosted, una URL alcanzable **desde los runners de GitHub**                    |
| `SONAR_PROJECT_KEY`  | No (default `pms-hotel-mobile` de `sonar-project.properties`) | projectKey. En Cloud es el que asigna SonarQube Cloud al importar el repo (suele ser `<organizacion>_pms-hotel-mobile`) |
| `SONAR_ORGANIZATION` | Solo en SonarQube Cloud                                       | Key de la organización en SonarQube Cloud. Vacío = self-hosted                                                          |
| `EXPO_TOKEN`         | No (sin él se omiten los builds EAS)                          | Access token de la cuenta de Expo (expo.dev → Account settings → Access tokens)                                         |

El GitHub Release de los tags usa el `GITHUB_TOKEN` automático (el job declara `contents: write`). Revisa en **Settings → Actions → General → Workflow permissions** que el repo no bloquee ese permiso.

### Jenkins → Manage Jenkins → Credentials

Mismos IDs que el backend, más `sonar-organization` y `expo-token`:

| ID                   | Tipo                   | Equivale a                                                |
| -------------------- | ---------------------- | --------------------------------------------------------- |
| `sonar-token`        | Secret text            | `SONAR_TOKEN`                                             |
| `sonar-host-url`     | Secret text            | `SONAR_HOST_URL` (en on-premise puede ser la URL interna) |
| `sonar-project-key`  | Secret text (opcional) | `SONAR_PROJECT_KEY`                                       |
| `sonar-organization` | Secret text (Cloud)    | `SONAR_ORGANIZATION`                                      |
| `expo-token`         | Secret text            | `EXPO_TOKEN`                                              |

### Variables de la app en los builds EAS

Los builds de EAS corren en los servidores de Expo y **no reciben las variables del runner**. La app necesita `EXPO_PUBLIC_API_BASE_URL` (ver `.env.example`). Se carga como variable de entorno de EAS, una por entorno. Los perfiles de `eas.json` ya apuntan a `environment: preview` y `environment: production`:

```bash
npx eas-cli env:create --environment preview    --name EXPO_PUBLIC_API_BASE_URL --value https://<api-qa>/api/v1    --visibility plaintext
npx eas-cli env:create --environment production --name EXPO_PUBLIC_API_BASE_URL --value https://<api-prod>/api/v1  --visibility plaintext
```

Sin esa variable el build se genera igual, pero la app muestra el error de "URL del servidor no configurada" al llamar a la API. Usa HTTPS: Android bloquea por defecto el tráfico HTTP en claro en builds de release.

### Local

- `.env.local` (ignorado por git): `EXPO_PUBLIC_API_BASE_URL` para `expo start` y, opcionalmente, `SONAR_HOST_URL`/`SONAR_TOKEN`/`SONAR_ORGANIZATION`/`SONAR_PROJECT_KEY` para el scanner y `SONAR_ADMIN_PASSWORD` para el script de setup (solo self-hosted).
- `.env` también está en `.gitignore` y el script de setup lo lee si existe.

## SonarQube Cloud (opción en uso)

El análisis de GitHub Actions corre contra **SonarQube Cloud** (`https://sonarcloud.io`). A diferencia de un servidor en `localhost`, es público: los runners de GitHub llegan a él y el análisis se ejecuta de verdad en cada PR. El workflow y el Jenkinsfile detectan Cloud porque `SONAR_ORGANIZATION` tiene valor y agregan `-Dsonar.organization`; con `SONAR_ORGANIZATION` vacío funcionan como self-hosted.

### Configuración (una sola vez)

1. En sonarcloud.io, dentro de la organización, **importar el repo** `PGC36/pms-hotel-mobile` (_+ → Analyze new project_).
2. En el proyecto: _Administration → Analysis Method_ → **desactivar Automatic Analysis**. Si queda activo, el análisis desde CI falla ("You are running CI analysis while Automatic Analysis is enabled") y además el análisis automático no importa la cobertura de `coverage/lcov.info`.
3. Generar un token en _My Account → Security_.
4. Cargar en GitHub los secrets `SONAR_TOKEN`, `SONAR_HOST_URL=https://sonarcloud.io`, `SONAR_PROJECT_KEY` (el key que muestra _Project Information_) y `SONAR_ORGANIZATION`.

No se usa `scripts/sonarqube/setup-sonarqube.sh` ni `SONAR_ADMIN_PASSWORD`: el proyecto, el gate y el token se administran desde la UI de SonarQube Cloud.

### Quality Gate en Cloud

En el plan gratuito, SonarQube Cloud aplica el gate **Sonar way** (entre otras condiciones, cobertura ≥ 80 % en código nuevo) y los gates personalizados requieren un plan de pago; confirmarlo en _Organization → Quality Gates_. Si el plan lo permite, crear un gate con las condiciones de la tabla de "Aurora Mobile" (más abajo) y asignarlo al proyecto. La configuración de `sonar.coverage.exclusions` de `sonar-project.properties` aplica igual en Cloud.

**Cambios pequeños:** la organización tiene activado _Ignore duplication and coverage on small changes_ (_Quality gate settings_, activo por defecto). Las condiciones de **cobertura y duplicación** sobre código nuevo se ignoran mientras el cambio tenga **menos de 20 líneas nuevas**; bugs, vulnerabilidades y ratings se evalúan siempre. Así, un arreglo de pocas líneas sin prueba no rompe el gate, y la exigencia de cobertura aplica a los cambios con lógica real. Conviene dejarlo activado: si se apaga a nivel de organización, queda apagado para todos los proyectos y no se puede reactivar por proyecto (con la organización activada, cada proyecto sí puede desactivarlo para sí mismo).

A diferencia de Community Build, SonarQube Cloud **sí analiza PR y ramas**: en GitHub Actions el scanner detecta el PR solo y el Quality Gate evalúa el código nuevo del PR.

Análisis manual en local contra Cloud:

```bash
npm run test:coverage
npm run sonar -- -Dsonar.host.url=https://sonarcloud.io -Dsonar.organization=<organizacion> -Dsonar.projectKey=<project-key> -Dsonar.token=<SONAR_TOKEN> -Dsonar.qualitygate.wait=true
```

## SonarQube self-hosted (alternativa)

Si no se usa Cloud, se puede usar **el mismo servidor SonarQube Community que el backend** (un servidor, varios proyectos). En este caso `SONAR_ORGANIZATION` queda vacío.

### 1. Levantar el servidor (desde el repo del backend)

```bash
cd ../pms-hotel-boutique-backend
docker compose -f docker-compose.sonarqube.yml up -d
curl http://localhost:9000/api/system/status   # {"status":"UP", ...}
```

Detalles del contenedor (volúmenes, `vm.max_map_count` en Linux) en `pms-hotel-boutique-backend/docs/CI-CD.md`.

### 2. Crear proyecto, Quality Gate y token

```bash
SONAR_ADMIN_PASSWORD='<clave-admin>' ./scripts/sonarqube/setup-sonarqube.sh
```

`scripts/sonarqube/setup-sonarqube.sh` es una copia adaptada del script del backend. Es idempotente:

1. Espera a que el servidor esté `UP`.
2. Cambia la contraseña inicial `admin/admin` si sigue vigente (si el backend ya lo hizo, usa `SONAR_ADMIN_PASSWORD` tal cual).
3. Crea el proyecto `pms-hotel-mobile` — _PMS Hotel Boutique Mobile_, rama principal `main`.
4. Crea (o recrea) el Quality Gate **Aurora Mobile**, borra las condiciones "Clean as You Code" que SonarQube agrega por defecto y lo asigna al proyecto.
5. Genera el token `ci-pms-hotel-mobile` de tipo **Project Analysis Token** y lo imprime una sola vez. Si ya existe, lo conserva. `SONAR_REGENERATE_TOKEN=true` lo revoca y genera uno nuevo.

Variables: `SONAR_HOST_URL` (default `http://localhost:9000`), `SONAR_PROJECT_KEY`, `SONAR_PROJECT_NAME`, `SONAR_GATE_NAME`, `SONAR_COVERAGE_MIN` (default `60`), `SONAR_TOKEN_NAME`.

En Windows se ejecuta desde Git Bash.

### 3. Quality Gate "Aurora Mobile"

Todas las condiciones aplican **solo a código nuevo**:

| Condición               | Métrica (modo estándar)        | Equivalente en modo MQR                       | Falla si   |
| ----------------------- | ------------------------------ | --------------------------------------------- | ---------- |
| Bugs nuevos             | `new_bugs`                     | `new_software_quality_reliability_issues`     | `> 0`      |
| Vulnerabilidades nuevas | `new_vulnerabilities`          | `new_software_quality_security_issues`        | `> 0`      |
| Mantenibilidad          | `new_maintainability_rating`   | `new_software_quality_maintainability_rating` | peor que A |
| Duplicación             | `new_duplicated_lines_density` | —                                             | `> 3 %`    |
| Cobertura               | `new_coverage`                 | —                                             | `< 60 %`   |

El script intenta primero la métrica estándar y, si el servidor está en modo MQR, usa el equivalente. El backend exige 70 % de cobertura; la app móvil arranca en **60 %** porque partió sin pruebas. Para subirlo: `SONAR_COVERAGE_MIN=70 ./scripts/sonarqube/setup-sonarqube.sh`.

### 4. Configuración del scanner

`sonar-project.properties`:

- `sonar.projectKey=pms-hotel-mobile`, `sonar.sources=src`, `sonar.tests=scripts` (solo `scripts/test-*.ts`).
- `sonar.javascript.lcov.reportPaths=coverage/lcov.info` (generado por `npm run test:coverage`).
- `sonar.exclusions=node_modules/**,coverage/**,dist/**,.expo/**`.
- `sonar.coverage.exclusions`: pantallas, componentes visuales, navegación, contextos, DTOs, tema y datos de demostración (`src/data`). No tienen pruebas unitarias, así que se excluyen **solo del cálculo de cobertura**. Se siguen analizando para bugs, vulnerabilidades, code smells y duplicación. La cobertura del 60 % se exige sobre la lógica: servicios, mappers, models, utils y constants. Si el equipo agrega pruebas de componentes, conviene reducir esta lista.

El análisis siempre corre con `-Dsonar.qualitygate.wait=true -Dsonar.qualitygate.timeout=300`. El scanner espera el veredicto y termina con error si el Quality Gate falla, lo que hace fallar el job en Actions o la etapa en Jenkins.

Análisis manual en local (sirve para revisar antes de un PR):

```bash
npm run test:coverage
npm run sonar -- -Dsonar.host.url=http://localhost:9000 -Dsonar.token=<SONAR_TOKEN> -Dsonar.qualitygate.wait=true
```

### 5. Cuándo se ejecuta y cuándo se omite

| Situación                               | GitHub Actions                                                                             | Jenkins                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Faltan `SONAR_TOKEN` o `SONAR_HOST_URL` | `::notice title=SonarQube omitido::`, el job sigue en verde y el resumen dice **OMITIDO**  | La etapa registra "SonarQube OMITIDO" y continúa       |
| El servidor no responde `UP`            | `::warning title=SonarQube omitido::`, el job sigue en verde y el resumen dice **OMITIDO** | `unstable(...)`: el build queda **amarillo**, no verde |
| Servidor UP y Quality Gate aprobado     | ✅ en el resumen                                                                           | Etapa verde                                            |
| Servidor UP y Quality Gate rechazado    | ❌ el job falla y bloquea el PR (si el check es requerido)                                 | La etapa falla                                         |

**Con self-hosted en `localhost`:** los runners de GitHub no llegan a `http://localhost:9000`, así que en GitHub Actions el análisis queda **OMITIDO** (el aviso dice que no responde UP). El análisis efectivo correría en **Jenkins on-premise** con la URL interna y en local. Para activarlo en GitHub hay que exponer el servidor (túnel o dominio) o registrar un runner self-hosted. Con SonarQube Cloud este problema no existe.

### 6. Limitaciones de SonarQube Community Build

- **No analiza pull requests ni ramas.** Solo existe la rama principal (`main`). Cada análisis, venga de un PR, de `develop` o de `main`, **sobrescribe** el estado del único proyecto. En la práctica, el Quality Gate que se ve en un PR evalúa "código nuevo" según la definición del proyecto (por defecto, respecto a la versión anterior), no el diff exacto del PR.
- No hay decoración de PR en GitHub. El resultado se ve en el log y el resumen del job y en la UI de SonarQube.
- Análisis por rama y PR requieren Developer Edition o superior.

## Expo / EAS

### Perfiles (`eas.json`)

| Perfil                 | Uso                       | Android                                                 | iOS                                                       |
| ---------------------- | ------------------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| `preview`              | QA, a pedido (ver abajo)  | APK (`distribution: internal`), instalable directamente | Build de simulador (`.tar.gz` con el `.app`), solo manual |
| `production`           | Release, en tags `vX.Y.Z` | AAB (`app-bundle`) firmado, listo para Play Console     | Build firmado: **pendiente** (sin Apple Developer)        |
| `production-simulator` | Release iOS sin firma     | —                                                       | `production` + `simulator: true`                          |

- `cli.appVersionSource: "remote"` y `autoIncrement: true` en `production`: EAS administra y autoincrementa `versionCode` (Android) y `buildNumber` (iOS). La versión visible (`expo.version` de `app.json`, hoy `1.0.0`) se cambia a mano.
- Identificadores: `com.pmshotel.mobile` (Android `package` e iOS `bundleIdentifier`, en `app.json`).
- No hay perfil ni paso de `eas submit`: **ningún pipeline publica en tiendas.**

### Preparación (una sola vez, la hace el dueño de la cuenta de Expo)

```bash
npx eas-cli login
npx eas-cli init            # vincula el proyecto: escribe extra.eas.projectId (y owner) en app.json -> commitear
npx eas-cli build --platform android --profile preview   # primer build INTERACTIVO: EAS genera y guarda el keystore
```

El keystore Android lo genera y custodia EAS (credenciales remotas), nunca el repositorio. **El primer build Android tiene que ser interactivo**, porque en modo `--non-interactive` (CI) EAS no puede crear un keystore nuevo. A partir de ahí, Actions y Jenkins reutilizan el mismo keystore remoto. Para respaldarlo: `npx eas-cli credentials` → Android → _Download keystore_ (guárdalo fuera del repo).

Después, crea el `EXPO_TOKEN` y cárgalo en GitHub y en Jenkins.

### Cuándo se genera un build preview

Cada build nativo consume la **cuota mensual de EAS**, así que los preview se generan solo cuando hacen falta (una app instalada para QA, una demo o una entrega). Para revisar cambios durante el desarrollo basta **Expo Go**: `npx expo start` y escanear el QR, sin build.

| Situación                                       | ¿Build?                                                                       |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| Abrir o actualizar un PR hacia `develop`/`main` | No. Solo validación (`ci.yml`), incluido `expo export`                        |
| Mergear a `develop` un PR **sin** etiqueta      | No. El run lo informa ("EAS build no solicitado") y no consume cuota          |
| Mergear a `develop` un PR **con** `build`       | Sí: validación completa + preview **Android** (APK)                           |
| _Actions → Mobile EAS Build → Run workflow_     | Sí: el perfil elegido; marcar _Incluir build de simulador iOS_ para sumar iOS |
| Tag `vX.Y.Z`                                    | Sí: production Android + simulador iOS y GitHub Release                       |

- La etiqueta se agrega en el PR (_Labels → build_) **antes de mergear**. Al mergear, el workflow busca el PR del commit en `develop` y lee sus etiquetas.
- El simulador iOS ya no se genera en los preview automáticos: sin cuenta Apple Developer solo sirve en macOS y gastaba la mitad de la cuota.
- En Jenkins, el equivalente es lanzar el job de `develop` con _Build with Parameters_ → `EAS_PREVIEW_BUILD` (y `EAS_PREVIEW_IOS` para sumar iOS). Por defecto ambos están apagados.

### Artefactos para QA

- Cada build de EAS queda disponible en expo.dev (proyecto → _Builds_). La URL de descarga directa aparece en el resumen del job.
- Además, el workflow descarga el archivo y lo conserva como artefacto del run (`eas-preview-android`, `eas-preview-ios`, …) durante **30 días**. Jenkins lo archiva en el build (`eas-artifacts/`).
- APK: se instala en un dispositivo o emulador Android. Build de simulador iOS: se descomprime y se arrastra el `.app` al simulador de Xcode (macOS).

### Release versionada

1. En una rama hacia `main`, actualiza `expo.version` en `app.json` (p. ej. `1.1.0`) y fusiona.
2. Crea y empuja el tag desde `main`: `git tag v1.1.0 && git push origin v1.1.0`.
3. `mobile-eas-build.yml` verifica que el tag coincida con `expo.version` (si no coincide, falla), corre la validación completa, genera los builds `production` y crea el GitHub Release `v1.1.0` con el AAB y el build de simulador iOS adjuntos.
4. Publicar en tiendas sigue siendo **manual y con aprobación explícita** (ver prerequisitos).

Si falta `EXPO_TOKEN` o `app.json` no tiene `extra.eas.projectId`, el workflow lo avisa (`::notice title=EAS build omitido::`) y no genera builds ni Release.

## Jenkins

`Jenkinsfile` replica las etapas de Actions: Checkout → `npm ci` → Formato → TypeScript → Lint → Pruebas + cobertura → Build de validación → SonarQube + Quality Gate → EAS build preview (rama `develop`, solo con el parámetro `EAS_PREVIEW_BUILD`) / EAS build release (tags).

- **Agente:** Linux, Node.js 20 (`>= 20.19.4`) con `npm` en el PATH, `git` y `curl`. No necesita Java: `@sonar/scan` descarga el motor del scanner (y su JRE) desde el servidor SonarQube. Tampoco necesita Docker.
- **Plugins:** Pipeline, Git, Credentials Binding, Timestamper. Se recomienda un **Multibranch Pipeline** con descubrimiento de ramas y de **tags**, para que `branch 'develop'` y `buildingTag()` funcionen.
- **Credenciales:** las de la tabla de arriba. Cada etapa que usa una credencial va dentro de `try/catch CredentialNotFoundException`: si falta, la etapa se omite con un mensaje y el pipeline continúa.
- **SonarQube no UP:** `unstable(...)`. El build queda amarillo y no se presenta como aprobado.
- **Artefactos archivados:** `coverage/**`, `dist/**` (bundle de validación), `eas-artifacts/**` y `eas-build-*.json`.

## Prerequisitos externos pendientes

| Prerequisito                                                          | Estado                                                                       | Para qué                                                                 |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| SonarQube alcanzable desde los runners de GitHub                      | **Pendiente**: hoy solo en `localhost:9000`, sin túnel ni runner self-hosted | Que el Quality Gate se ejecute en PRs de GitHub (hoy queda OMITIDO)      |
| Ejecutar `setup-sonarqube.sh` y cargar los secrets                    | Pendiente (lo hace quien administra SonarQube)                               | Proyecto, Quality Gate "Aurora Mobile" y token `ci-pms-hotel-mobile`     |
| Instancia Jenkins con las credenciales                                | Pendiente: hoy solo existe el `Jenkinsfile` documentado                      | Correr el pipeline on-premise                                            |
| `eas-cli login` + `eas-cli init` (cuenta personal de Expo)            | Pendiente                                                                    | `extra.eas.projectId` en `app.json`                                      |
| Primer build Android interactivo (keystore en EAS)                    | Pendiente                                                                    | Builds Android firmados desde CI                                         |
| `EXPO_TOKEN` en GitHub y `expo-token` en Jenkins                      | Pendiente                                                                    | Builds EAS automáticos                                                   |
| `EXPO_PUBLIC_API_BASE_URL` en los entornos EAS `preview`/`production` | Pendiente: requiere una URL pública de la API (HTTPS)                        | Que los builds instalados lleguen al backend                             |
| Cuenta Apple Developer (99 USD/año)                                   | **No disponible**                                                            | Build iOS firmado (dispositivo/TestFlight/App Store). Hoy solo simulador |
| Cuenta Google Play Console + aprobación explícita                     | No configurada                                                               | Publicar el AAB. Nunca automático                                        |

Para habilitar la publicación en tiendas en el futuro: agregar un perfil `submit` en `eas.json`, configurar las credenciales de las tiendas en EAS y un paso `eas submit` en un workflow **manual** (`workflow_dispatch`) protegido por un _environment_ de GitHub con revisores requeridos.

## Protección de ramas (recomendado)

En **Settings → Branches** para `develop` y `main`: exigir que pase el check **"Formato, tipos, lint, pruebas, build y SonarQube"** (de `Mobile CI`) antes de fusionar. Así un PR que falle en cualquiera de esas etapas, o en el Quality Gate cuando el servidor está configurado, no se puede fusionar.
