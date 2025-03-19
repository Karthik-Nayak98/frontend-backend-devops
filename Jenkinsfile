pipeline {
    agent any
    environment {
        p = sh "echo $PATH"
        PATH = "$PATH:/usr/bin/docker-compose"
        WORKSPACE_DIR = "${JENKINS_HOME}/workspace/jenkins-flask-react"
    }
    stages {
        stage("git checkout") {
            steps {
                dir("${env.WORKSPACE_DIR}"){
                    git branch: "main", url: "https://github.com/Karthik-Nayak98/jenkins-frontend-backend.git"
                }
            }
        }
        stage('Test Backend') {
            agent {
                docker {
                    image 'python:3.12-slim'
                    args '-v /var/run/docker.sock:/var/run/docker.sock --user root'
                }
            }
            steps {
                dir("${env.WORKSPACE_DIR}/backend") {
                    sh 'pip install -r requirements.txt'
                    sh 'pytest -v app_test.py'
                }
            }
        }

        stage('Frontend Backend') {
            agent {
                docker {
                    image 'node:22-alpine'
                    args '-v /var/run/docker.sock:/var/run/docker.sock --user root'
                }
            }
            steps {
                dir("${env.WORKSPACE_DIR}/frontend") {
                    sh 'npm install'
                    sh 'npm run test'
                }
            }
        }

        stage("docker build") {
            steps {
                echo "Start Docker compose"
                sh "docker compose down || true"
                sh "docker compose up -d --build"
                sh "sleep 10"
            }
        }

    }

    post {
        success {
            echo "Pipeline created successfully"
            echo "Frontend: http://localhost:3000"
            echo "Backend: http://localhost:8000/tasks"
            sh "docker compose down"
        }
        failure {
            echo "Pipeline failed"
            sh "docker compose logs"
            sh "docker compose down"
        }

        always {
            sh "docker compose down || true"
        }
    }
}