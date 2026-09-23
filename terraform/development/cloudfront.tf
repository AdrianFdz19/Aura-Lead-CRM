resource "aws_cloudfront_distribution" "cdn" {
  enabled = true

  aliases = ["crm.adrianfdz.com"]

  # Aquí va el origen que apunta a tu ALB
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "alb-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # Cambia a "https-only" si tu ALB tiene SSL configurado
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb-origin"

    # IMPORTANTE: Configuración para permitir tráfico dinámico (Next.js)
    forwarded_values {
      query_string = true
      headers      = ["*"] # Necesario para que Next.js funcione correctamente
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = "arn:aws:acm:us-east-1:031949581603:certificate/53ddb105-5eb6-42f1-a239-7304ebe888c3"
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# Obtener la zona alojada existente de Route 53
data "aws_route53_zone" "crm" {
  name         = "crm.adrianfdz.com"
  private_zone = false
}

# Crear el registro Alias que apunta a CloudFront
resource "aws_route53_record" "crm_alias" {
  zone_id = data.aws_route53_zone.crm.zone_id
  name    = "crm.adrianfdz.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.cdn.domain_name
    zone_id                = aws_cloudfront_distribution.cdn.hosted_zone_id
    evaluate_target_health = false
  }
}