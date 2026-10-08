// Pipeline app móvil PMS Hotel Boutique Aurora (equivalente on-premise de GitHub Actions:
// .github/workflows/ci.yml + mobile-eas-build.yml). Ver docs/CI-CD.md.
// Requisitos del agente: Linux, Node.js 20 (>= 20.19.4) con npm en el PATH, git y curl.
// Se recomienda un job Multibranch Pipeline con descubrimiento de tags, para que
// branch 'develop' y buildingTag() funcionen.
//
// Credenciales Jenkins (todas opcionales; si no existen, la etapa se omite):
//   sonar-token        Secret text  -> SONAR_TOKEN
//   sonar-host-url     Secret text  -> SONAR_HOST_URL (en on-premise puede ser la URL interna)
//   sonar-project-key  Secret text  -> SONAR_PROJECT_KEY (default: sonar-project.properties)
//   expo-token         Secret text  -> EXPO_TOKEN (builds EAS)
pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 150, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'node --version && npm --version'
            }
        }

        stage('Instalar dependencias') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Formato') {
            steps {
                sh 'npm run format:check'
            }
        }

        stage('TypeScript') {
            steps {
                sh 'npm run typecheck'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Pruebas + cobertura') {
            steps {
                sh 'npm run test:coverage'
            }
            post {
                always {
                    archiveArtifacts allowEmptyArchive: true, artifacts: 'coverage/**'
                }
            }
        }

        stage('Build de validación') {
            steps {
                sh 'npm run build:validate'
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        stage('SonarQube + Quality Gate') {
            steps {
                script {
                    try {
                        withCredentials([
                            string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN'),
                            string(credentialsId: 'sonar-host-url', variable: 'SONAR_HOST_URL')
                        ]) {
                            def projectKey = ''
                            try {
                                withCredentials([string(credentialsId: 'sonar-project-key', variable: 'KEY')]) {
                                    projectKey = env.KEY
                                }
                            } catch (ignored) {
                                echo 'sonar-project-key no configurada; se usa el projectKey de sonar-project.properties.'
                            }
                            def up = sh(script: 'curl -fsS --max-time 20 "${SONAR_HOST_URL%/}/api/system/status" | grep -q \'"status":"UP"\'', returnStatus: true) == 0
                            if (!up) {
                                unstable('SonarQube no responde UP; se omite el análisis (no equivale a un Quality Gate aprobado).')
                                return
                            }
                            withEnv(["SONAR_PROJECT_KEY=${projectKey}"]) {
                                sh '''
                                    npm run sonar -- \
                                      -Dsonar.host.url="$SONAR_HOST_URL" \
                                      -Dsonar.token="$SONAR_TOKEN" \
                                      ${SONAR_PROJECT_KEY:+-Dsonar.projectKey="$SONAR_PROJECT_KEY"} \
                                      -Dsonar.qualitygate.wait=true \
                                      -Dsonar.qualitygate.timeout=300
                                '''
                            }
                        }
                    } catch (org.jenkinsci.plugins.credentialsbinding.impl.CredentialNotFoundException e) {
                        echo "SonarQube OMITIDO (no es un Quality Gate aprobado): ${e.message}"
                    }
                }
            }
        }

        stage('EAS build preview') {
            when { branch 'develop' }
            steps {
                script { easBuild('preview') }
            }
        }

        stage('EAS build release') {
            when { buildingTag() }
            steps {
                script {
                    def version = sh(script: "node -p \"require('./app.json').expo.version\"", returnStdout: true).trim()
                    if (env.TAG_NAME != "v${version}") {
                        error("El tag ${env.TAG_NAME} no coincide con expo.version=${version} de app.json.")
                    }
                    easBuild('production')
                }
            }
        }
    }
}

// Lanza los builds Android e iOS del perfil dado, espera a que terminen en EAS y archiva el
// artefacto descargable. iOS usa siempre build de simulador (no hay cuenta Apple Developer).
// Nunca ejecuta `eas submit`: no se publica en tiendas.
def easBuild(String profile) {
    try {
        withCredentials([string(credentialsId: 'expo-token', variable: 'EXPO_TOKEN')]) {
            def projectId = sh(script: "node -p \"require('./app.json').expo.extra?.eas?.projectId ?? ''\"", returnStdout: true).trim()
            if (!projectId) {
                echo "EAS build omitido: app.json no tiene extra.eas.projectId (ejecuta 'npx eas-cli init')."
                return
            }
            def platforms = [android: profile, ios: profile == 'production' ? 'production-simulator' : profile]
            platforms.each { platform, easProfile ->
                withEnv(["PLATFORM=${platform}", "EAS_PROFILE=${easProfile}", "PROFILE=${profile}"]) {
                    sh '''
                        npx --yes eas-cli@latest build --platform "$PLATFORM" --profile "$EAS_PROFILE" \
                          --non-interactive --wait --json > "eas-build-$PLATFORM.json"
                        url=$(node -p "require('./eas-build-$PLATFORM.json')[0].artifacts.buildUrl")
                        file="${url%%\\?*}"; file="${file##*/}"; ext="${file#*.}"
                        version=$(node -p "require('./app.json').expo.version")
                        mkdir -p eas-artifacts
                        curl -fsSL -o "eas-artifacts/pms-hotel-mobile-${version}-${PROFILE}-${PLATFORM}.${ext}" "$url"
                        echo "Build EAS $PLATFORM ($EAS_PROFILE): $url"
                    '''
                }
            }
            archiveArtifacts artifacts: 'eas-artifacts/**, eas-build-*.json', fingerprint: true
        }
    } catch (org.jenkinsci.plugins.credentialsbinding.impl.CredentialNotFoundException e) {
        echo "EAS build omitido: ${e.message}"
    }
}
