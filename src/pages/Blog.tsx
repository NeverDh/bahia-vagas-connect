import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/MainLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  author: string;
  category: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
}

const POSTS_PER_PAGE = 9;

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = 'Blog - BahiaVagas | Dicas de Emprego e Carreira na Bahia';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Dicas de emprego, carreira, currículo e mercado de trabalho na Bahia. Conteúdo atualizado para ajudar você a conquistar sua vaga.');
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image, author, category, tags, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  const categories = useMemo(() => {
    const cats = new Set(posts.map(p => p.category).filter(Boolean) as string[]);
    return Array.from(cats).sort();
  }, [posts]);

  const allTags = useMemo(() => {
    const tags = new Set(posts.flatMap(p => p.tags || []));
    return Array.from(tags).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    let result = posts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q));
    }
    if (selectedCategory) result = result.filter(p => p.category === selectedCategory);
    if (selectedTag) result = result.filter(p => p.tags?.includes(selectedTag));
    return result;
  }, [posts, search, selectedCategory, selectedTag]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedTag('');
    setPage(1);
  };

  return (
    <MainLayout>
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Blog BahiaVagas</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Dicas de carreira, emprego e mercado de trabalho na Bahia
            </p>
          </div>

          {/* Search & Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Buscar artigos..."
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant={!selectedCategory ? 'default' : 'outline'} size="sm" onClick={() => { setSelectedCategory(''); setPage(1); }}>
                Todos
              </Button>
              {categories.map(cat => (
                <Button key={cat} variant={selectedCategory === cat ? 'default' : 'outline'} size="sm" onClick={() => { setSelectedCategory(cat); setPage(1); }}>
                  {cat}
                </Button>
              ))}
            </div>
            {selectedTag && (
              <div className="flex justify-center">
                <Badge variant="secondary" className="cursor-pointer" onClick={() => { setSelectedTag(''); setPage(1); }}>
                  Tag: {selectedTag} ✕
                </Badge>
              </div>
            )}
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardContent className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">Nenhum artigo encontrado</p>
              {(search || selectedCategory || selectedTag) && (
                <Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                  <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg">
                    {post.featured_image ? (
                      <img src={post.featured_image} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-4xl">📝</span>
                      </div>
                    )}
                    <CardContent className="p-5 space-y-3">
                      {post.category && (
                        <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                      )}
                      <h2 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.published_at || post.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author}
                        </span>
                      </div>
                      <div className="flex items-center text-primary text-sm font-medium pt-1">
                        Ler mais <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} size="sm" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Button>
              ))}
            </div>
          )}

          {/* Tags cloud */}
          {allTags.length > 0 && (
            <div className="mt-12 text-center">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2"><Tag className="h-5 w-5" /> Tags</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {allTags.map(tag => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => { setSelectedTag(tag); setPage(1); window.scrollTo(0, 0); }}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Blog;
