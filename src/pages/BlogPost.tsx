import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, Share2, Clock, ChevronRight, ChevronUp } from 'lucide-react';
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
  const [tocOpen, setTocOpen] = useState(true);

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
      supabase.from('blog_posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id).then();
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

  // Extract headings from content for TOC
  const headings = useMemo(() => {
    if (!post) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content, 'text/html');
    const elements = doc.querySelectorAll('h1, h2, h3');
    return Array.from(elements).map((el, i) => ({
      id: `heading-${i}`,
      text: el.textContent || '',
      level: el.tagName,
    }));
  }, [post]);

  // Inject IDs into content headings
  const processedContent = useMemo(() => {
    if (!post) return '';
    let idx = 0;
    return post.content.replace(/<(h[1-3])([^>]*)>/gi, (match, tag, attrs) => {
      const id = `heading-${idx}`;
      idx++;
      return `<${tag}${attrs} id="${id}">`;
    });
  }, [post]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="animate-pulse">
          <div className="h-[340px] bg-primary/80" />
          <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
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

      {/* Hero Banner */}
      <div className="relative bg-primary overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 z-10">
            {post.category && (
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10">
                  {post.category}
                </Badge>
                {post.tags && post.tags.slice(0, 1).map(tag => (
                  <Badge key={tag} variant="outline" className="border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-primary-foreground/80 text-sm">
              Publicado em {format(new Date(post.published_at || post.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
          {post.featured_image && (
            <div className="shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary-foreground/20 shadow-xl">
              <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="border-b bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            {post.category && (
              <>
                <ChevronRight className="h-3 w-3" />
                <Link to={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:text-primary transition-colors">
                  {post.category}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium truncate max-w-[300px]">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-4 border-b">
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

            {/* Article content - lazy load images */}
            <div
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-img:rounded-lg [&_img]:max-w-full [&_img]:h-auto"
              dangerouslySetInnerHTML={{ __html: processedContent }}
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

          {/* Sidebar - Table of Contents */}
          {headings.length > 0 && (
            <aside className="lg:w-80 shrink-0">
              <div className="lg:sticky lg:top-24 border rounded-xl p-5 bg-card shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">Acesso rápido</h3>
                  <button onClick={() => setTocOpen(!tocOpen)} className="text-muted-foreground hover:text-primary">
                    <ChevronUp className={`h-5 w-5 transition-transform ${tocOpen ? '' : 'rotate-180'}`} />
                  </button>
                </div>
                {tocOpen && (
                  <nav className="space-y-2">
                    {headings.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => scrollToHeading(h.id)}
                        className={`block w-full text-left text-sm hover:text-primary transition-colors text-muted-foreground ${
                          h.level === 'H1' ? 'font-semibold' : h.level === 'H3' ? 'pl-4' : ''
                        }`}
                      >
                        {h.text}
                      </button>
                    ))}
                  </nav>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default BlogPost;
