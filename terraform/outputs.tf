output "backend_public_ip" {
  value = aws_instance.backend_instance.public_ip
}

output "frontend_s3_url" {
  value = aws_s3_bucket.frontend_bucket.website_endpoint
}
