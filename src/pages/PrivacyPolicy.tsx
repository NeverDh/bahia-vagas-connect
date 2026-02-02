import { MainLayout } from "@/components/MainLayout";
import { Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">1. Coleta de Dados</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              O EmpregosBahia coleta informações pessoais que você nos fornece diretamente, como nome, 
              e-mail, telefone e currículo ao se cadastrar em nossa plataforma. Também coletamos 
              informações sobre como você utiliza nossos serviços para melhorar sua experiência.
            </p>
          </section>

          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">2. Uso das Informações</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Facilitar a conexão entre candidatos e empresas</li>
              <li>Personalizar sua experiência na plataforma</li>
              <li>Enviar notificações sobre vagas compatíveis com seu perfil</li>
              <li>Melhorar nossos serviços e desenvolver novos recursos</li>
              <li>Garantir a segurança da plataforma</li>
            </ul>
          </section>

          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">3. Proteção de Dados</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas 
              informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. 
              Seus dados são armazenados em servidores seguros com criptografia de ponta a ponta.
            </p>
          </section>

          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">4. Seus Direitos</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Solicitar portabilidade de seus dados</li>
            </ul>
          </section>

          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">5. Compartilhamento de Dados</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Suas informações podem ser compartilhadas com empresas cadastradas na plataforma 
              quando você se candidata a uma vaga. Não vendemos ou alugamos seus dados pessoais 
              a terceiros para fins de marketing sem seu consentimento expresso.
            </p>
          </section>

          <section className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">6. Contato</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Para exercer seus direitos ou esclarecer dúvidas sobre nossa política de privacidade, 
              entre em contato conosco através do e-mail{" "}
              <a href="mailto:privacidade@empregosbahia.com.br" className="text-primary hover:underline">
                privacidade@empregosbahia.com.br
              </a>{" "}
              ou pelo telefone (71) 3333-4444.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicy;
