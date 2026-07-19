

export type PropertyType = {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    images: string[];
    status?: 'AVAILABLE' | 'OCCUPIED' | 'PENDING'; // Opcional
    commission: number; // Opcional
    tenantId: string;
    createdAt: string;

    // agregar los siguientes en la tabla
    leads?: number;
    type?: 'house' | 'apartment' | 'land'

    // a eliminar 
    imageUrl?: string;
};

/* 
{
    "id": "76ba1a68-d063-4032-9250-e8a992844f3b",
    "title": "Departamento Altamar",
    "description": "departamento a las afueras de xalapa. bonitas vistas al campo.",
    "price": "12000",
    "location": "xalapa",
    "images": [
      "properties/90fe904a-5c56-4aa7-b9d3-73b3324d467c-1784421552147"
    ],
    "status": "AVAILABLE",
    "leads": 0,
    "commission": "2350",
    "tenantId": "9c2cb307-bcd0-4831-a240-b616bce55339",
    "createdAt": "2026-07-19T00:39:13.170Z"
  } */