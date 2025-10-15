import hashlib
import json
from time import time
from uuid import uuid4

class Blockchain:
    def __init__(self):
        self.chain = []
        self.pending_transactions = []
        self.difficulty = 2  # Dificuldade do Proof of Work
        self.miner_rewards = 10 # Recompensa por minerar
        self.create_genesis_block()

    def create_genesis_block(self):
        """ Cria o primeiro bloco da cadeia (bloco Gênesis). """
        self.create_new_block(previous_hash='0', nonce=1)

    def create_new_block(self, nonce, previous_hash):
        """
        Cria um novo bloco e o adiciona à cadeia.
        """
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time(),
            'transactions': self.pending_transactions,
            'nonce': nonce,
            'previous_hash': previous_hash or self.hash(self.chain[-1]),
        }
        self.pending_transactions = []
        self.chain.append(block)
        return block

    @staticmethod
    def hash(block):
        """ Gera o hash SHA-256 de um bloco. """
        block_string = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

    @property
    def last_block(self):
        return self.chain[-1]

    def add_transaction(self, sender, recipient, amount):
        """ Adiciona uma nova transação à lista de transações pendentes. """
        self.pending_transactions.append({
            'sender': sender,
            'recipient': recipient,
            'amount': amount
        })
        return self.last_block['index'] + 1

    def proof_of_work(self, last_nonce):
        """
        Algoritmo de Prova de Trabalho (Proof of Work):
         - Encontra um número (nonce) que, quando hasheado com o nonce anterior,
           produz um hash com N zeros à esquerda.
        """
        nonce = 0
        while self.valid_proof(last_nonce, nonce) is False:
            nonce += 1
        return nonce

    def valid_proof(self, last_nonce, nonce):
        """ Valida a prova: o hash contém N zeros à esquerda? """
        guess = f'{last_nonce}{nonce}'.encode()
        guess_hash = hashlib.sha256(guess).hexdigest()
        return guess_hash[:self.difficulty] == '0' * self.difficulty