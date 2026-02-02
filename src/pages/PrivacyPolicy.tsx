import { MainLayout } from "@/components/MainLayout";
import { Shield, Database, Eye, Lock, UserCheck, Cookie, ExternalLink, Users, FileText, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
          <h2 className="text-2xl text-primary font-semibold mb-4">Bahia Vagas</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A sua privacidade é importante para nós. É política do Bahia Vagas respeitar a sua privacidade 
            em relação a qualquer informação sua que possamos coletar no site bahiavagas.com.br (ou outro domínio utilizado).
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos os dados 
            pessoais dos usuários, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).
          </p>
        </div>

        <div className="space-y-8">
          {/* 1. Informações que coletamos */}
          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">1. Informações que coletamos</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Podemos coletar as seguintes informações pessoais:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
              <li>Nome</li>
              <li>Endereço de e-mail</li>
              <li>Currículo profissional</li>
              <li>Dados profissionais e acadêmicos</li>
              <li>Informações fornecidas voluntariamente em formulários</li>
              <li>Dados de navegação (IP, tipo de navegador, páginas acessadas)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-2">
              A coleta ocorre quando o usuário:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Se cadastra no site</li>
              <li>Envia currículo</li>
              <li>Se candidata a vagas</li>
              <li>Assina newsletters ou alertas de vagas</li>
              <li>Entra em contato conosco</li>
            </ul>
          </section>

          {/* 2. Finalidade do uso das informações */}
          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">2. Finalidade do uso das informações</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As informações coletadas são utilizadas para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
              <li>Disponibilizar vagas de emprego</li>
              <li>Permitir candidatura às vagas anunciadas</li>
              <li>Enviar alertas, comunicações e oportunidades profissionais</li>
              <li>Melhorar a experiência do usuário no site</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
            <p className="text-muted-foreground font-medium">
              O Bahia Vagas não vende nem comercializa dados pessoais.
            </p>
          </section>

          {/* 3. Compartilhamento de dados */}
          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">3. Compartilhamento de dados</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Os dados podem ser compartilhados apenas quando necessário:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
              <li>Com empresas contratantes, exclusivamente para processos seletivos</li>
              <li>Para cumprimento de obrigações legais</li>
              <li>Com provedores de tecnologia e hospedagem, sob contrato de confidencialidade</li>
            </ul>
            <p className="text-muted-foreground font-medium">
              Nunca compartilhamos dados para fins ilícitos ou não autorizados.
            </p>
          </section>

          {/* 4. Armazenamento e segurança dos dados */}
          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">4. Armazenamento e segurança dos dados</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Adotamos medidas técnicas e organizacionais para proteger os dados pessoais, incluindo:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
              <li>Acesso restrito às informações</li>
              <li>Uso de servidores seguros</li>
              <li>Criptografia SSL</li>
              <li>Monitoramento contra malware e acessos não autorizados</li>
            </ul>
            <p className="text-muted-foreground">
              Os dados são armazenados apenas pelo tempo necessário para cumprir sua finalidade.
            </p>
          </section>

          {/* 5. Cookies e tecnologias de rastreamento */}
          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">5. Cookies e tecnologias de rastreamento</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Utilizamos cookies para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
              <li>Melhorar o desempenho do site</li>
              <li>Analisar estatísticas de acesso</li>
              <li>Personalizar a experiência do usuário</li>
            </ul>
            <p className="text-muted-foreground">
              O usuário pode desativar os cookies nas configurações do navegador, ciente de que algumas 
              funcionalidades podem não funcionar corretamente.
            </p>
          </section>

          {/* 6. Publicidade e serviços de terceiros */}
          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <ExternalLink className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">6. Publicidade e serviços de terceiros</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O site pode exibir anúncios de terceiros, como o Google AdSense, que podem utilizar cookies 
              para exibir anúncios relevantes.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O uso desses cookies é regido pela política de privacidade dos respectivos serviços.
            </p>
            <p className="text-muted-foreground">
              O usuário pode gerenciar preferências de anúncios diretamente nas configurações do Google.
            </p>
          </section>

          {/* 7. Direitos do titular dos dados (LGPD) */}
          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">7. Direitos do titular dos dados (LGPD)</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nos termos da LGPD, o usuário tem direito a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
              <li>Confirmar a existência de tratamento de dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão dos dados</li>
              <li>Revogar consentimentos</li>
            </ul>
            <p className="text-muted-foreground">
              As solicitações podem ser feitas pelos canais de contato do site.
            </p>
          </section>

          {/* 8. Dados de menores de idade */}
          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">8. Dados de menores de idade</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              O Bahia Vagas não coleta intencionalmente dados de menores de 13 anos. Caso isso ocorra, 
              os dados serão removidos assim que identificados.
            </p>
          </section>

          {/* 9. Links para sites externos */}
          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <ExternalLink className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">9. Links para sites externos</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Nosso site pode conter links para sites de terceiros. Não nos responsabilizamos pelas 
              políticas de privacidade ou conteúdo desses sites.
            </p>
          </section>

          {/* 10. Alterações nesta política */}
          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">10. Alterações nesta política</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Esta Política de Privacidade pode ser atualizada a qualquer momento, sem aviso prévio. 
              Recomendamos que o usuário a revise periodicamente.
            </p>
          </section>

          {/* 11. Contato */}
          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">11. Contato</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento de dados pessoais, 
              entre em contato conosco pelos canais disponíveis no site.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicy;
