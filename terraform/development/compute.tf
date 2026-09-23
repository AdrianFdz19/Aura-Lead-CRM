#1.- ECS CLUSTER - el agrupador logico
resource "aws_ecs_cluster" "main" {
  name = "crm-cluster-dev"
}

#2.- Task Definition - la receta del contenedor
resource "aws_ecs_task_definition" "app" {
  family                   = "crm-nextjs-task"
  network_mode             = "awsvpc" # Obligatorio para fargate
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256" # 0.25 vCPU (lo mínimo para desarrollo)
  memory                   = "512" # 512 MB de RAM

  execution_role_arn = aws_iam_role.ecs_execution_role.arn

  # Definicion de como se ejecuta el contenedor
  container_definitions = jsonencode([
    {
      name      = "nextjs-app"
      image     = "${aws_ecr_repository.crm_client_repo.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]

      # INYECTAMOS LAS VARIABLES DE ENTORNO AQUÍ:
      environment = [
        // App
        { name = "NODE_ENV", value = "development" }, 
      ],

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# 3. Servicio ECS (Mantiene el contenedor corriendo en tu Subnet Pública)
resource "aws_ecs_service" "app" {
  name            = "crm-nextjs-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1 # Queremos que corra 1 instancia de nuestra app
  launch_type     = "FARGATE"

  # Configuración de red: Dónde se conecta el contenedor
  network_configuration {
    subnets          = [aws_subnet.public.id] # Vive en tu subnet pública
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true # Vital para que tenga IP pública y se le pueda hablar desde internet
  }

  # Conectamos el servicio ECS al Target Group del ALB
  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "nextjs-app"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.http]
}

// 4.- Application Load Balancer ( Viviendo en ambas subnets públicas ) 
resource "aws_lb" "main" {
  name               = "crm-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public.id, aws_subnet.public_2.id]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "crm-alb"
  }
}

// 5.- Target Group (Hacia dónde manda el ALB el tráfico, apuntando al puerto 3000 de Next.js)
resource "aws_lb_target_group" "app" {
  name        = "crm-target-group"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip" # Indispensable para Fargate con awsvpc

  health_check {
    path                = "/" # O una ruta de health check válida en tu app
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

// 6.- Listener (Regla que escucha el puerto 80 y lo manda al Target Group)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}


