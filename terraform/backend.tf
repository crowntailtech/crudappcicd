resource "aws_security_group" "backend_sg" {
  name_prefix = "backend-sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "backend_instance" {
  ami           = var.backend_ami # Use an Ubuntu AMI ID here
  instance_type = var.instance_type
  key_name      = var.key_name

  security_groups = [aws_security_group.backend_sg.name]

  tags = {
    Name = "backend-server"
  }

  user_data = <<-EOF
                #!/bin/bash
                sudo apt update -y
                sudo apt upgrade -y

                # Install Python and dependencies
                sudo apt install -y python3 python3-pip git virtualenv

                # Clone the project repository from GitHub
                git clone https://github.com/crowntailtech/crudappcicd.git /home/ubuntu/library_mgmt
                cd /home/ubuntu/library_mgmt/backend/librarymgmt

                # Create and activate virtual environment
                python3 -m virtualenv venv
                source venv/bin/activate

                # Install Django and project dependencies
                pip install -r requirements.txt

                # Migrate the database
                python3 manage.py migrate

                # Collect static files
                python3 manage.py collectstatic --noinput

                # Run the Django development server
                nohup python3 manage.py runserver 0.0.0.0:8000 &
                EOF
}

output "backend_instance_public_ip" {
  value = aws_instance.backend_instance.public_ip
}
