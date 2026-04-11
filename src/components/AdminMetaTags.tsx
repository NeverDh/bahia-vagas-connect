import { useState, useEffect } from "react";
import { ApiRequestError } from "@/services/api";
import {
  fetchAdminMetaTags,
  createAdminMetaTag,
  updateAdminMetaTag,
  deleteAdminMetaTag,
  type SaveMetaTagPayload,
} from "@/lib/meta-tags-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import { toast } from "sonner";

interface MetaTag {
  id: string;
  page_path: string;
  title: string | null;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  keywords: string | null;
}

const emptyForm = {
  page_path: "",
  title: "",
  description: "",
  og_title: "",
  og_description: "",
  og_image: "",
  keywords: "",
};

export const AdminMetaTags = () => {
  const [metaTags, setMetaTags] = useState<MetaTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchMetaTags();
  }, []);

  const fetchMetaTags = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminMetaTags();
      setMetaTags(data);
    } catch (e) {
      const msg = e instanceof ApiRequestError ? e.message : undefined;
      toast.error("Erro ao carregar meta tags", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tag: MetaTag) => {
    setEditingId(tag.id);
    setForm({
      page_path: tag.page_path,
      title: tag.title || "",
      description: tag.description || "",
      og_title: tag.og_title || "",
      og_description: tag.og_description || "",
      og_image: tag.og_image || "",
      keywords: tag.keywords || "",
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.page_path.trim()) {
      toast.error("O caminho da página é obrigatório");
      return;
    }

    const payload: SaveMetaTagPayload = {
      page_path: form.page_path.trim(),
      title: form.title || null,
      description: form.description || null,
      og_title: form.og_title || null,
      og_description: form.og_description || null,
      og_image: form.og_image || null,
      keywords: form.keywords || null,
    };

    try {
      if (editingId) {
        await updateAdminMetaTag(editingId, payload);
        toast.success("Meta tag atualizada");
      } else {
        await createAdminMetaTag(payload);
        toast.success("Meta tag criada");
      }
    } catch (e) {
      const msg = e instanceof ApiRequestError ? e.message : undefined;
      toast.error(editingId ? "Erro ao atualizar" : "Erro ao criar", {
        description: msg,
      });
      return;
    }

    setDialogOpen(false);
    fetchMetaTags();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminMetaTag(id);
      toast.success("Meta tag deletada");
      setMetaTags(metaTags.filter((t) => t.id !== id));
    } catch (e) {
      const msg = e instanceof ApiRequestError ? e.message : undefined;
      toast.error("Erro ao deletar", { description: msg });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Meta Tags SEO
            </CardTitle>
            <CardDescription>
              Gerencie as meta tags de cada página do site
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Meta Tag" : "Nova Meta Tag"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Caminho da página *</Label>
                  <Input
                    placeholder="Ex: /, /vagas, /empresas"
                    value={form.page_path}
                    onChange={(e) => setForm({ ...form, page_path: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use "/" para a home, "/vagas" para vagas, etc.
                  </p>
                </div>
                <div>
                  <Label>Title (máx. 60 caracteres)</Label>
                  <Input
                    placeholder="Título da página"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.title.length}/60
                  </p>
                </div>
                <div>
                  <Label>Description (máx. 160 caracteres)</Label>
                  <Textarea
                    placeholder="Descrição da página para mecanismos de busca"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.description.length}/160
                  </p>
                </div>
                <div>
                  <Label>OG Title</Label>
                  <Input
                    placeholder="Título para redes sociais"
                    value={form.og_title}
                    onChange={(e) => setForm({ ...form, og_title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>OG Description</Label>
                  <Textarea
                    placeholder="Descrição para redes sociais"
                    value={form.og_description}
                    onChange={(e) => setForm({ ...form, og_description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>OG Image URL</Label>
                  <Input
                    placeholder="https://..."
                    value={form.og_image}
                    onChange={(e) => setForm({ ...form, og_image: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Keywords</Label>
                  <Input
                    placeholder="vagas, emprego, bahia, ..."
                    value={form.keywords}
                    onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  />
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingId ? "Salvar alterações" : "Criar Meta Tag"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-center py-4">Carregando...</p>
        ) : metaTags.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma meta tag cadastrada
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Página</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metaTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-mono text-sm">{tag.page_path}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{tag.title || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[250px] truncate">
                    {tag.description || "—"}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(tag)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tag.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
