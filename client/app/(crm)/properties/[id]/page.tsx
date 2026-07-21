import PropertyDetailClient from "@/app/components/PropertyDetailClient";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <main className="min-h-screen bg-slate-50/50 pb-12">
            <PropertyDetailClient propertyId={id} />
        </main>
    );
}