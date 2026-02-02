# Instruções para Agentes de IA - PontosWeb 🕒

Este documento serve como guia de continuidade para qualquer IA (Antigravity ou outras) que assuma o desenvolvimento deste projeto.

## 🎯 Visão Geral
O **PontosWeb** é um sistema de controle de ponto eletrônico focado em precisão absoluta e facilidade de gestão de RH. O usuário (Fabio) preza por uma interface premium, moderna e funcionalidade "industrial" (robusta e confiável).

## 🏗️ Arquitetura Atuali (v1.4.1)
- **Backend**: Node.js, Express, Prisma (MySQL).
- **Frontend**: React, Vite, Tailwind CSS.
- **Relatórios**: PDFKit (ajustado para A4 nativo) e ExcelJS.
- **Conformidade**: Cálculos de horas trabalhadas, extras, atrasos e abonos consolidados.

## 📜 Regras de Ouro
1. **Layout A4**: Nunca altere as margens do PDF no `exportService.js` sem testar se o resumo e assinatura continuam cabendo em uma única página A4.
2. **Prisma Singleton**: Sempre use o singleton do Prisma para evitar conexões excessivas no banco.
3. **Padrão de Nomenclatura**: Arquivos exportados devem seguir `Cartao_Ponto_NOME_MES.pdf` ou `Relatorio_Gerencial_MES.xlsx`.
4. **Resumo Mensal**: Toda modificação no cálculo de batidas deve ser refletida no resumo estatístico do frontend.

## 📂 Documentos de Trabalho
- `/.agent/backlog.md`: Lista dinâmica de tarefas futures.
- `/.agent/context.md`: Contexto histórico da evolução do projeto.

---
*Assinado por Antigravity (IA Atual)*
