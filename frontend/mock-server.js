// Servidor FALSO só para testar o login no navegador.
// Rode com: node mock-server.js
// Usuário de teste: maria / senha: 123456

import http from 'node:http';

const PORT = 3001;
const USUARIO_TESTE = { name: 'maria', password: '123456' };

const server = http.createServer((req, res) => {
  // Libera o front-end (localhost:5173) para chamar este servidor
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/api/user/login') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      let dados = {};
      try {
        dados = JSON.parse(body);
      } catch {}

      console.log('Tentativa de login:', dados.name);

      if (dados.name === USUARIO_TESTE.name && dados.password === USUARIO_TESTE.password) {
        res.writeHead(200);
        return res.end(JSON.stringify({ token: 'token-falso-123' }));
      }

      res.writeHead(401);
      res.end(JSON.stringify({ message: 'Usuário ou senha incorretos.' }));
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ message: 'Rota não encontrada.' }));
});

server.listen(PORT, () => {
  console.log(`Servidor de teste rodando em http://localhost:${PORT}`);
});
