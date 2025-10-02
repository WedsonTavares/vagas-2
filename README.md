
# 🚀 Controle de Vagas

Sistema completo de gerenciamento de vagas de emprego desenvolvido com **Next.js 15**, **TypeScript**, **Tailwind CSS** e **Clerk** para autenticação.

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Componentes](#-componentes)
- [Rotas](#-rotas)
- [Estilo e Tema](#-estilo-e-tema)

## 🛠 Tecnologias

### Frontend
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização utilitária
- **Lucide React** - Ícones
- **Radix UI** - Componentes acessíveis

### Autenticação
- **Clerk** - Autenticação completa (login/registro/perfil)

### Estado e Dados
- **TanStack Query** - Gerenciamento de estado servidor
- **Prisma** - ORM para banco de dados (configurado)

### UI/UX
- **Next Themes** - Suporte a temas claro/escuro
- **Class Variance Authority** - Variantes de componentes
- **Tailwind Merge** - Otimização de classes CSS

## ✨ Funcionalidades

### 🔐 Autenticação
- Login/Registro com Clerk
- Proteção de rotas privadas
- Perfil de usuário integrado

### 🎨 Interface
- **Design Responsivo** - Mobile-first approach
- **Tema Claro/Escuro** - Alternância automática
- **Navegação Intuitiva** - Sidebar para desktop, dropdown para mobile
- **Componentes Reutilizáveis** - Sistema de design consistente

### 📱 Navegação
- **Desktop**: Sidebar fixa com logo e links
- **Mobile**: Navbar compacta com menu dropdown
- **Responsivo**: Adaptação automática por breakpoint

## 📁 Estrutura do Projeto

```
controle-vagas/
├── app/                          # App Router (Next.js 15)
│   ├── dashboard/               # Área autenticada
│   │   ├── add-job/            # Página para adicionar vagas
│   │   ├── jobs/               # Listagem de vagas
│   │   ├── stats/              # Estatísticas
│   │   └── layout.tsx          # Layout do dashboard
│   ├── globals.css             # Estilos globais e variáveis CSS
│   ├── layout.tsx              # Layout raiz com providers
│   ├── page.tsx                # Página inicial (landing)
│   └── provider.tsx            # Providers (Theme, Query)
├── components/                  # Componentes reutilizáveis
│   ├── ui/                     # Componentes base (Radix + Tailwind)
│   ├── LinksDropdown.tsx       # Menu dropdown mobile
│   ├── NavBar.tsx              # Navbar desktop
│   ├── NavBarMobile.tsx        # Navbar mobile
│   ├── Sidebar.tsx             # Sidebar desktop
│   ├── ThemeToggle.tsx         # Alternador de tema
│   └── theme-provider.tsx      # Provider de tema
├── utils/                      # Utilitários
│   └── links.tsx               # Configuração de links de navegação
├── assets/                     # Imagens e recursos
├── lib/                        # Configurações de bibliotecas
├── middleware.ts               # Middleware do Clerk
└── prisma/                     # Schema do banco (a ser configurado)
```

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/WedsonTavares/controle-vagas.git
cd controle-vagas

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database (a ser configurado)
DATABASE_URL="your-database-url"
```

### 2. Clerk Setup

1. Crie uma conta em [clerk.com](https://clerk.com)
2. Configure as URLs de redirecionamento
3. Adicione as chaves no `.env.local`

## 🎯 Uso

### Páginas Principais

- **`/`** - Landing page com apresentação do sistema
- **`/dashboard/add-job`** - Formulário para adicionar vagas
- **`/dashboard/jobs`** - Listagem de todas as vagas
- **`/dashboard/stats`** - Dashboard com estatísticas

### Fluxo de Navegação

1. **Usuário não autenticado**: Acessa landing page
2. **Clica em "Comece Agora"**: Redirecionado para login (Clerk)
3. **Após login**: Acesso ao dashboard com sidebar/navbar
4. **Desktop**: Navegação via sidebar fixa
5. **Mobile**: Navegação via dropdown na navbar

## 🧩 Componentes

### Navegação

#### `Sidebar` (Desktop)
```tsx
// Sidebar fixa para telas grandes (lg+)
// Logo + links de navegação com ícones
// Destaque para página ativa
```

#### `NavBar` (Desktop)
```tsx
// Navbar superior para desktop
// Menu dropdown + ThemeToggle + UserButton
```

#### `NavBarMobile` (Mobile)
```tsx
// Navbar compacta para mobile
// Menu dropdown + ThemeToggle + UserButton
// Classes: block lg:hidden
```

#### `LinksDropdown` (Mobile)
```tsx
// Dropdown com links de navegação
// Ícone de hambúrguer + lista de páginas
// Visível apenas em mobile
```

### Tema

#### `ThemeToggle`
```tsx
// Botão para alternar tema (light/dark/system)
// Ícones animados (sol/lua)
// Dropdown com opções
```

#### `ThemeProvider`
```tsx
// Provider do next-themes
// Gerencia estado do tema globalmente
```

### Sistema de Design

```tsx
// Todas as cores usam variáveis CSS
// Suporte automático a tema claro/escuro
// Componentes responsivos por padrão
```

## 🛣 Rotas

### Públicas
- **`/`** - Landing page

### Protegidas (requer autenticação)
- **`/dashboard/add-job`** - Adicionar nova vaga
- **`/dashboard/jobs`** - Listar vagas existentes  
- **`/dashboard/stats`** - Visualizar estatísticas

### Middleware
```typescript
// Proteção automática de rotas /dashboard/*
// Redirecionamento para login se não autenticado
// Configurado em middleware.ts
```

## 🎨 Estilo e Tema

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
"hidden lg:block"

// Mobile first para navbar
"block lg:hidden"

// Cores com variáveis CSS
"bg-[color:var(--color-sidebar)]"
"text-[color:var(--color-sidebar-foreground)]"
```

## 🔄 Próximos Passos (Backend)

1. **Configurar Prisma ORM**
2. **Criar modelo de dados para vagas**
3. **Implementar API routes para CRUD**
4. **Conectar formulários com backend**
5. **Implementar sistema de filtros e busca**
6. **Adicionar validações e tratamento de erros**

---

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

**Wedson Tavares**  
GitHub: [@WedsonTavares](https://github.com/WedsonTavares)
