pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('2536478') // SonarQube token
        AWS_CREDS = credentials('bc434e21-5423-4961-bf6a-40aff751bfa3') // AWS credentials
        APP_SERVER = '54.158.92.149' // Application server
        SSH_KEY = credentials('backendconnect') // SSH private key for accessing app server
        AWS_REGION = 'us-east-1'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/crowntailtech/crudappcicd.git'
            }
        }

        stage('Code Analysis with SonarQube') {
            steps {
                script {
                    def scannerHome = tool 'SonarQube Scanner' // Matches Jenkins Global Tool Configuration
                    withSonarQubeEnv('SonarQube Server') { // Matches Jenkins SonarQube Server configuration
                        sh """
                            export JAVA_HOME=${env.JAVA_HOME ?: '/usr/lib/jvm/java-17-amazon-corretto.x86_64'}
                            export PATH=$JAVA_HOME/bin:$PATH
                            ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=library-cicd \
                                -Dsonar.sources=backend \
                                -Dsonar.host.url=http://3.92.186.124:9000 \
                                -Dsonar.login=${env.SONAR_TOKEN} \
                                -Dsonar.exclusions=**/*.js,**/*.ts,**/*.html,**/*.css,**/frontend/**
                        """
                    }
                }
            }
        }

        stage('Terraform Plan & Apply') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                        echo "Listing terraform directory contents:"
                        ls -la terraform/
                        terraform -chdir=terraform init
                        terraform -chdir=terraform plan -var-file=terraform.tfvars -out=tfplan
                        terraform -chdir=terraform apply -auto-approve
                    '''
                }
            }
        }

        stage('Deploy to Application Server') {
            steps {
                script {
                    sshagent(['backendconnect']) { // Matches Jenkins credentials ID for SSH key
                        sh """
                            ssh -o StrictHostKeyChecking=no ubuntu@${APP_SERVER} 'bash -s' << 'EOF'
                            # Stop the existing application if running
                            pkill -f manage.py || true

                            # Pull the latest code from the repository
                            cd /home/ubuntu/library_mgmt || exit 1
                            git reset --hard
                            git pull

                            # Activate virtual environment and install dependencies
                            source backend/librarymgmt/venv/bin/activate
                            pip install -r backend/librarymgmt/requirements.txt

                            # Run database migrations
                            python3 backend/librarymgmt/manage.py migrate

                            # Restart the application in background with no reload
                            nohup python3 backend/librarymgmt/manage.py runserver 0.0.0.0:8000 --noreload > /dev/null 2>&1 &
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs for more details.'
        }
    }
}
