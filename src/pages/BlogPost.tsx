import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, Share2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author: string;
  category: string | null;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  published_at: string | null;
  created_at: string;
  views: number;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) fetchPost(slug);
  }, [slug]);

  const fetchPost = async (slug: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (data) {
      setPost(data);
      // Increment views
      supabase.from('blog_posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id).then();
      // Set meta tags
      document.title = data.meta_title || data.title;
      setMetaTag('description', data.meta_description || data.excerpt || '');
      setMetaTag('og:title', data.og_title || data.title);
      setMetaTag('og:description', data.og_description || data.excerpt || '');
      if (data.og_image || data.featured_image) setMetaTag('og:image', data.og_image || data.featured_image || '');
      if (data.canonical_url) {
        let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
        link.href = data.canonical_url;
      }
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const setMetaTag = (name: string, content: string) => {
    const attr = name.startsWith('og:') ? 'property' : 'name';
    let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
    if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attr, name); document.head.appendChild(tag); }
    tag.content = content;
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: post?.title, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    }
  };

  const readingTime = (content: string) => {
    const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-64 bg-muted rounded" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (notFound || !post) {
    return (
      <MainLayout>
        <div className="text-center py-20 px-4">
          <h1 className="text-3xl font-bold mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-6">O artigo que você procura não existe ou foi removido.</p>
          <Link to="/blog"><Button>Voltar ao Blog</Button></Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt || '',
            image: post.featured_image || '',
            author: { '@type': 'Person', name: post.author },
            datePublished: post.published_at || post.created_at,
            publisher: { '@type': 'Organization', name: 'BahiaVagas', url: 'https://bahiavagas.com' },
          }),
        }}
      />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Voltar ao Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          {post.category && <Badge className="mb-3">{post.category}</Badge>}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{post.author}</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(post.published_at || post.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{readingTime(post.content)} min de leitura</span>
            <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
              <Share2 className="h-4 w-4 mr-1" /> Compartilhar
            </Button>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <img src={post.featured_image} alt={post.title} className="w-full rounded-xl mb-8 object-cover max-h-[500px]" />
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
            {post.tags.map(tag => (
              <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="outline">{tag}</Badge>
              </Link>
            ))}
          </div>
        )}
      </article>
    </MainLayout>
  );
};

export default BlogPost;
