# Projeto Blockchain para Treinamento de IA (AI Training Coin - ATC)

Este é um projeto completo que simula uma plataforma baseada em blockchain para o treinamento de modelos de Inteligência Artificial. Os usuários contribuem com dados de treinamento (pares de prompt/resposta) e são recompensados com uma criptomoeda nativa, a ATC, com base na relevância de sua contribuição.

## Funcionalidades

- **Blockchain Funcional**: Sistema simulado com blocos, hashing, transações e mineração baseada em Proof-of-Work.
- **Sistema de Recompensa Inteligente**: Um algoritmo (simulado) avalia a "relevância" dos dados enviados e calcula uma recompensa em ATC.
- **Gerenciamento de Wallet**: Crie, importe e visualize sua carteira de ATC, incluindo chaves pública/privada e saldo.
- **Interface Web Completa**: Uma interface de usuário intuitiva com 4 seções principais:
    1.  **Treinamento**: Para submeter novos dados de treinamento.
    2.  **Wallet**: Para gerenciar sua carteira.
    3.  **Blockchain**: Um explorador para visualizar todos os blocos e transações na cadeia.
    4.  **Ranking**: Um placar com os maiores contribuidores da rede.
- **Backend em Flask**: Um servidor leve e robusto em Python para gerenciar toda a lógica.
- **Frontend Interativo**: Interface construída com HTML, CSS e JavaScript vanilla para interagir com o backend.

## Estrutura de Arquivos

/ai_blockchain_project/
|-- models/
|   |-- Phi-3-mini-4k-instruct-q4.gguf  (coloque seu modelo aqui)
|-- static/
|   |-- css/style.css
|   |-- js/main.js
|-- templates/
|   |-- index.html
|-- app.py
|-- blockchain.py
|-- wallet.py
|-- requirements.txt
|-- README.md


## Como Executar o Projeto

### Pré-requisitos

- Python 3.7+
- pip (gerenciador de pacotes do Python)

### 1. Crie o Ambiente e Instale as Dependências

Navegue até a pasta raiz do projeto (`ai_blockchain_project`) e execute os seguintes comandos:

```bash
# Crie um ambiente virtual (recomendado)
python -m venv venv

# Ative o ambiente virtual
# No Windows:
venv\Scripts\activate
# No macOS/Linux:
source venv/bin/activate

# Instale as bibliotecas necessárias
pip install -r requirements.txt


### Como Usar a Plataforma

1.  **Vá para a aba "Wallet"** e clique em "Criar Nova Wallet". Suas chaves serão geradas e exibidas.
2.  **Vá para a aba "Treinamento"**. Preencha os campos "Prompt" e "Resposta do Modelo".
3.  **Clique em "Enviar e Minerar"**. O sistema irá processar seus dados, calcular sua recompensa, criar a transação e minerar um novo bloco para confirmá-la.
4.  **Explore a "Blockchain"** para ver o novo bloco e sua transação de recompensa.
5.  **Confira seu saldo na "Wallet"** e sua posição no "Ranking".