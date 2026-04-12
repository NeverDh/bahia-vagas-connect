# E-mails de autenticação — Supabase (sem Lovable)

O projeto tinha a Edge Function `auth-email-hook`, que recebia o **Send Email Hook** do Auth e enviava mensagens pela API da Lovable. Para usar **apenas o fluxo de e-mail do Supabase**, faça o seguinte no **Dashboard do projeto** (supabase.com).

## 1. Desativar o hook que chama a Edge Function

1. Abra o projeto → **Authentication**.
2. Vá em **Hooks** (ou **Auth Hooks**, conforme a versão do painel).
3. Localize o hook do tipo **Send Email** (ou equivalente) cujo URL aponta para  
   `.../functions/v1/auth-email-hook`.
4. **Desative** o hook ou **remova** a URL.  
   Com isso, o **GoTrue** volta a enviar os e-mails transacionais pelo mecanismo padrão do Supabase.

> Sem esse passo, o Auth continua tentando usar a função antiga (e a Lovable).

## 2. URLs do site (obrigatório após mudar domínio)

Em **Authentication → URL Configuration**:

- **Site URL**: `https://bahiavagas.com` (ou o domínio definitivo).
- **Redirect URLs**: inclua todas as URLs permitidas após login/confirmação (ex.: `https://bahiavagas.com/**`, `http://localhost:5173/**` em dev).

## 3. Modelos de e-mail

Em **Authentication → Email Templates** ajuste assuntos e corpos (confirmação, recuperação de senha, magic link, etc.) nas línguas que quiser. Variáveis como `{{ .ConfirmationURL }}` são as oficiais do Supabase.

## 4. Remetente e volume (produção)

- **Plano gratuito / padrão**: o Supabase envia pelos servidores deles; há **limites de taxa**; o remetente pode não ser o seu domínio.
- **Marca e domínio próprio**: em **Project Settings → Authentication → SMTP** configure **SMTP personalizado** (ex.: e-mail da Hostinger, Resend, SendGrid). O Auth continua sendo o Supabase; só o **transporte** do e-mail é o seu provedor.

Secrets `LOVABLE_API_KEY` na Edge Function **deixam de ser necessários** para auth após desligar o hook.

## 5. Código no repositório

A pasta `supabase/functions/auth-email-hook/` e os templates em `supabase/functions/_shared/email-templates/` ficam como **referência histórica**; não precisam ser deployadas se o hook estiver desligado. Opcionalmente remova o deploy dessa função no Supabase para evitar confusão.

## Referência

- [Auth Hooks (Supabase)](https://supabase.com/docs/guides/auth/auth-hooks)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
