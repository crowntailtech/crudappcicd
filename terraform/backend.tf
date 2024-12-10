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
  ami           = var.backend_ami
  instance_type = var.instance_type
  key_name      = var.key_name

  security_groups = [aws_security_group.backend_sg.name]

  tags = {
    Name = "backend-instance"
  }

  user_data = <<-EOF
                #!/bin/bash
                sudo yum update -y

                # Install Python and dependencies
                sudo yum install python3 python3-pip git -y

                # Clone the project repository from GitHub
                git clone <your-git-repo-url> /home/ec2-user/library_mgmt
                cd /home/ec2-user/library_mgmt/backend/librarymgmt

                # Install virtual environment and activate it
                python3 -m pip install --user virtualenv
                python3 -m virtualenv venv
                source venv/bin/activate

                # Install project dependencies
                pip install -r requirements.txt

                # Migrate the database
                python manage.py migrate

                # Start the Django development server
                nohup python manage.py runserver 0.0.0.0:8000 &
                EOF
}

output "backend_instance_public_ip" {
  value = aws_instance.backend_instance.public_ip
}
