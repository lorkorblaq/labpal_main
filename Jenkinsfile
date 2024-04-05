pipeline {
    agent any
    environment {
        DOCKER_IMAGE = 'lorkorblaq/clinicalx_main'
        DOCKER_TAG = "${DOCKER_IMAGE}:${BUILD_NUMBER}"         
        DOCKER_REGISTRY_URL = 'https://hub.docker.com'
        GIT_CREDENTIALS = 'gitpass'
        DOCKER_CREDENTIALS= 'dockerpass'
        DOCKERFILE_PATH = 'Dockerfile'
    }
    stages {
        stage('checkout') {
            steps {
                git(url: 'https://github.com/lorkorblaq/clinicalx_main.git', branch: 'main', credentialsId: GIT_CREDENTIALS)
            }
        }
        stage('Build Image') {
            steps {
                script {
                    echo 'Building image..'
                    docker.build("${DOCKER_TAG}", "-f ${DOCKERFILE_PATH} .")
                    }
                script{
                    echo 'Running unit tests..'
                    sh "docker stop clinicalx_main_build || true"
                    sh "docker rm clinicalx_main_build || true"
                    sh "docker run -d --name clinicalx_main_build -p 8078:8080 ${DOCKER_IMAGE}"
                    // sh "docker exec clinicalx_api_test pytest tests/test_user_api.py"
                    // sh "docker exec clinicalx_main_test pytest --junitxml=pytest-report.xml tests/test_user_api.py"
                    sh "docker stop clinicalx_main_build"
                    sh "docker rm clinicalx_main_build"
                    // sh "docker rmi ${DOCKER_TAG} -f"                    
                }
            }
        }
        stage('Test Stage') {
            steps {
              script {
                echo 'Testing to begin..'
                // sh "docker pull ${DOCKER_IMAGE}"
                echo 'Deploying to testing stage..'
                // docker.build("${DOCKER_TAG}", "-f ${DOCKERFILE_PATH} .")
                sh "docker stop clinicalx_main_test || true"
                sh "docker rm clinicalx_main_test || true"
                // Run the new container
                sh "docker run -d --name clinicalx_main_test -p 8079:8080 ${DOCKER_IMAGE}"
                echo 'Starting Integration testing'
                // sh "docker exec clinicalx_main_test pytest --junitxml=pytest-report.xml tests/test_user_api.py"
                sh "docker stop clinicalx_main_test"
                sh "docker rm clinicalx_main_test"
                // sh "docker rmi ${DOCKER_TAG} -f"                    
              }
            }
        }
        stage('Beta stage') {
            steps {
              script {
                echo 'Deploying to Beta stage..'
                // docker.build("${DOCKER_TAG}", "-f ${DOCKERFILE_PATH} .")
                // Stop and remove any existing container
                sh "docker stop clinicalx_main_beta || true"
                sh "docker rm clinicalx_main_beta || true"
                echo 'Starting End to end testing...'
                // Run the new container
                sh "docker run -d --name clinicalx_main_beta -p 8079:8080 ${DOCKER_TAG}"
                sh "docker stop clinicalx_main_beta || true"
                sh "docker rm clinicalx_main_beta || true"
                // sh "docker rmi ${DOCKER_TAG} -f || true"
              }
            }
        }
        stage('Push Image') {
            steps {
                echo 'Pushing to Docker Hub..'
                // script {
                //     echo 'Building image..'
                //     docker.build("${DOCKER_TAG}", "-f ${DOCKERFILE_PATH} .")
                //     }
                withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh "docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD"
                    sh "docker push ${DOCKER_TAG}"
                    sh "docker rmi ${DOCKER_TAG} -f || true"
                    
                }
            }
        }
       stage('Production Deployment') {
            steps {
                echo 'Deploying to production...'
                // Pull the latest image from Docker Hub
                sh "docker pull ${DOCKER_TAG}"
                // Stop and remove any existing container
                sh "docker stop clinicalx_main || true"
                sh "docker rm clinicalx_main || true"
                // Run the new container
                sh "docker run -d --name clinicalx_main -p 8080:8080 ${DOCKER_TAG}"
            }
        } 
    }
}
