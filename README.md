# MCP Simple Server (HTTP Bridge)

Este é um servidor MCP (Model Context Protocol) simplificado que expõe ferramentas através de uma interface HTTP POST. Ele permite que LLMs e agentes remotos acessem funcionalidades locais ou específicas de forma segura através de um túnel ou acesso direto.

## 🚀 Configurações Técnicas

- **Porta:** `3030`
- **Endpoint:** `/mcp`
- **Método:** `POST`
- **Autenticação:** `Authorization: Bearer senha-facil-123`
- **Protocolo:** JSON-RPC 2.0 (Adaptado para HTTP)

---

## 🧪 Testando Remotamente com CURL

Você pode validar o funcionamento do servidor de qualquer máquina com acesso à rede (ou via VPN Wireguard) usando os comandos abaixo.

### 1. Listar Ferramentas Disponíveis
```bash
curl -X POST http://10.7.0.1:3030/mcp \
  -H "Authorization: Bearer senha-facil-123" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### 2. Chamar a Ferramenta 'hello'
```bash
curl -X POST http://10.7.0.1:3030/mcp \
  -H "Authorization: Bearer senha-facil-123" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"hello","arguments":{"name":"Fabão"}},"id":2}'
```

---

## ♊ Configurando Gemini-CLI (Remoto)

Para que o `gemini-cli` em sua máquina local ou outra VPS acesse este servidor, você deve configurá-lo no arquivo de configuração do Gemini CLI (geralmente em `~/.gemini/config.yaml` ou via comando).

Como este servidor usa HTTP direto (e não o padrão stdio), você pode usar um "wrapper" ou configurar o acesso via SSE se o servidor for estendido, ou usar o plugin de fetch se disponível. 

**Exemplo de configuração (Assumindo uso de um proxy stdio-to-http):**
```bash
# No gemini-cli


gemini mcp add remote-server --command "npx @modelcontextprotocol/inspector http://10.7.0.1:3030/mcp"


```

No arquivo ~/.gemini/settings.json

```
"mcpServers": {                                                                                                                      
    "local-mcp": {                                                                                                                                     
      "url": "http://192.168.1.100:3030/mcp",                                                                                                          
      "headers": {                                                                                                                                     
        "Authorization": "Bearer senha-facil-123"                                                                                                      
      }                                                                                                                                                
    }             
  }

```



*Nota: Substitua o IP pelo endereço correto (ex: 10.7.0.1 da VPN).*

---

## 🤖 Configurando Claude Code

O Claude Code (e o Claude Desktop) geralmente esperam um comando local. Para acessar este servidor remoto:

1. Edite o arquivo `claude_desktop_config.json`:
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

2. Adicione a configuração:
```json
{
  "mcpServers": {
    "mcp-simple-server": {
      "command": "curl",
      "args": [
        "-s",
        "-X", "POST",
        "http://10.7.0.1:3030/mcp",
        "-H", "Authorization: Bearer senha-facil-123",
        "-H", "Content-Type: application/json",
        "-d", "{\"jsonrpc\":\"2.0\",\"method\":\"tools/call\",\"params\":<params>}"
      ]
    }
  }
}
```
*Dica: Para uma integração mais robusta, recomenda-se usar o `mcp-proxy` que converte stdio para a API HTTP do seu servidor.*

---

## 💬 Configurando ChatGPT (GPT Codex / Actions)

Para usar este servidor como uma **Action** no ChatGPT:

1. Vá em **Custom GPTs** -> **Create a GPT** -> **Configure** -> **Create new action**.
2. No campo **Authentication**, escolha **API Key**, selecione **Bearer** e insira: `senha-facil-123`.
3. No campo **Schema**, use uma especificação OpenAPI (exemplo simplificado abaixo):

```yaml
openapi: 3.0.0
info:
  title: MCP Simple Server
  version: 1.0.0
servers:
  - url: http://195.35.42.89:3030 # IP Público ou DNS
paths:
  /mcp:
    post:
      operationId: callMcpTool
      summary: Chama uma ferramenta do MCP
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                method: {type: string, example: "tools/call"}
                params: {type: object}
                id: {type: integer, example: 1}
      responses:
        '200':
          description: Sucesso
```

---

## 🐳 Docker

Este projeto está pronto para ser executado em containers.

### 1. Construir a Imagem
Para gerar a imagem Docker localmente:
```bash
docker build -t mcp-simple-server .
```

### 2. Subir o Container (Docker Compose)
A forma recomendada de rodar é utilizando o `docker-compose.yml` já incluso, que configura a rede e as variáveis de ambiente:
```bash
docker compose up -d
```

O container será criado com o nome `mcp-simple-server` e estará disponível na porta `3030`.

### 3. Verificar Status e Logs
```bash
# Ver se o container está rodando
docker ps | grep mcp-simple-server

# Ver logs do servidor
docker compose logs -f
```

---

## 🛠️ Desenvolvimento

Para rodar o servidor localmente:
```bash
cd ~/apps/mcp-simple-server
npm install
node server.js
```

O servidor estará ouvindo em `http://localhost:3030`.
