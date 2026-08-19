# NovaTech

Aplicação React mobile-first para e-commerce de brinquedos eletrônicos reciclados.

## Stack
- React 18
- Vite
- React Router
- Firebase Authentication
- Firestore
- Firebase Storage

## Estrutura
- `src/app.css` - interface mobile-first
- `src/components` - componentes reutilizáveis
- `src/contexts` - estado global de auth, produtos e carrinho
- `src/pages` - páginas e rotas
- `src/services` - integração com Firebase e fallback local
- `src/config/firebase.js` - configuração via variáveis de ambiente

## Variáveis de ambiente
Crie um arquivo `.env.local` ou `.env` com os valores do Firebase. No Vite, as variáveis precisam começar com `VITE_` para ficarem disponíveis no navegador.

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET= # necessário apenas para upload no Firebase Storage
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## Configuração do Firebase
1. Crie um projeto no Firebase.
2. Ative Authentication com o provedor Email/Senha.
3. Crie o Firestore em modo produção.
4. Ative Storage se quiser enviar imagens pelo painel admin.
5. Cole as credenciais no `.env.local` ou `.env` e reinicie o servidor Vite após alterar o arquivo.

## Firestore
Coleções preparadas:
- `users`
- `products`
- `orders`
- `cart`
- `contacts`

Exemplo de produto:

```json
{
  "name": "Nome do brinquedo",
  "description": "Descrição",
  "price": 49.9,
  "imageUrl": "...",
  "stock": 10,
  "category": "brinquedos-eletronicos-reciclados",
  "active": true,
  "featured": false,
  "createdAt": "..."
}
```

Exemplo de usuário:

```json
{
  "uid": "...",
  "name": "...",
  "email": "...",
  "role": "user"
}
```

Administrador:

```json
{
  "uid": "...",
  "name": "...",
  "email": "...",
  "role": "admin"
}
```

## Regras de segurança
As regras sugeridas estão em `firestore.rules` e `storage.rules`.

## Primeiro administrador
1. Cadastre a primeira conta normalmente.
2. No Firestore, abra `users/{uid}` dessa conta.
3. Altere `role` para `admin`.
4. Recarregue a aplicação e acesse `/admin`.

## Rodar localmente
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy na Vercel
1. Faça o push do projeto para um repositório Git.
2. Importe o repositório na Vercel.
3. Configure as variáveis de ambiente `VITE_FIREBASE_*`.
4. Use o comando de build `npm run build`.
5. Mantenha o `vercel.json` para SPA routing.

## Observação
O carrinho funciona localmente e a arquitetura já está preparada para sincronização futura com Firebase.