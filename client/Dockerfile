# Etapa 1 .- Builder

FROM node:22-alpine AS builder 
WORKDIR /app

# 1. Declaras las variables que vas a recibir como argumentos de construcción
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_PUSHER_KEY
ARG NEXT_PUBLIC_PUSHER_CLUSTER
ARG NEXT_PUBLIC_DEMO_TENANT_ID

# 2. Las pasas a variables de entorno para que el comando build las detecte
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_PUSHER_KEY=$NEXT_PUBLIC_PUSHER_KEY
ENV NEXT_PUBLIC_PUSHER_CLUSTER=$NEXT_PUBLIC_PUSHER_CLUSTER
ENV NEXT_PUBLIC_DEMO_TENANT_ID=$NEXT_PUBLIC_DEMO_TENANT_ID

COPY package.json package-lock.json ./ 

RUN npm ci 

COPY . . 

RUN npm run build 

# Etapa 2 .- Runner 

FROM node:22-alpine AS runner 
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
