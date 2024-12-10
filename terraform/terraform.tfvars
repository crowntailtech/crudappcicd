# General AWS configuration
key_name      = "shop-server" # The name of the EC2 key pair you created
instance_type = "t2.micro"         # The instance type for EC2

# Backend EC2 instance configuration
backend_ami  = "ami-0c02fb55956c7d316" # Replace with the desired AMI ID for your backend

# Frontend S3 bucket configuration
frontend_bucket_name = "library-mgmt-frontend-bucket" # Replace with a globally unique bucket name
