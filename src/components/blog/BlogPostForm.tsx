import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from './RichTextEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Eye, X, Upload, Search } from 'lucide-react';
import { optimizeImage } from '@/lib/image-optimizer';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  author: string;
  category: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
  status: string;
  published_at: string | null;
}

const CATEGORIES = [
  'Dicas de Carreira', 'Currículo', 'Entrevista', 'Mercado de Trabalho',
  'Emprego na Bahia', 'Empreendedorismo', 'Tecnologia', 'Educação', 'Notícias'
];

const defaultPost: BlogPost = {
  title: '', slug: '', content: '', excerpt: '', featured_image: '',
  author: 'Equipe BahiaVagas', category: '', tags: [],
  meta_title: '', meta_description: '', og_title: '', og_description: '',
  og_image: '', canonical_url: '', status: 'draft', published_at: null,
};

interface BlogPostFormProps {
  postId?: string | null;
  onSaved: () => void;
  onCancel: () => void;
}

export const BlogPostForm = ({ postId, onSaved, onCancel }: BlogPostFormProps) => {
  const [post, setPost] = useState<BlogPost>(defaultPost);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (postId) loadPost(postId);
  }, [postId]);

  const loadPost = async (id: string) => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    if (data) {
      setPost({
        ...data,
        tags: data.tags || [],
        excerpt: data.excerpt || '',
        featured_image: data.featured_image || '',
        author: data.author || 'Equipe BahiaVagas',
        category: data.category || '',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        og_title: data.og_title || '',
        og_description: data.og_description || '',
        og_image: data.og_image || '',
        canonical_url: data.canonical_url || '',
      });
    }
    if (error) toast.error('Erro ao carregar artigo');
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setPost(prev => ({
      ...prev,
      title,
      slug: prev.id ? prev.slug : generateSlug(title),
      meta_title: prev.meta_title || title,
      og_title: prev.og_title || title,
    }));
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `featured/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('blog-images').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      setPost(prev => ({
        ...prev,
        featured_image: urlData.publicUrl,
        og_image: prev.og_image || urlData.publicUrl,
      }));
      toast.success('Imagem enviada');
    } catch {
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !post.tags.includes(tag)) {
      setPost(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setPost(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSave = async (publishNow = false) => {
    if (!post.title.trim() || !post.slug.trim()) {
      toast.error('Título e slug são obrigatórios');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...post,
        status: publishNow ? 'published' : post.status,
        published_at: publishNow && !post.published_at ? new Date().toISOString() : post.published_at,
      };
      delete (payload as any).id;

      if (postId) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', postId);
        if (error) {
          if (error.message.includes('duplicate') || error.message.includes('unique')) {
            toast.error('Slug já existe. Escolha outro.');
          } else throw error;
          return;
        }
        toast.success('Artigo atualizado');
      } else {
        const { error } = await supabase.from('blog_posts').insert(payload);
        if (error) {
          if (error.message.includes('duplicate') || error.message.includes('unique')) {
            toast.error('Slug já existe. Escolha outro.');
          } else throw error;
          return;
        }
        toast.success('Artigo criado');
      }
      onSaved();
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{postId ? 'Editar Artigo' : 'Novo Artigo'}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button variant="outline" onClick={() => handleSave(false)} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />Salvar Rascunho
          </Button>
          <Button onClick={() => handleSave(true)} disabled={loading}>
            <Eye className="h-4 w-4 mr-2" />Publicar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <Label>Título *</Label>
                <Input value={post.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Título do artigo" />
              </div>
              <div>
                <Label>Slug *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/blog/</span>
                  <Input value={post.slug} onChange={e => setPost(prev => ({ ...prev, slug: e.target.value }))} placeholder="url-do-artigo" />
                </div>
              </div>
              <div>
                <Label>Resumo</Label>
                <Textarea value={post.excerpt} onChange={e => setPost(prev => ({ ...prev, excerpt: e.target.value }))} placeholder="Breve resumo do artigo..." rows={3} />
              </div>
              <div>
                <Label>Conteúdo</Label>
                <RichTextEditor content={post.content} onChange={content => setPost(prev => ({ ...prev, content }))} />
              </div>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Publicação</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Status</Label>
                    <Select value={post.status} onValueChange={v => setPost(prev => ({ ...prev, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Data de publicação</Label>
                    <Input type="datetime-local" value={post.published_at?.slice(0, 16) || ''} onChange={e => setPost(prev => ({ ...prev, published_at: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
                  </div>
                  <div>
                    <Label>Autor</Label>
                    <Input value={post.author} onChange={e => setPost(prev => ({ ...prev, author: e.target.value }))} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Imagem Destacada</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {post.featured_image && (
                    <img src={post.featured_image} alt="Destaque" className="w-full rounded-lg object-cover aspect-video" />
                  )}
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); e.target.value = ''; }} />
                  <Button variant="outline" className="w-full" onClick={() => imageInputRef.current?.click()} disabled={uploadingImage}>
                    <Upload className="h-4 w-4 mr-2" />{uploadingImage ? 'Enviando...' : 'Upload Imagem'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Categoria</CardTitle></CardHeader>
                <CardContent>
                  <Select value={post.category} onValueChange={v => setPost(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Tags</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Nova tag" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                    <Button type="button" variant="outline" size="sm" onClick={addTag}>+</Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">SEO & Open Graph</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input value={post.meta_title} onChange={e => setPost(prev => ({ ...prev, meta_title: e.target.value }))} placeholder="Título para buscadores" />
                <p className="text-xs text-muted-foreground mt-1">{post.meta_title.length}/60 caracteres</p>
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea value={post.meta_description} onChange={e => setPost(prev => ({ ...prev, meta_description: e.target.value }))} placeholder="Descrição para buscadores" rows={2} />
                <p className="text-xs text-muted-foreground mt-1">{post.meta_description.length}/160 caracteres</p>
              </div>
              <div>
                <Label>Canonical URL</Label>
                <Input value={post.canonical_url} onChange={e => setPost(prev => ({ ...prev, canonical_url: e.target.value }))} placeholder="https://bahiavagas.com/blog/..." />
              </div>
              <div>
                <Label>OG Title</Label>
                <Input value={post.og_title} onChange={e => setPost(prev => ({ ...prev, og_title: e.target.value }))} />
              </div>
              <div>
                <Label>OG Description</Label>
                <Textarea value={post.og_description} onChange={e => setPost(prev => ({ ...prev, og_description: e.target.value }))} rows={2} />
              </div>
              <div>
                <Label>OG Image URL</Label>
                <Input value={post.og_image} onChange={e => setPost(prev => ({ ...prev, og_image: e.target.value }))} placeholder="URL da imagem para redes sociais" />
              </div>

              {/* Google Preview */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Search className="h-3 w-3" /> Preview no Google</p>
                <div>
                  <p className="text-sm text-primary truncate">{post.canonical_url || `https://bahiavagas.com/blog/${post.slug}`}</p>
                  <p className="text-lg text-blue-700 dark:text-blue-400 hover:underline cursor-default truncate">
                    {post.meta_title || post.title || 'Título do artigo'}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.meta_description || post.excerpt || 'Descrição do artigo...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
