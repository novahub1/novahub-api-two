# 🚀 API de Pets do Roblox - Vercel

API para receber dados de pets do Roblox com **auto-limpeza automática após 3 segundos**.

## 📁 Estrutura do Projeto

```
seu-projeto/
├── api/
│   └── animals.js      ← Código da API
├── package.json        ← Configurações do Node
├── vercel.json        ← Configurações da Vercel
└── README.md          ← Este arquivo
```

## 🔧 Como Fazer Deploy na Vercel

### Opção 1: Deploy via GitHub (Recomendado)

1. **Crie um repositório no GitHub**
   - Vá em https://github.com/new
   - Crie um novo repositório (ex: `roblox-pets-api`)

2. **Faça upload dos arquivos**
   - Crie as pastas e arquivos conforme a estrutura acima
   - Commit e push para o GitHub

3. **Conecte na Vercel**
   - Acesse https://vercel.com
   - Clique em "Add New Project"
   - Selecione seu repositório do GitHub
   - Clique em "Deploy"

4. **Pronto!** Sua API estará em:
   ```
   https://seu-projeto.vercel.app/api/animals
   ```

### Opção 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

## 📡 Endpoints da API

### POST `/api/animals`
Recebe dados de um pet do Roblox

**Request:**
```json
{
  "animal": {
    "name": "Huge Cat",
    "generation": "472.5M/s",
    "jobId": "abc123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Animal recebido com sucesso",
  "data": {
    "name": "Huge Cat",
    "generation": "472.5M/s",
    "jobId": "abc123",
    "receivedAt": "2025-11-26T10:30:45.123Z"
  },
  "totalAnimals": 15
}
```

### GET `/api/animals`
Retorna todos os pets ativos (menos de 3 segundos)

**Response:**
```json
{
  "success": true,
  "totalAnimals": 15,
  "totalServers": 2,
  "animals": [
    {
      "name": "Huge Cat",
      "generation": "472.5M/s",
      "jobId": "abc123",
      "ageInSeconds": 1.45,
      "timeRemainingSeconds": 1.55,
      "receivedAt": "2025-11-26T10:30:45.123Z"
    }
  ],
  "groupedByServer": {
    "abc123": [...]
  },
  "info": {
    "autoDeleteAfter": "3 seconds",
    "currentTime": "2025-11-26T10:30:46.573Z"
  }
}
```

## 🔄 Sistema de Auto-Limpeza

- ✅ Dados são deletados **automaticamente após 3 segundos**
- ✅ Limpeza ocorre em **toda requisição** (GET ou POST)
- ✅ Não precisa de cron job ou timer externo
- ✅ Mantém a API sempre limpa e rápida

## 🎯 Exemplo de Uso no Script Roblox

Depois do deploy, configure no script Lua:

```lua
APIS = {
    {
        url = "https://sua-api.vercel.app/api/animals",
        minGeneration = 100000,
        maxGeneration = 500000
    }
}
```

## 📊 Testando a API

### Enviar dados (POST):
```bash
curl -X POST https://sua-api.vercel.app/api/animals \
  -H "Content-Type: application/json" \
  -d '{"animal":{"name":"Test Pet","generation":"100K/s","jobId":"test123"}}'
```

### Ver dados (GET):
```bash
curl https://sua-api.vercel.app/api/animals
```

## ⚡ Recursos

- ✅ Auto-limpeza após 3 segundos
- ✅ CORS habilitado para Roblox
- ✅ Agrupamento por servidor (jobId)
- ✅ Informações de tempo restante
- ✅ Totalmente gratuito na Vercel
- ✅ Deploy em segundos

## 🌟 Dicas

1. **Múltiplas APIs**: Faça deploy de vários projetos para ter múltiplas URLs
2. **Monitoramento**: Acesse `/api/animals` no navegador para ver dados em tempo real
3. **Logs**: Veja logs na dashboard da Vercel

## 📝 Notas Importantes

- Os dados são armazenados **em memória** (não persistem entre deploys)
- Para persistência, considere usar um banco de dados (MongoDB, PostgreSQL, etc)
- A limpeza é automática e não requer configuração adicional

---

🎮 Feito para integração com Roblox Pet Simulator