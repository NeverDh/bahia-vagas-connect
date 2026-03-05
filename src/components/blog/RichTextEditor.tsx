import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRef, useState, useCallback } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Heading4,
  List, ListOrdered, Quote, Code, Table as TableIcon,
  Image as ImageIcon, Youtube as YoutubeIcon, Link as LinkIcon,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo, Minus
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: 'Comece a escrever seu artigo...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Youtube.configure({ width: 640, height: 360 }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error } = await supabase.storage.from('blog-images').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      editor?.chain().focus().setImage({ src: urlData.publicUrl }).run();
    } catch (err) {
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  }, [editor]);

  const addLink = () => {
    const url = window.prompt('URL do link:');
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt('URL do vídeo YouTube:');
    if (url) editor?.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  if (!editor) return null;

  const ToolBtn = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <Button
      type="button"
      variant={active ? 'default' : 'ghost'}
      size="icon"
      className="h-8 w-8"
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-0.5 p-2 border-b bg-muted/30">
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Desfazer"><Undo className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Refazer"><Redo className="h-4 w-4" /></ToolBtn>
        <div className="w-px bg-border mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="H1"><Heading1 className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="H2"><Heading2 className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="H3"><Heading3 className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })} title="H4"><Heading4 className="h-4 w-4" /></ToolBtn>
        <div className="w-px bg-border mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito"><Bold className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico"><Italic className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Sublinhado"><UnderlineIcon className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Riscado"><Strikethrough className="h-4 w-4" /></ToolBtn>
        <div className="w-px bg-border mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Alinhar esquerda"><AlignLeft className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centralizar"><AlignCenter className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Alinhar direita"><AlignRight className="h-4 w-4" /></ToolBtn>
        <div className="w-px bg-border mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista"><List className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada"><ListOrdered className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citação"><Quote className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Código"><Code className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Linha horizontal"><Minus className="h-4 w-4" /></ToolBtn>
        <div className="w-px bg-border mx-1" />
        <ToolBtn onClick={addLink} active={editor.isActive('link')} title="Link"><LinkIcon className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => fileInputRef.current?.click()} title="Imagem"><ImageIcon className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={addYoutube} title="Vídeo YouTube"><YoutubeIcon className="h-4 w-4" /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Tabela"><TableIcon className="h-4 w-4" /></ToolBtn>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = '';
        }}
      />
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[400px] p-4 focus:outline-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
      />
      {uploading && <div className="p-2 text-sm text-muted-foreground border-t">Enviando imagem...</div>}
    </div>
  );
};
