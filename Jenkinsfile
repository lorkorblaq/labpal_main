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
            }
        }
        stage('Test') {
            steps {
              script {
                echo 'Testing..'
                // def dockerimage = docker.build("${DOCKER_IMAGE}", "-f ${DOCKERFILE_PATH} .")
                // dockerimage.inside {
                //     sh 'pytest --junitxml=pytest-report.xml api/tests/test_user_api.py'  // Run pytest with JUnit output
                // }
              }
            }
        }
        
        stage('Push Image') {
            steps {
                echo 'Pushing to Docker Hub..'
                script {
                    echo 'Building image..'
                    docker.build("${DOCKER_TAG}", "-f ${DOCKERFILE_PATH} .")
                    }
                withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh "docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD"
                    sh "docker push ${DOCKER_TAG}" 
                }
            }
        }

       stage('Deployment') {
            steps {
                echo 'Deploying...'
                sh "docker stop clincalx_main -f || true"
                sh "docker rm clincalx_main -f || true"
                // Run the new container
                sh "docker run -d --name clinicalx_main -p 8080:8080 ${DOCKER_TAG}"
            }
        }

     }
 }
