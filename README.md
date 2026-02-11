# 📦 SLA Calculator

Aplicação web para cálculo de SLA logístico, permitindo registrar entregas, identificar atrasos ou antecipações e exportar os dados para análise em Excel.

🔗 Acesse online: https://SEU-LINK-DA-VERCEL-AQUI

---

## 🚀 Sobre o Projeto

O **SLA Calculator** foi desenvolvido para simular um cenário real de controle logístico, onde é necessário:

- Registrar número de Nota Fiscal (NF)
- Comparar data prevista vs data de entrega
- Calcular variação em dias
- Classificar automaticamente como:
  - ✅ No prazo
  - 🔵 Antecipado
  - 🔴 Atrasado
- Exportar histórico em CSV para uso em Excel (PROCX, dashboards, etc.)

---

## 🧠 Regras de Negócio

- Variação negativa → Entrega antes do prazo
- Variação zero → Entrega no prazo
- Variação positiva → Entrega em atraso
- NF deve conter 6 dígitos numéricos
- Datas no formato brasileiro (dd/mm/aaaa)

---

## 🛠 Tecnologias Utilizadas

- React
- Vite
- JavaScript (ES6+)
- LocalStorage
- Vercel (Deploy)

---

## 📂 Estrutura do Projeto

src/
├─ components/
│ ├─ Header.jsx
│ ├─ SlaForm.jsx
│ ├─ HistoricoTable.jsx
├─ utils/
│ ├─ dateUtils.js
│ ├─ csvUtils.js
├─ App.jsx
