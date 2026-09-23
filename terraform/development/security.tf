# 1.- Security group para el servidor. permite tráfico web entrante
resource "aws_security_group" "ecs_tasks" {
  name        = "crm-ecs-tasks-sg-dev"
  description = "Permitir trafico HTTP hacia los contenedores de Next.js"
  vpc_id      = aws_vpc.main.id

  # Permitir trafico HTTP entrante desde cualquier lugar (Internet)
  ingress {
    description = "HTTP from Internet"
    from_port   = 3000 # Asumiendo que Next.js corre por defecto en el puerto 3000 (o ajusta al tuyo) 
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Permitir que el contenedor salga a internet libremente (para descargar paquetes, APIs, etc.)
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "crm-ecs-sg-dev"
  }
}

# ==========================================
# 2. IAM ROLE PARA ECS (Permisos de ejecución)
# ==========================================
resource "aws_iam_role" "ecs_execution_role" {
  name = "crm-ecs-execution-role-dev"

  # Permite que el servicio de ECS asuma este rol
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Adjuntamos la política oficial de AWS para tareas de ECS (incluye permisos para CloudWatch y ECR)
resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Política para permitir leer parámetros de Parameter Store
resource "aws_iam_role_policy_attachment" "ecs_ssm_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
}

// Security Group para el Application Load Balancer ( Permite tráfico web público por HTTP ) REPASAR
resource "aws_security_group" "alb_sg" {
  name        = "crm-alb-sg"
  description = "Permitir trafico HTTP publico hacia el Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = -1
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "crm-alb-sg"
  }
}
