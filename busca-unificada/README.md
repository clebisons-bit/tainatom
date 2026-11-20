# Busca unificada: AtoM + Tainacan (protótipo)

Uma página de busca que consulta ao mesmo tempo:
- **Fundos documentais:** AtoM, via OAI-PMH (https://textual.museudigital.fm.usp.br)
- **Objetos:** Tainacan, via API REST. Sem `TAINACAN_URL`, mostra objetos de exemplo.

## Rodar no seu computador
```
npm install
npm run dev
```
Abra http://localhost:3000

## Publicar
1. Crie um repositório no GitHub e envie estes arquivos.
2. No Vercel: **Add New > Project**, escolha o repositório e clique em **Deploy**.
3. Quando o Tainacan estiver no ar: em **Settings > Environment Variables**, crie `TAINACAN_URL` com o endereço dele (ex.: https://acervo.exemplo.br) e faça um novo deploy.

## Limites conhecidos
- Os títulos dos fundos vêm provisórios (o OAI do AtoM ainda não entrega `dc:title`).
- A busca no lado do AtoM filtra os registros já coletados. Com milhares de registros, o próximo passo é importá-los para o Tainacan.
