# ==========================================
# 1. CLOUDWATCH LOG GROUP
# ==========================================
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/crm-nextjs-task-dev"
  retention_in_days = 7

  tags = {
    Name = "crm-logs-dev"
  }
}