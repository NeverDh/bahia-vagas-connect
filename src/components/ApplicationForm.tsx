import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText } from "lucide-react";
import { ApiRequestError } from "@/services/api";
import { submitApplication } from "@/lib/candidates-api";

interface ApplicationFormProps {
  jobId: string;
  onSuccess?: () => void;
}

export const ApplicationForm = ({ jobId, onSuccess }: ApplicationFormProps) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, envie um arquivo PDF ou DOC",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O currículo deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }

      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeFile) {
      toast({
        title: "Currículo obrigatório",
        description: "Por favor, anexe seu currículo",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitApplication(jobId, resumeFile, coverLetter);
      toast({
        title: "Candidatura enviada!",
        description: "Sua candidatura foi registrada com sucesso.",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting application:", error);
      const description =
        error instanceof ApiRequestError
          ? error.message
          : "Tente novamente mais tarde";
      toast({
        title: "Erro ao enviar candidatura",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="resume">
          Currículo <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <Label
            htmlFor="resume"
            className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent transition-colors"
          >
            <Upload className="h-4 w-4" />
            {resumeFile ? resumeFile.name : "Selecionar arquivo"}
          </Label>
          {resumeFile && <FileText className="h-5 w-5 text-primary" />}
        </div>
        <p className="text-sm text-muted-foreground">PDF ou DOC, máximo 5MB</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover_letter">Carta de Apresentação (opcional)</Label>
        <Textarea
          id="cover_letter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Conte um pouco sobre você e por que está interessado nesta vaga..."
          rows={6}
          maxLength={1000}
        />
        <p className="text-sm text-muted-foreground">
          {coverLetter.length}/1000 caracteres
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar Candidatura"
        )}
      </Button>
    </form>
  );
};
