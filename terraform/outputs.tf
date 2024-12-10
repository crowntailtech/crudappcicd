output "backend_public_ip" {
  value = aws_instance.backend_instance.public_ip
}

