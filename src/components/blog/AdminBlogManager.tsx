import { useState, useEffect } from 'react';
import { ApiRequestError } from '@/services/api';
import {
  fetchAdminBlogPosts,
  deleteBlogPost,
} from '@/lib/admin-blog-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BlogPostForm } from './BlogPostForm';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Pencil, Trash2, Eye, FileText } from 'lucide-react';

interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  author: string;
  status: string;
  views: number;
  category: string | null;
  published_at: string | null;
  created_at: string;
}

export const AdminBlogManager = () => {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null | 'new'>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminBlogPosts();
      setPosts(data);
    } catch (e) {
      const msg = e instanceof ApiRequestError ? e.message : undefined;
      toast.error('Erro ao carregar artigos', { description: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este artigo permanentemente?')) return;
    try {
      await deleteBlogPost(id);
      toast.success('Artigo excluído');
      setPosts(posts.filter((p) => p.id !== id));
    } catch (e) {
      const msg = e instanceof ApiRequestError ? e.message : undefined;
      toast.error('Erro ao excluir', { description: msg });
    }
  };

  if (editing !== null) {
    return (
      <BlogPostForm
        postId={editing === 'new' ? null : editing}
        onSaved={() => { setEditing(null); fetchPosts(); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Blog Manager
            </CardTitle>
            <CardDescription>Gerencie os artigos do blog</CardDescription>
          </div>
          <Button onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4 mr-2" />Novo Artigo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Carregando...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum artigo encontrado. Crie o primeiro!</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map(post => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{post.title}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{post.category || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.views}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.published_at || post.created_at), { addSuffix: true, locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => window.open(`/blog/${post.slug}`, '_blank')} title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditing(post.id)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="text-destructive hover:text-destructive" title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
