# Etapa 1 .- Builder

FROM node:22-bookworm-slim AS builder 
WORKDIR /app

# 1. Variables públicas del cliente (NEXT_PUBLIC_)
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_PUSHER_KEY
ARG NEXT_PUBLIC_PUSHER_CLUSTER
ARG NEXT_PUBLIC_DEMO_TENANT_ID

# 2. Variables de servidor y secretos
ARG NODE_ENV
ARG DEMO_TENANT_ID
ARG JWT_SECRET
ARG DATABASE_URL
ARG WHATSAPP_VERIFY_TOKEN 
ARG ENCRYPTION_KEY 
ARG STRIPE_SECRET_KEY
ARG STRIPE_WEBHOOK_SECRET 

# 3. Pusher (Servidor)
ARG PUSHER_APP_ID
ARG PUSHER_KEY
ARG PUSHER_SECRET
ARG PUSHER_CLUSTER

# 4. AWS (S3)
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_REGION
ARG AWS_BUCKET_NAME

# 5. Notificaciones / Emails
ARG EMAIL
ARG RESEND_API_KEY

# 2. Las pasas a variables de entorno para que el comando build las detecte
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_PUSHER_KEY=$NEXT_PUBLIC_PUSHER_KEY
ENV NEXT_PUBLIC_PUSHER_CLUSTER=$NEXT_PUBLIC_PUSHER_CLUSTER
ENV NEXT_PUBLIC_DEMO_TENANT_ID=$NEXT_PUBLIC_DEMO_TENANT_ID

COPY package.json package-lock.json ./ 

RUN npm ci 

COPY . . 

RUN apt-get update -y && apt-get install -y openssl ca-certificates

# 3. ¡Generamos el cliente de Prisma aquí antes de construir la app!
RUN npx prisma generate

RUN npm run build 

# Etapa 2 .- Runner 

FROM node:22-bookworm-slim AS runner 
WORKDIR /app 

ENV NODE_ENV=development

# Creamos un usuario sin privilegios root por seguridad (opcional pero recomendado)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Copiamos la carpeta .next/standalone y la de .next/static necesarias para correr el servidor
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Lanzamos el servidor optimizado que Next.js creó en standalone
CMD ["node", "server.js"]
