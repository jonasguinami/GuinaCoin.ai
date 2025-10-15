from flask import Flask, jsonify, render_template, request
from blockchain import Blockchain
from wallet import Wallet
import random

# Inicializa o aplicativo Flask
app = Flask(__name__)

# Instancia a Blockchain
blockchain = Blockchain()
# Endereço do "nó" de mineração
node_identifier = Wallet().address

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/wallet/create', methods=['GET'])
def create_wallet():
    """ Cria uma nova carteira e retorna suas chaves. """
    new_wallet = Wallet()
    response = {
        'private_key': new_wallet.private_key_hex,
        'public_key': new_wallet.public_key_hex,
        'address': new_wallet.address
    }
    return jsonify(response), 200

def calculate_relevance(prompt, response_text):
    """
    SIMULAÇÃO: Calcula a "relevância" dos dados de treinamento.
    Um algoritmo real seria muito mais complexo, envolvendo análise de similaridade,
    entropia da informação, etc. Aqui, usamos uma heurística simples.
    """
    score = 0
    # Recompensa por tamanho (evita dados muito curtos)
    score += len(prompt) * 0.05
    score += len(response_text) * 0.1
    
    # Recompensa por conter palavras-chave
    keywords = ['inteligência artificial', 'modelo', 'treinamento', 'python', 'dados', 'blockchain']
    text_combined = f"{prompt} {response_text}".lower()
    for word in keywords:
        if word in text_combined:
            score += 5
            
    # Adiciona um fator aleatório para simular variabilidade
    score += random.uniform(1, 10)
    
    # Normaliza o score para ser um valor de ATC (ex: entre 1 e 100)
    relevance_score = max(1, min(100, score))
    return relevance_score

@app.route('/api/submit_training', methods=['POST'])
def submit_training_data():
    """
    Recebe dados de treinamento, calcula relevância e recompensa o usuário.
    """
    values = request.get_json()
    required = ['user_address', 'prompt', 'response']
    if not all(k in values for k in required):
        return 'Dados ausentes', 400

    # 1. Calcular a relevância e a recompensa (em ATC)
    reward_amount = calculate_relevance(values['prompt'], values['response'])

    # 2. Criar a transação de recompensa para o usuário
    # O "remetente" é o sistema (0) para indicar uma nova moeda criada (coinbase)
    blockchain.add_transaction(
        sender="0",
        recipient=values['user_address'],
        amount=reward_amount
    )

    # 3. Minerar um novo bloco para confirmar a transação
    last_block = blockchain.last_block
    last_nonce = last_block['nonce']
    nonce = blockchain.proof_of_work(last_nonce)

    # Adiciona a recompensa de mineração para o nó
    blockchain.add_transaction(
        sender="0",
        recipient=node_identifier,
        amount=blockchain.miner_rewards
    )
    
    previous_hash = blockchain.hash(last_block)
    block = blockchain.create_new_block(nonce, previous_hash)

    response = {
        'message': 'Dados de treinamento recebidos com sucesso!',
        'block_index': block['index'],
        'reward_amount': reward_amount
    }
    return jsonify(response), 201

@app.route('/api/chain', methods=['GET'])
def get_chain():
    """ Retorna a blockchain completa. """
    response = {
        'chain': blockchain.chain,
        'length': len(blockchain.chain),
    }
    return jsonify(response), 200

@app.route('/api/balance/<address>', methods=['GET'])
def get_balance(address):
    """ Calcula e retorna o saldo de um endereço. """
    balance = 0
    for block in blockchain.chain:
        for tx in block['transactions']:
            if tx['recipient'] == address:
                balance += tx['amount']
            if tx['sender'] == address:
                balance -= tx['amount']
    
    return jsonify({'address': address, 'balance': balance}), 200

@app.route('/api/ranking', methods=['GET'])
def get_ranking():
    """ Retorna um ranking de contribuidores baseado nas recompensas. """
    contributors = {}
    for block in blockchain.chain:
        for tx in block['transactions']:
            # Consideramos apenas transações de recompensa (sender="0")
            if tx['sender'] == "0" and tx['recipient'] != node_identifier:
                recipient = tx['recipient']
                contributors[recipient] = contributors.get(recipient, 0) + tx['amount']
                
    # Ordena por valor (maior para menor)
    sorted_contributors = sorted(contributors.items(), key=lambda item: item[1], reverse=True)
    
    return jsonify(sorted_contributors), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)