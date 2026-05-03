import BlogDetailClient from "@/components/blog/BlogDetailClient";

interface Props {
 params: Promise<{ id: string }>;
}

export default async function BlogDetailPage({ params }: Props) {
 const { id } = await params;
 return <BlogDetailClient id={id} />;
}
