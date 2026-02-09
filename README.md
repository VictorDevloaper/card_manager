# 💳 Gerenciador de Cartões (Card Manager)

> **Uma maneira moderna, poderosa e intuitiva de controlar seus gastos com cartão de crédito, parcelas e devedores.**

![Dispositivos](https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3)

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com as tecnologias mais modernas do mercado para garantir performance, escalabilidade e uma experiência de usuário premium.

<div align="center">

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</div>

---

## 🚀 Visão Geral

O **Gerenciador de Cartões** é uma aplicação web desenvolvida para ajudar você a assumir o controle total das suas finanças. Ele resolve a complexidade de gerenciar múltiplos cartões de crédito, rastrear parcelamentos e monitorar dívidas de amigos ou familiares que compartilham seu cartão.

Com uma interface elegante em modo escuro e sincronização de dados em tempo real via **Supabase**, oferece uma experiência premium.

## ✨ Principais Funcionalidades

-   **📊 Dashboard Interativo**: Visão geral em tempo real de seus limites, dívidas totais e próximas faturas.
-   **💳 Gestão Multi-Cartão**: Alterne facilmente entre diferentes cartões de crédito, com cores e limites personalizados.
-   **👥 Rastreamento de Devedores**: Controle quem usa seu cartão. Veja exatamente quanto devem e quantas parcelas restam.
-   **📅 Projeção Inteligente de Faturas**: Calcula automaticamente faturas futuras com base nos planos de parcelamento para os próximos 12 meses.
-   **🛒 Gestão de Compras**: Formulário fácil para adicionar novas compras com cálculo automático de parcelas e datas.
-   **☁️ Sincronização na Nuvem**: Todos os dados são armazenados de forma segura no **Supabase**, acessíveis de qualquer dispositivo.

## 🏁 Como Começar

### Pré-requisitos

-   Node.js (v18+)
-   npm ou yarn

### Instalação

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/VictorDevloaper/card_manager.git
    cd card_manager
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente**
    Crie um arquivo `.env` na raiz do projeto e adicione suas credenciais do Supabase:
    ```env
    VITE_SUPABASE_URL=sua_url_do_projeto_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
    ```

4.  **Rode o servidor de desenvolvimento**
    ```bash
    npm run dev
    ```

## 🚀 Deploy

A aplicação está otimizada para deploy em serviços de hospedagem estática como **Render**, **Vercel** ou **Netlify**.

**Comando de Build:**
```bash
npm run build
```

**Diretório de Saída:**
`dist`

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

---

<p align="center">
  Feito por <strong>VictorDevloaper</strong>
</p>
