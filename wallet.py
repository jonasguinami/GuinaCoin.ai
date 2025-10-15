import binascii
from Crypto.PublicKey import ECC
from Crypto.Hash import SHA256
from Crypto.Signature import DSS

class Wallet:
    """
    Representa uma carteira de criptomoeda, com par de chaves e endereço.
    """
    def __init__(self, private_key_hex=None):
        if private_key_hex:
            self.private_key = ECC.import_key(binascii.unhexlify(private_key_hex))
        else:
            self.private_key = ECC.generate(curve='P-256')
        
        self.public_key = self.private_key.public_key()
        self.address = self.generate_address()

    def generate_address(self):
        """ Gera um endereço público a partir da chave pública. """
        public_key_pem = self.public_key.export_key(format='PEM')
        h = SHA256.new(public_key_pem.encode())
        return h.hexdigest()

    @property
    def private_key_hex(self):
        return self.private_key.export_key(format='PEM')

    @property
    def public_key_hex(self):
        return self.public_key.export_key(format='PEM')

    def sign(self, data):
        """ Assina os dados com a chave privada. """
        h = SHA256.new(str(data).encode())
        signer = DSS.new(self.private_key, 'fips-186-3')
        signature = signer.sign(h)
        return binascii.hexlify(signature).decode()

    @staticmethod
    def verify_signature(public_key_hex, signature_hex, data):
        """ Verifica a assinatura usando a chave pública. """
        try:
            public_key = ECC.import_key(public_key_hex)
            h = SHA256.new(str(data).encode())
            verifier = DSS.new(public_key, 'fips-186-3')
            verifier.verify(h, binascii.unhexlify(signature_hex))
            return True
        except (ValueError, TypeError):
            return False