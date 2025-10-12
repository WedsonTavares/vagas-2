# 📋 Controle de Vagas

Sistema completo para gerenciamento de candidaturas de emprego, desenvolvido com as mais modernas tecnologias web.

Sistema completo de gerenciamento de vagas de emprego desenvolvido com **Next.js 15**, **TypeScript**, **Tailwind CSS** e **Clerk** para autenticação.

## 🎯 **Visão Geral**

## 📋 Índice

Uma aplicação full-stack profissional que permite organizar, acompanhar e gerenciar todas as suas candidaturas de emprego em um só lugar. Com interface moderna, notificações elegantes e funcionalidades avançadas de busca e estatísticas.

- [Tecnologias](#-tecnologias)

## ✨ **Funcionalidades Principais**- [Funcionalidades](#-funcionalidades)

- [Estrutura do Projeto](#-estrutura-do-projeto)

### 🔐 **Autenticação Segura**- [Instalação](#-instalação)

- Login/Registro com **Clerk Auth**- [Configuração](#-configuração)

- Proteção de rotas e dados por usuário- [Uso](#-uso)

- Interface responsiva para todos os dispositivos- [Componentes](#-componentes)

- [Rotas](#-rotas)

### 📊 **Gestão Completa de Vagas**- [Estilo e Tema](#-estilo-e-tema)

- ➕ **Adicionar vagas** com formulário detalhado

- 📋 **Listar vagas** com cards visuais coloridos por status## 🛠 Tecnologias

- 🔍 **Busca inteligente** por empresa ou título (com debounce)

- 📈 **Estatísticas** com gráficos e métricas### Frontend

- **Next.js 15** - Framework React com App Router

### 🎨 **Interface Moderna**- **TypeScript** - Tipagem estática

- 🌙 **Modo escuro/claro** com transições suaves- **Tailwind CSS v4** - Estilização utilitária

- 🎯 **Cards coloridos** por status da candidatura- **Lucide React** - Ícones

- 📱 **Design responsivo** otimizado para mobile- **Radix UI** - Componentes acessíveis

- 🔔 **Notificações elegantes** (toast profissional)

- ✅ **Modais de confirmação** customizados### Autenticação

- **Clerk** - Autenticação completa (login/registro/perfil)

### ⚡ **Recursos Avançados**

- 🗑️ **Exclusão automática** quando rejeitado### Estado e Dados

- 🔄 **Atualizações em tempo real**- **TanStack Query** - Gerenciamento de estado servidor

- 📊 **Dashboard de estatísticas** detalhado- **Prisma** - ORM para banco de dados (configurado)

- 🎛️ **Filtros profissionais** sem sobrecarregar o banco

### UI/UX

## 🛠 **Stack Tecnológica**- **Next Themes** - Suporte a temas claro/escuro

- **Class Variance Authority** - Variantes de componentes

### **Frontend**- **Tailwind Merge** - Otimização de classes CSS

- ⚛️ **Next.js 15** - Framework React com App Router

- 🎨 **Tailwind CSS v4** - Estilização utilitária moderna## ✨ Funcionalidades

- 🧩 **Radix UI** - Componentes acessíveis e customizáveis

- 📱 **Design System** - Temas e variáveis CSS consistentes### 🔐 Autenticação

- Login/Registro com Clerk

### **Backend & Database**- Proteção de rotas privadas

- 🗄️ **Supabase PostgreSQL** - Banco de dados robusto- Perfil de usuário integrado

- 🔧 **Prisma ORM** - Type-safe database toolkit

- 🔑 **Clerk Authentication** - Autenticação completa### 🎨 Interface

- 🚀 **API Routes** - Endpoints RESTful integrados- **Design Responsivo** - Mobile-first approach

- **Tema Claro/Escuro** - Alternância automática

### **Developer Experience**- **Navegação Intuitiva** - Sidebar para desktop, dropdown para mobile

- 📘 **TypeScript** - Type safety completo- **Componentes Reutilizáveis** - Sistema de design consistente

- 🎯 **Linting/Formatting** - Código consistente

- 🔄 **Hot Reload** - Desenvolvimento ágil### 📱 Navegação

- **Desktop**: Sidebar fixa com logo e links

## 🎨 **Esquema de Cores por Status**- **Mobile**: Navbar compacta com menu dropdown

- **Responsivo**: Adaptação automática por breakpoint

### 📋 **Status das Candidaturas:**

- 🟡 **Pendente** - Vaga encontrada, ainda não aplicada## 📁 Estrutura do Projeto

- 🔵 **Candidatura Enviada** - Aplicação enviada com sucesso

- 🟣 **Em Entrevista** - Processo seletivo em andamento```

- 🔴 **Rejeitado** - Rejeitado (remove automaticamente)controle-vagas/

- 🟢 **Aceito** - Vaga conquistada! 🎉├── app/ # App Router (Next.js 15)

│ ├── dashboard/ # Área autenticada

## ⚙️ **Configuração e Instalação**│ │ ├── add-job/ # Página para adicionar vagas

│ │ ├── jobs/ # Listagem de vagas

### **1. Pré-requisitos**│ │ ├── stats/ # Estatísticas

- Node.js 18+ │ │ └── layout.tsx # Layout do dashboard

- npm ou yarn│ ├── globals.css # Estilos globais e variáveis CSS

- Conta no [Supabase](https://supabase.com)│ ├── layout.tsx # Layout raiz com providers

- Conta no [Clerk](https://clerk.com)│ ├── page.tsx # Página inicial (landing)

│ └── provider.tsx # Providers (Theme, Query)

### **2. Clonar o Repositório**├── components/ # Componentes reutilizáveis

````bash│ ├── ui/                     # Componentes base (Radix + Tailwind)

git clone https://github.com/WedsonTavares/controle-vagas.git│   ├── LinksDropdown.tsx       # Menu dropdown mobile

cd controle-vagas│   ├── NavBar.tsx              # Navbar desktop

```│   ├── NavBarMobile.tsx        # Navbar mobile

│   ├── Sidebar.tsx             # Sidebar desktop

### **3. Instalar Dependências**│   ├── ThemeToggle.tsx         # Alternador de tema

```bash│   └── theme-provider.tsx      # Provider de tema

npm install├── utils/                      # Utilitários

```│   └── links.tsx               # Configuração de links de navegação

├── assets/                     # Imagens e recursos

### **4. Configurar Variáveis de Ambiente**├── lib/                        # Configurações de bibliotecas

```bash├── middleware.ts               # Middleware do Clerk

# Copiar arquivo de exemplo└── prisma/                     # Schema do banco (a ser configurado)

cp .env.example .env```


## 🚀 **Instalação e Configuração**

### **1. Clonar o Repositório**
```bash
git clone https://github.com/WedsonTavares/controle-vagas.git
cd controle-vagas
````

### **2. Instalar Dependências**

```bash
npm install
```

### **3. Configurar Variáveis de Ambiente**

```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar .env.local com suas credenciais
```

**Configurar `.env.local`:**

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL="postgresql://postgres:password@host:5432/database"
```

### **4. Configurar Banco de Dados**

```bash
# Sincronizar schema com o banco
npm run db:push

# Gerar Prisma Client
npm run db:generate
```

### **5. Executar em Desenvolvimento**

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

### **6. Executar em Desenvolvimento**

```bash# Database (a ser configurado)

npm run devDATABASE_URL="your-database-url"

```

Acesse: [http://localhost:3000](http://localhost:3000)### 2. Clerk Setup

## 🚀 **Deploy no Vercel**1. Crie uma conta em [clerk.com](https://clerk.com)

## 🚀 **Deploy no Vercel**

### **Deploy Automático:**

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no dashboard
3. Deploy automático a cada push

### **Variáveis de Ambiente (Vercel):**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
DATABASE_URL=postgresql://postgres:password@host:5432/database
```

## 🎯 **Uso do Sistema**

### **Páginas Principais**

- **`/`** - Landing page com apresentação do sistema
- **`/dashboard/add-job`** - Formulário para adicionar vagas
- **`/dashboard/jobs`** - Listagem de todas as vagas
- **`/dashboard/stats`** - Dashboard com estatísticas

### **Fluxo de Navegação**

1. **Usuário não autenticado**: Acessa landing page
2. **Clica em "Comece Agora"**: Redirecionado para login (Clerk)

3. **Após login**: Acesso ao dashboard com sidebar/navbar

## 🎯 **Scripts Disponíveis**4. **Desktop**: Navegação via sidebar fixa

5. **Mobile**: Navegação via dropdown na navbar

````bash

npm run dev          # Executar em desenvolvimento## 🧩 Componentes

npm run build        # Build para produção

npm run start        # Executar build de produção### Navegação

npm run lint         # Verificar linting

npm run db:push      # Sincronizar schema do banco#### `Sidebar` (Desktop)

npm run db:generate  # Gerar Prisma Client```tsx

npm run db:studio    # Interface visual do banco// Sidebar fixa para telas grandes (lg+)

```// Logo + links de navegação com ícones

// Destaque para página ativa

## 📊 **Funcionalidades Detalhadas**```



### **🔍 Sistema de Busca**#### `NavBar` (Desktop)

- Pesquisa em tempo real com debounce (300ms)```tsx

- Busca por título da vaga e nome da empresa// Navbar superior para desktop

- Filtros visuais sem requisições desnecessárias// Menu dropdown + ThemeToggle + UserButton

- Interface limpa com contador de resultados```



### **🎨 Interface Adaptativa**#### `NavBarMobile` (Mobile)

- Modo escuro/claro com persistência```tsx

- Cards responsivos (5 por linha em telas grandes)// Navbar compacta para mobile

- Expansão de cards para visualização completa// Menu dropdown + ThemeToggle + UserButton

- Cores dinâmicas baseadas no status// Classes: block lg:hidden

````

### **📱 Mobile First**

- Design responsivo otimizado#### `LinksDropdown` (Mobile)

- Menu hambúrguer para navegação```tsx

- Touch-friendly para dispositivos móveis// Dropdown com links de navegação

- Layouts adaptáveis para todas as telas// Ícone de hambúrguer + lista de páginas

// Visível apenas em mobile

### **🔔 Sistema de Notificações**```

- Toasts profissionais com animações

- Modais de confirmação customizados### Tema

- Feedback visual para todas as ações

- Estados de loading e erro#### `ThemeToggle`

````tsx

## 🛡️ **Segurança**// Botão para alternar tema (light/dark/system)

// Ícones animados (sol/lua)

- ✅ Autenticação robusta com Clerk// Dropdown com opções

- ✅ Validação de dados no frontend e backend```

- ✅ Proteção de rotas sensíveis

- ✅ Sanitização de inputs#### `ThemeProvider`

- ✅ Environment variables protegidas```tsx

- ✅ CORS configurado adequadamente// Provider do next-themes

// Gerencia estado do tema globalmente

## 🤝 **Contribuição**```



1. Fork o projeto### Sistema de Design

2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)

3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)```tsx

4. Push para a branch (`git push origin feature/AmazingFeature`)// Todas as cores usam variáveis CSS

5. Abra um Pull Request// Suporte automático a tema claro/escuro

// Componentes responsivos por padrão




## 👨‍💻 **Autor**### Públicas

- **`/`** - Landing page

**Wedson Tavares**

- GitHub: [@WedsonTavares](https://github.com/WedsonTavares)### Protegidas (requer autenticação)

- LinkedIn: [Wedson Tavares](https://linkedin.com/in/wedson-tavares)- **`/dashboard/add-job`** - Adicionar nova vaga

- **`/dashboard/jobs`** - Listar vagas existentes

## 🎉 **Agradecimentos**- **`/dashboard/stats`** - Visualizar estatísticas



- [Next.js](https://nextjs.org) pela excelente framework### Middleware

- [Supabase](https://supabase.com) pela infraestrutura robusta```typescript

- [Clerk](https://clerk.com) pela autenticação completa// Proteção automática de rotas /dashboard/*

- [Tailwind CSS](https://tailwindcss.com) pelo sistema de design// Redirecionamento para login se não autenticado

- [Prisma](https://prisma.io) pelo ORM type-safe// Configurado em middleware.ts

````

---

## 🎨 Estilo e Tema

⭐ **Se este projeto te ajudou, considere dar uma estrela no repositório!**

### Sistema de Cores

```css
/* Variáveis CSS para temas */
:root {
  --primary: oklch(0.606 0.25 292.717);
  --background: oklch(1 0 0);
  --sidebar: oklch(0.985 0 0);
  /* ... mais variáveis */
}

.dark {
  --primary: oklch(0.541 0.281 293.009);
  --background: oklch(0.141 0.005 285.823);
  --sidebar: oklch(0.21 0.006 285.885);
  /* ... versões dark */
}
```

### Responsividade

```css
/* Breakpoints Tailwind CSS */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices (desktop) */
xl: 1280px  /* Extra large devices */
```

### Padrão de Classes

```tsx
// Desktop first para sidebar
'hidden lg:block';

// Mobile first para navbar
'block lg:hidden';

// Cores com variáveis CSS
'bg-[color:var(--color-sidebar)]';
'text-[color:var(--color-sidebar-foreground)]';
```

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

**Wedson Tavares**  
GitHub: [@WedsonTavares](https://github.com/WedsonTavares)




Criar a dashboard para bater metas da estrategia recolocação

juntar vagas, status e + vagas no meno link