resource "aws_s3_bucket" "frontend_bucket" {
  bucket        = var.frontend_bucket_name
  force_destroy = true

  tags = {
    Name        = "Frontend Bucket"
    Environment = "Production"
  }
}

resource "aws_s3_bucket_website_configuration" "frontend_website" {
  bucket = aws_s3_bucket.frontend_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_object" "frontend_files" {
  for_each = fileset("${path.module}/../frontend", "**/*")

  bucket = aws_s3_bucket.frontend_bucket.id
  key    = each.value
  source = "${path.module}/../frontend/${each.value}"
  etag   = filemd5("${path.module}/../frontend/${each.value}")

  content_type = lookup({
    "html" = "text/html"
    "css"  = "text/css"
    "js"   = "application/javascript"
  }, split(".", each.value)[-1], "application/octet-stream")
}

output "frontend_url" {
  value = aws_s3_bucket_website_configuration.frontend_website.website_endpoint
}
