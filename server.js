const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3030;
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'senha-facil-123';

// Middleware de Autenticação
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
        return res.status(401).json({ error: 'Unauthorized - Bearer token missing or invalid' });
    }
    next();
});

/**
 * Handler MCP Simplificado via HTTP POST
 * Segue a estrutura básica do protocolo JSON-RPC do MCP
 */
app.post('/mcp', (req, res) => {
    const { method, params, id } = req.body;

    console.log(`[MCP] Chamada: ${method}`, params || '');

    switch (method) {
        case 'initialize':
            return res.json({
                jsonrpc: '2.0',
                id,
                result: {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: {}
                    },
                    serverInfo: {
                        name: 'mcp-simple-server',
                        version: '1.0.0'
                    }
                }
            });

        case 'tools/list':
            return res.json({
                jsonrpc: '2.0',
                id,
                result: {
                    tools: [
                        {
                            name: 'hello',
                            description: 'Retorna uma saudação amigável.',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    name: { 
                                        type: 'string',
                                        description: 'Nome da pessoa'
                                    }
                                },
                                required: ['name']
                            }
                        }
                    ]
                }
            });

        case 'tools/call':
            if (params.name === 'hello') {
                const name = params.arguments?.name || 'Amigo';
                return res.json({
                    jsonrpc: '2.0',
                    id,
                    result: {
                        content: [
                            {
                                type: 'text',
                                text: `Hello, ${name}`
                            }
                        ]
                    }
                });
            }
            return res.status(404).json({
                jsonrpc: '2.0',
                id,
                error: { code: -32601, message: 'Tool not found' }
            });

        case 'notifications/initialized':
            console.log('[MCP] Cliente inicializado com sucesso.');
            return res.status(204).end();

        default:
            return res.status(404).json({
                jsonrpc: '2.0',
                id,
                error: { code: -32601, message: 'Method not found' }
            });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Servidor MCP rodando na porta ${PORT}`);
    console.log(`📍 Endpoint: http://localhost:${PORT}/mcp`);
    console.log(`🔑 Auth: Bearer ${AUTH_TOKEN}`);
    console.log(`\nPara testar (exemplo):`);
    console.log(`curl -X POST http://localhost:3030/mcp \\`);
    console.log(`  -H "Authorization: Bearer senha-facil-123" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'\n`);
});
