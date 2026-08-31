# DOCUMENTAÇÃO OFICIAL INTERNA — REGRAS PARA DEPLOY NA NETLIFY

## OBJETIVO

Este documento define todas as regras técnicas que o projeto deve seguir para garantir que o site possa ser compilado e publicado corretamente na **Netlify**, evitando erros de build, páginas em branco, arquivos não encontrados, erros 404 ao atualizar páginas e falhas causadas por configurações incorretas.

Antes de qualquer deploy, o projeto deve ser validado de acordo com todas as regras abaixo.

---

# 1. REGRA PRINCIPAL: O PROJETO DEVE COMPILAR SEM ERROS

Antes de enviar o projeto para a Netlify, o comando de produção deve funcionar localmente.

O projeto deve possuir um comando de build válido no `package.json`.

Exemplo:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Antes do deploy, executar:

```bash
npm install
npm run build
```

O deploy só deve ser considerado pronto se o comando:

```bash
npm run build
```

terminar com sucesso.

### PROIBIDO:

* Erros de TypeScript.
* Imports inexistentes.
* Arquivos referenciados que não existem.
* Dependências não instaladas.
* Variáveis obrigatórias ausentes.
* Erros ignorados durante o build.
* Código que funciona apenas no ambiente de desenvolvimento.

---

# 2. DIRETÓRIO DE PUBLICAÇÃO

A Netlify publica apenas os arquivos que estiverem dentro do diretório configurado como **Publish Directory**.

Portanto, é obrigatório garantir que o diretório configurado seja exatamente o diretório gerado pelo build.

Exemplos comuns:

### Vite

```text
dist
```

### Create React App

```text
build
```

### Next.js

Deve utilizar a configuração adequada para Netlify e não simplesmente tentar publicar uma pasta incorreta.

### Site HTML estático

```text
.
```

ou:

```text
public
```

dependendo da estrutura do projeto.

### REGRA:

Nunca configurar a pasta de publicação sem verificar onde o comando `npm run build` realmente gera os arquivos finais.

---

# 3. ARQUIVO NETLIFY.TOML

Todo projeto deve preferencialmente possuir um arquivo:

```text
netlify.toml
```

na raiz do projeto.

Esse arquivo centraliza as configurações de build e deploy.

Exemplo recomendado para projetos Vite:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

A configuração definida no `netlify.toml` pode ter prioridade sobre configurações equivalentes feitas pela interface da Netlify. Portanto, não devem existir configurações conflitantes.

---

# 4. NÃO CRIAR CONFIGURAÇÕES DUPLICADAS OU CONFLITANTES

Antes do deploy, verificar:

* Configuração da Netlify.
* Arquivo `netlify.toml`.
* `package.json`.
* Variáveis de ambiente.
* Diretório base.
* Diretório de publicação.

Se o `netlify.toml` disser:

```toml
publish = "dist"
```

e a Netlify estiver configurada para:

```text
build
```

isso pode gerar problemas.

### REGRA:

Deve existir uma única configuração clara e consistente para:

* Build command.
* Publish directory.
* Base directory.
* Functions directory.

---

# 5. DEPENDÊNCIAS DEVEM ESTAR NO PACKAGE.JSON

Toda biblioteca utilizada pelo projeto deve estar declarada no:

```text
package.json
```

Exemplo:

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

### PROIBIDO:

Instalar bibliotecas localmente e esquecer de salvar no projeto.

O projeto nunca deve depender de uma biblioteca instalada apenas no computador do desenvolvedor.

Após clonar o projeto em uma máquina nova, o seguinte deve funcionar:

```bash
npm install
npm run build
```

---

# 6. NÃO USAR ARQUIVOS QUE EXISTEM APENAS LOCALMENTE

Todos os arquivos necessários para o funcionamento do site devem estar no repositório ou ser gerados durante o build.

Verificar:

* Imagens.
* Fontes.
* Arquivos JSON.
* Componentes.
* Assets.
* Modelos 3D.
* Arquivos CSS.
* Arquivos JavaScript.
* Configurações.

### PROIBIDO:

Referenciar caminhos do computador local como:

```text
C:\Users\...
```

ou:

```text
file:///...
```

Esses caminhos nunca funcionarão na Netlify.

---

# 7. CUIDADO COM MAIÚSCULAS E MINÚSCULAS

A Netlify utiliza ambiente baseado em Linux.

Isso significa que:

```text
Logo.png
```

é diferente de:

```text
logo.png
```

e:

```text
LOGO.PNG
```

também é diferente.

### REGRA OBRIGATÓRIA:

O nome utilizado no import deve ser exatamente igual ao nome real do arquivo.

Exemplo correto:

```javascript
import logo from "./assets/logo.png";
```

O arquivo deve realmente ser:

```text
logo.png
```

Não pode ser:

```text
Logo.png
```

---

# 8. CONFIGURAÇÃO PARA REACT ROUTER E SPA

Se o projeto for uma SPA utilizando React Router, Vue Router ou outro sistema de rotas no navegador, é obrigatório configurar um fallback.

Sem isso, o site pode funcionar normalmente na página inicial, mas apresentar erro 404 quando o usuário acessar ou atualizar uma rota diretamente.

Exemplo:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Essa configuração é recomendada para aplicações SPA.

Exemplo de projeto:

```text
/
├── src/
├── public/
├── package.json
├── vite.config.js
└── netlify.toml
```

---

# 9. NÃO UTILIZAR LINKS INTERNOS INCORRETOS

Para aplicações SPA, verificar todos os links internos.

Evitar:

```html
<a href="/pagina">
```

quando o sistema de rotas exige um componente específico.

Em React Router, utilizar quando apropriado:

```jsx
<Link to="/pagina">
```

Isso evita recarregamentos desnecessários e problemas de navegação.

---

# 10. VARIÁVEIS DE AMBIENTE

Nenhuma chave secreta deve ser escrita diretamente no código.

### PROIBIDO:

```javascript
const API_KEY = "MINHA_CHAVE_SECRETA";
```

### CORRETO:

Utilizar variáveis de ambiente.

Exemplo:

```env
API_KEY=sua_chave
```

As variáveis devem ser configuradas na Netlify através das configurações de ambiente do projeto.

A Netlify permite configurar variáveis por contexto de deploy, como produção, previews e branches.

---

# 11. NÃO ENVIAR ARQUIVOS .ENV COM SEGREDOS PARA O GITHUB

Arquivos contendo:

* API Keys.
* Tokens.
* Senhas.
* Credenciais.
* Chaves privadas.

não devem ser enviados para repositórios públicos.

Adicionar ao `.gitignore`:

```text
.env
.env.local
.env.production
```

Exemplo:

```text
node_modules
dist
.env
.env.local
```

---

# 12. CUIDADO COM VARIÁVEIS DO VITE

Se o projeto utilizar Vite, variáveis utilizadas diretamente no frontend devem seguir o padrão:

```text
VITE_NOME_DA_VARIAVEL
```

Exemplo:

```env
VITE_API_URL=https://api.exemplo.com
```

No código:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

### IMPORTANTE:

Nunca colocar informações secretas em variáveis expostas ao frontend.

Tudo que for enviado para o navegador pode potencialmente ser visualizado pelo usuário.

Para informações realmente secretas, utilizar backend, Netlify Functions ou outro ambiente seguro.

A própria documentação da Netlify recomenda usar funções para evitar expor valores sensíveis no site publicado.

---

# 13. VERSÃO DO NODE.JS

O projeto deve utilizar uma versão compatível e estável do Node.js.

Pode ser configurada através de variável de ambiente:

```text
NODE_VERSION
```

Exemplo no `netlify.toml`:

```toml
[build.environment]
  NODE_VERSION = "20"
```

Ou utilizar uma versão definida conforme a compatibilidade real do projeto.

### REGRA:

Nunca assumir que a versão instalada localmente será automaticamente a mesma utilizada pela Netlify.

---

# 14. LOCK FILE

O projeto deve possuir apenas o lock file correspondente ao gerenciador utilizado.

### Se usar npm:

```text
package-lock.json
```

### Se usar Yarn:

```text
yarn.lock
```

### Se usar pnpm:

```text
pnpm-lock.yaml
```

### REGRA:

Não misturar vários gerenciadores sem necessidade.

Evitar ter simultaneamente:

```text
package-lock.json
yarn.lock
pnpm-lock.yaml
```

Isso pode causar instalações inconsistentes.

---

# 15. ESTRUTURA RECOMENDADA PARA O PROJETO

Estrutura recomendada:

```text
meu-projeto/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
│
├── package.json
├── package-lock.json
├── vite.config.js
├── netlify.toml
├── .gitignore
└── README.md
```

---

# 16. CONFIGURAÇÃO RECOMENDADA PARA VITE + REACT

Arquivo:

```text
netlify.toml
```

Conteúdo:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Essa configuração deve ser usada apenas quando for compatível com a arquitetura da aplicação.

---

# 17. TESTE LOCAL OBRIGATÓRIO

Antes do deploy, executar:

```bash
npm install
```

Depois:

```bash
npm run build
```

Se o build terminar corretamente, testar a versão de produção:

```bash
npm run preview
```

Verificar:

* Página inicial.
* Navegação.
* Rotas.
* Imagens.
* Fontes.
* Botões.
* APIs.
* Login.
* Formulários.
* Responsividade.
* Console do navegador.

### REGRA:

Nenhum deploy deve ser enviado sem testar o build de produção.

---

# 18. VERIFICAR O CONSOLE DO NAVEGADOR

Antes do deploy, abrir:

```text
F12 → Console
```

Verificar se existem:

* Erros vermelhos.
* APIs bloqueadas.
* Arquivos não encontrados.
* CORS.
* Variáveis undefined.
* Problemas de autenticação.
* Erros de JavaScript.

### OBJETIVO:

O site deve funcionar sem erros críticos no console.

---

# 19. VERIFICAR A ABA NETWORK

Abrir:

```text
F12 → Network
```

Verificar:

* Imagens carregando.
* Arquivos JavaScript carregando.
* CSS carregando.
* APIs respondendo.
* Nenhum erro 404 importante.
* Nenhum erro 500.
* Nenhum arquivo bloqueado.

---

# 20. CORS E APIs EXTERNAS

Se o frontend consumir uma API externa, verificar se a API aceita requisições originadas pelo domínio da Netlify.

Exemplo:

```text
https://meusite.netlify.app
```

ou:

```text
https://meudominio.com.br
```

O backend deve permitir o domínio correto.

Problemas comuns:

```text
CORS policy blocked
```

Nesse caso, o problema pode não estar na Netlify, mas na configuração do servidor da API.

---

# 21. NÃO DEPENDER DE SERVIDOR NODE TRADICIONAL

A Netlify não funciona como uma hospedagem tradicional onde você simplesmente mantém um servidor Node.js executando permanentemente com:

```bash
node server.js
```

ou:

```bash
npm start
```

para servir uma aplicação backend tradicional.

A arquitetura deve ser adaptada para:

* Site estático.
* Serverless Functions.
* Edge Functions.
* APIs externas.
* Serviços de backend.

---

# 22. NETLIFY FUNCTIONS

Caso o projeto utilize backend, as funções devem ser organizadas corretamente.

Estrutura padrão:

```text
netlify/
└── functions/
    └── minha-funcao.js
```

Exemplo:

```javascript
export default async (request) => {
  return new Response(
    JSON.stringify({
      message: "Funcionando!"
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};
```

As funções devem ser testadas antes do deploy.

---

# 23. ARQUIVOS GRANDES

Evitar colocar arquivos desnecessariamente grandes no projeto.

Verificar:

* Vídeos.
* Arquivos 3D.
* Texturas enormes.
* Imagens sem compressão.
* Backups.
* Builds antigos.

Arquivos muito grandes podem:

* Aumentar o tempo de build.
* Aumentar o tempo de upload.
* Deixar o site lento.
* Consumir limites do projeto.

---

# 24. OTIMIZAÇÃO DE IMAGENS

Antes do deploy:

* Converter imagens pesadas.
* Utilizar WebP quando possível.
* Redimensionar imagens gigantes.
* Evitar PNG desnecessariamente pesado.
* Utilizar lazy loading quando apropriado.

Exemplo:

```html
<img
  src="/imagem.webp"
  loading="lazy"
  alt="Descrição da imagem"
/>
```

---

# 25. NÃO PUBLICAR A PASTA ERRADA

Um dos erros mais comuns é o build funcionar, mas a Netlify publicar uma pasta errada.

Exemplo:

O build gera:

```text
dist/
```

Mas a Netlify está configurada para:

```text
build/
```

Resultado possível:

* Página 404.
* Página em branco.
* Deploy aparentemente concluído, mas site não funciona.

### REGRA:

Sempre confirmar qual pasta é criada após:

```bash
npm run build
```

Essa deve ser a Publish Directory.

A Netlify publica apenas os arquivos presentes no diretório configurado para publicação.

---

# 26. CONFIGURAÇÃO PARA MONOREPOS

Se o projeto possuir vários aplicativos:

```text
projeto/
├── frontend/
├── backend/
└── admin/
```

A Netlify precisa saber exatamente onde está o projeto que será compilado.

Configurar corretamente:

* Base directory.
* Package directory.
* Build command.
* Publish directory.

Nunca assumir que a raiz do repositório é automaticamente o frontend correto.

---

# 27. NÃO USAR CONFIGURAÇÕES TEMPORÁRIAS EM PRODUÇÃO

Antes do deploy, remover:

* `console.log()` excessivos.
* URLs de localhost.
* Dados falsos de teste.
* APIs temporárias.
* Tokens temporários.
* Modo debug.
* Configurações exclusivas de desenvolvimento.

### PROIBIDO EM PRODUÇÃO:

```javascript
fetch("http://localhost:3000/api")
```

Utilizar variáveis de ambiente para separar desenvolvimento e produção.

---

# 28. DOMÍNIO PERSONALIZADO

Depois que o deploy funcionar no domínio temporário da Netlify, configurar o domínio personalizado.

Antes de apontar o domínio, verificar:

* HTTPS.
* DNS.
* Redirecionamento.
* [www](http://www).
* domínio principal.
* APIs.
* CORS.

---

# 29. HTTPS OBRIGATÓRIO

Todos os recursos devem funcionar utilizando HTTPS.

Evitar:

```text
http://
```

quando o site está em:

```text
https://
```

Isso pode causar bloqueio de conteúdo misto.

Preferir:

```text
https://
```

---

# 30. PROCESSO OBRIGATÓRIO ANTES DO DEPLOY

## ETAPA 1 — INSTALAR

```bash
npm install
```

## ETAPA 2 — EXECUTAR O PROJETO

```bash
npm run dev
```

## ETAPA 3 — TESTAR

Verificar todas as funcionalidades.

## ETAPA 4 — BUILD DE PRODUÇÃO

```bash
npm run build
```

## ETAPA 5 — CORRIGIR TODOS OS ERROS

Não ignorar nenhum erro crítico.

## ETAPA 6 — TESTAR BUILD

```bash
npm run preview
```

## ETAPA 7 — VERIFICAR CONFIGURAÇÃO

Conferir:

```text
Build Command
Publish Directory
Node Version
Environment Variables
Redirects
```

## ETAPA 8 — DEPLOY

Enviar para a Netlify.

---

# 31. CHECKLIST FINAL OBRIGATÓRIO

Antes de fazer o deploy, confirmar:

### BUILD

* [ ] `npm install` funciona.
* [ ] `npm run build` funciona.
* [ ] Não existem erros de compilação.
* [ ] Todas as dependências estão no `package.json`.

### ARQUIVOS

* [ ] Nenhum arquivo possui caminho local.
* [ ] Todos os imports existem.
* [ ] Maiúsculas e minúsculas estão corretas.
* [ ] Imagens e assets existem no projeto.

### NETLIFY

* [ ] `netlify.toml` está correto.
* [ ] Build Command está correto.
* [ ] Publish Directory está correto.
* [ ] Node.js está configurado corretamente.
* [ ] Não existem configurações conflitantes.

### ROTAS

* [ ] Todas as páginas funcionam.
* [ ] Atualizar uma rota não gera 404.
* [ ] SPA possui fallback quando necessário.

### SEGURANÇA

* [ ] Nenhuma API Key está exposta.
* [ ] `.env` não contém segredos publicados no GitHub.
* [ ] Variáveis sensíveis estão configuradas na Netlify.

### PRODUÇÃO

* [ ] Nenhuma URL aponta para localhost.
* [ ] APIs funcionam.
* [ ] Imagens carregam.
* [ ] Fontes carregam.
* [ ] Console não possui erros críticos.
* [ ] Site funciona em celular.
* [ ] Site funciona após atualizar a página.

---

# 32. REGRA ABSOLUTA PARA A IA OU DESENVOLVEDOR

Sempre que estiver preparando um projeto para deploy na Netlify, siga este protocolo:

> Antes de finalizar qualquer alteração, analise a estrutura completa do projeto e garanta que todas as dependências, imports, caminhos de arquivos, variáveis de ambiente, comandos de build e configurações estejam compatíveis com o ambiente Linux da Netlify.

> Nunca considere o projeto pronto apenas porque funciona em modo de desenvolvimento.

> O projeto só estará pronto para deploy quando o build de produção executar com sucesso.

> Sempre identificar corretamente o diretório gerado pelo build e configurá-lo como Publish Directory.

> Sempre verificar se o projeto possui rotas SPA que precisam de redirecionamento para `index.html`.

> Nunca utilizar caminhos locais, localhost em produção, arquivos inexistentes ou dependências instaladas apenas localmente.

> Nunca expor chaves secretas no código frontend.

> Antes do deploy, executar obrigatoriamente `npm run build` e corrigir todos os erros encontrados.

> Se houver qualquer dúvida sobre a configuração do framework, analisar o `package.json`, o sistema de build e a estrutura de arquivos antes de definir as configurações da Netlify.

---

# CONFIGURAÇÃO PADRÃO RECOMENDADA — VITE + REACT

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

# COMANDO FINAL DE VALIDAÇÃO

Antes de autorizar o deploy, executar:

```bash
npm install && npm run build
```

Se esse processo terminar sem erros e o diretório de publicação estiver correto, o projeto está preparado para seguir para a Netlify.

---

# PRINCÍPIO FINAL

## DESENVOLVIMENTO ≠ PRODUÇÃO

Um projeto funcionando em:

```bash
npm run dev
```

não significa que ele está pronto para a Netlify.

A validação real é:

```bash
npm install
npm run build
npm run preview
```

Somente após essas etapas o deploy deve ser realizado.

---

# REFERÊNCIAS OFICIAIS

Para configurações específicas e atualizadas da plataforma:

[Documentação de Build da Netlify](https://docs.netlify.com/build/configure-builds/overview/?utm_source=chatgpt.com)

[Documentação de Deploy da Netlify](https://docs.netlify.com/deploy/deploy-overview/?utm_source=chatgpt.com)

[Configuração com netlify.toml](https://docs.netlify.com/build/configure-builds/file-based-configuration/?utm_source=chatgpt.com)

[Variáveis de Ambiente da Netlify](https://docs.netlify.com/build/environment-variables/overview/?utm_source=chatgpt.com)

[Netlify CLI Deploy](https://cli.netlify.com/commands/deploy/?utm_source=chatgpt.com)
