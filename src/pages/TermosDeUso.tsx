import { MainLayout } from "@/components/MainLayout";

const TermosDeUso = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-foreground">📄 POLÍTICA DE USO – BAHIA VAGAS</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: 19 de fevereiro de 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground/90">
          <p>
            Bem-vindo ao Bahia Vagas. Ao acessar e utilizar este site, você concorda com os termos e condições descritos nesta Política de Uso. Caso não concorde com qualquer parte destes termos, recomendamos que não utilize nossos serviços.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Sobre o Bahia Vagas</h2>
            <p>O Bahia Vagas é um portal online que divulga oportunidades de emprego, estágios e vagas temporárias, com foco no estado da Bahia e outras regiões do Brasil.</p>
            <p>O site atua exclusivamente como intermediador de divulgação, não sendo responsável direto pelas contratações realizadas pelas empresas anunciantes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Aceitação dos Termos</h2>
            <p>Ao acessar o site, o usuário declara:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Ter lido e compreendido esta Política de Uso;</li>
              <li>Concordar integralmente com seus termos;</li>
              <li>Utilizar o site de forma legal e ética.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Uso Permitido</h2>
            <p>O usuário se compromete a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Utilizar as informações apenas para fins legais;</li>
              <li>Não copiar, reproduzir ou distribuir conteúdos sem autorização;</li>
              <li>Não utilizar o site para envio de spam, fraudes ou atividades ilícitas;</li>
              <li>Não tentar invadir, comprometer ou prejudicar a estrutura do site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Cadastro e Informações</h2>
            <p>Caso o usuário forneça informações (nome, e-mail ou currículo), declara que:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>As informações são verdadeiras e atualizadas;</li>
              <li>É responsável pelos dados fornecidos;</li>
              <li>Autoriza o uso conforme descrito na Política de Privacidade.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Responsabilidade sobre as Vagas</h2>
            <p>O Bahia Vagas:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Não garante a veracidade absoluta das informações publicadas;</li>
              <li>Não participa do processo seletivo;</li>
              <li>Não garante contratação;</li>
              <li>Não se responsabiliza por negociações realizadas fora da plataforma.</li>
            </ul>
            <p className="mt-2 font-medium">Recomenda-se que os usuários verifiquem a autenticidade das empresas antes de fornecer dados sensíveis.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Propriedade Intelectual</h2>
            <p>Todo o conteúdo do site (textos, layout, identidade visual e logotipo) é de propriedade do Bahia Vagas, salvo indicação em contrário.</p>
            <p>É proibida a reprodução sem autorização prévia.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Links Externos</h2>
            <p>O site pode conter links para páginas externas. O Bahia Vagas não se responsabiliza por conteúdos, políticas ou serviços de terceiros.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Suspensão ou Bloqueio</h2>
            <p>O Bahia Vagas poderá suspender ou bloquear usuários que:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Violarem esta Política;</li>
              <li>Utilizarem o site para fins ilegais;</li>
              <li>Tentarem prejudicar o funcionamento da plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Atualizações</h2>
            <p>Esta Política poderá ser atualizada a qualquer momento, sem aviso prévio.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Contato</h2>
            <p>📧 contato@bahiavagas.com</p>
          </section>

          {/* Termos para Empresas */}
          <hr className="border-border my-12" />

          <h1 className="text-3xl font-bold mb-8 text-foreground">📄 TERMOS PARA EMPRESAS ANUNCIANTES – BAHIA VAGAS</h1>
          <p className="text-sm text-muted-foreground mb-8">Última atualização: 19 de fevereiro de 2026</p>

          <p>Este documento estabelece as regras para empresas, recrutadores e anunciantes que utilizam o Bahia Vagas para divulgar oportunidades.</p>
          <p>Ao anunciar vagas na plataforma, a empresa declara concordar integralmente com os termos abaixo.</p>

          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Objeto</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>O Bahia Vagas atua como plataforma digital de divulgação de vagas de emprego.</li>
              <li>Não participa do processo seletivo nem da contratação.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Responsabilidade da Empresa</h2>
            <p>A empresa anunciante declara que:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>É legalmente constituída;</li>
              <li>A vaga divulgada é real;</li>
              <li>As informações são verdadeiras;</li>
              <li>Cumpre a legislação trabalhista;</li>
              <li>Não pratica discriminação.</li>
            </ul>
            <p className="mt-4">É proibido divulgar:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Golpes ou esquemas fraudulentos;</li>
              <li>Trabalho ilegal;</li>
              <li>Conteúdo discriminatório;</li>
              <li>Exigências ilegais ou abusivas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Informações da Vaga</h2>
            <p>A empresa é responsável por:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Descrição;</li>
              <li>Requisitos;</li>
              <li>Salário (quando informado);</li>
              <li>Local;</li>
              <li>Forma de candidatura;</li>
              <li>Contato.</li>
            </ul>
            <p className="mt-2">O Bahia Vagas não se responsabiliza por dados incorretos fornecidos pela empresa.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Processo Seletivo</h2>
            <p>O Bahia Vagas:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Não cobra taxas de candidatos;</li>
              <li>Não realiza entrevistas;</li>
              <li>Não garante número de candidatos;</li>
              <li>Não intermedeia contratos.</li>
            </ul>
            <p className="mt-2">Toda negociação é responsabilidade exclusiva da empresa e do candidato.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Uso Indevido</h2>
            <p>O Bahia Vagas poderá remover anúncios e bloquear empresas que:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Publicarem informações falsas;</li>
              <li>Aplicarem golpes;</li>
              <li>Descumprirem leis ou estes termos.</li>
            </ul>
            <p className="mt-2">Em caso de suspeita de fraude, poderá colaborar com autoridades competentes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Proteção de Dados (LGPD)</h2>
            <p>A empresa que receber currículos se compromete a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Utilizar dados apenas para recrutamento;</li>
              <li>Não compartilhar dados sem consentimento;</li>
              <li>Armazenar informações com segurança;</li>
              <li>Excluir dados quando não forem mais necessários.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Direitos do Bahia Vagas</h2>
            <p>O Bahia Vagas poderá:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Revisar ou editar anúncios;</li>
              <li>Recusar vagas;</li>
              <li>Suspender anunciantes;</li>
              <li>Atualizar estes termos a qualquer momento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Limitação de Responsabilidade</h2>
            <p>O Bahia Vagas não garante:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Contratação;</li>
              <li>Resultado do processo seletivo;</li>
              <li>Prazo de preenchimento;</li>
              <li>Volume de candidatos.</li>
            </ul>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermosDeUso;
