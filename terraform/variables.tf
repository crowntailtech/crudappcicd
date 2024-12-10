variable "instance_type" {
  default = "t2.micro"
}

variable "key_name" {
  description = "Name of the key pair"
}

variable "backend_ami" {
  description = "AMI ID for the EC2 instance"
  default     = "ami-0e2c8caa4b6378d8c" # Replace with your preferred AMI
}

variable "frontend_bucket_name" {
  description = "Name for the S3 bucket hosting the frontend"
  default     = "library-frontend-bucket"
}
