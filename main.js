document.addEventListener('DOMContentLoaded', () => {
    const state = {
        wallet: { privateKey: null, publicKey: null, address: null }
    };

    // --- Navegação por Abas ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            views.forEach(view => view.classList.remove('active'));
            document.getElementById(button.dataset.view).classList.add('active');
        });
    });

    // --- LÓGICA DA WALLET ---
    const createWalletBtn = document.getElementById('create-wallet-btn');
    const walletInfoDiv = document.getElementById('wallet-info');
    const walletPlaceholder = document.getElementById('wallet-placeholder');
    const walletAddressP = document.getElementById('wallet-address');
    const walletPrivateKeyP = document.getElementById('wallet-private-key');
    const walletBalanceSpan = document.getElementById('wallet-balance');
    const refreshBalanceBtn = document.getElementById('refresh-balance-btn');
    
    const copyIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>`;
    const checkIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`;

    createWalletBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/wallet/create');
            if (!response.ok) throw new Error('Falha ao criar wallet');
            const data = await response.json();
            
            state.wallet = { privateKey: data.private_key, publicKey: data.public_key, address: data.address };
            updateWalletUI();
        } catch (error) {
            alert(error.message);
        }
    });

    refreshBalanceBtn.addEventListener('click', updateBalance);

    document.body.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-btn');
        if (copyBtn) {
            const targetId = copyBtn.dataset.target;
            const textToCopy = document.getElementById(targetId).textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyBtn.innerHTML = checkIconSVG;
                copyBtn.style.color = 'var(--success-color)';
                setTimeout(() => {
                    copyBtn.innerHTML = copyIconSVG;
                    copyBtn.style.color = '';
                }, 2000);
            });
        }
    });

    function updateWalletUI() {
        if (state.wallet.address) {
            walletAddressP.textContent = state.wallet.address;
            walletPrivateKeyP.textContent = state.wallet.privateKey;
            walletInfoDiv.classList.remove('hidden');
            walletPlaceholder.classList.add('hidden');
            document.querySelectorAll('.copy-btn').forEach(btn => btn.innerHTML = copyIconSVG);
            updateBalance();
        }
    }

    async function updateBalance() {
        if (!state.wallet.address) return;
        walletBalanceSpan.textContent = '...';
        try {
            const response = await fetch(`/api/balance/${state.wallet.address}`);
            const data = await response.json();
            walletBalanceSpan.textContent = data.balance.toFixed(2);
        } catch (error) {
            walletBalanceSpan.textContent = 'Erro';
        }
    }

    // --- LÓGICA DE TREINAMENTO ---
    const trainingForm = document.getElementById('training-form');
    const trainingStatusDiv = document.getElementById('training-status');

    trainingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!state.wallet.address) {
            showStatusMessage('Você precisa criar uma wallet primeiro na aba "Wallet"!', 'error');
            return;
        }

        const prompt = document.getElementById('prompt').value.trim();
        const responseText = document.getElementById('response').value.trim();
        if (!prompt || !responseText) {
            showStatusMessage('Os campos de prompt e resposta são obrigatórios.', 'error');
            return;
        }

        showStatusMessage('Enviando dados e minerando novo bloco...', 'info');
        
        try {
            const response = await fetch('/api/submit_training', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_address: state.wallet.address,
                    prompt: prompt,
                    response: responseText
                })
            });

            if (!response.ok) throw new Error(`Erro no servidor: ${response.statusText}`);
            
            const data = await response.json();
            showStatusMessage(`Sucesso! Bloco ${data.block_index} minerado. Você ganhou ${data.reward_amount.toFixed(2)} ATC.`, 'success');
            
            trainingForm.reset();
            updateBalance();
        } catch (error) {
            showStatusMessage(`Falha ao enviar dados: ${error.message}`, 'error');
        }
    });
    
    function showStatusMessage(message, type) {
        trainingStatusDiv.textContent = message;
        trainingStatusDiv.className = `status-message ${type}`;
    }

    // --- LÓGICA DA BLOCKCHAIN ---
    const refreshChainBtn = document.getElementById('refresh-chain-btn');
    const chainContainer = document.getElementById('chain-container');
    refreshChainBtn.addEventListener('click', fetchAndDisplayBlockchain);

    async function fetchAndDisplayBlockchain() {
        chainContainer.innerHTML = '<div class="spinner"></div>';
        try {
            const response = await fetch('/api/chain');
            const data = await response.json();
            renderBlockchain(data.chain);
        } catch (error) {
            chainContainer.innerHTML = `<p class="status-message error">Falha ao buscar a blockchain.</p>`;
        }
    }
    
    function renderBlockchain(chain) {
        chainContainer.innerHTML = '';
        if (chain.length === 0) {
            chainContainer.innerHTML = '<p>A blockchain está vazia.</p>';
            return;
        }
        chain.slice().reverse().forEach(block => {
            const blockEl = document.createElement('div');
            blockEl.className = 'block';
            
            let transactionsHTML = '<h4>Transações</h4>';
            if (block.transactions.length === 0) {
                transactionsHTML += '<p>Nenhuma transação neste bloco.</p>';
            } else {
                block.transactions.forEach(tx => {
                    const senderDisplay = tx.sender === "0" 
                        ? `<span class="coinbase">RECOMPENSA DO SISTEMA</span>` 
                        : `<span class="tx-from" title="${tx.sender}">...${tx.sender.slice(-12)}</span>`;
                    
                    transactionsHTML += `
                        <div class="transaction">
                            <div class="transaction-details">
                                ${senderDisplay}
                                <span class="tx-arrow">→</span>
                                <span class="tx-to" title="${tx.recipient}">...${tx.recipient.slice(-12)}</span>
                                <span class="tx-amount">+${tx.amount.toFixed(2)} ATC</span>
                            </div>
                        </div>`;
                });
            }
            
            blockEl.innerHTML = `
                <div class="block-header">
                    <span class="block-index">Bloco #${block.index}</span>
                </div>
                <div class="block-hash">
                    <span>Hash Anterior:</span> ${block.previous_hash}
                </div>
                ${transactionsHTML}`;
            chainContainer.appendChild(blockEl);
        });
    }

    // --- LÓGICA DO RANKING ---
    const refreshRankingBtn = document.getElementById('refresh-ranking-btn');
    const rankingTableBody = document.querySelector('#ranking-table tbody');
    refreshRankingBtn.addEventListener('click', fetchAndDisplayRanking);

    async function fetchAndDisplayRanking() {
        rankingTableBody.innerHTML = `<tr><td colspan="3"><div class="spinner"></div></td></tr>`;
        try {
            const response = await fetch('/api/ranking');
            const data = await response.json();
            renderRanking(data);
        } catch (error) {
            rankingTableBody.innerHTML = `<tr><td colspan="3" class="status-message error" style="text-align: center;">Falha ao buscar o ranking.</td></tr>`;
        }
    }

    function renderRanking(rankingData) {
        rankingTableBody.innerHTML = '';
        if (rankingData.length === 0) {
            rankingTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center;">Nenhum contribuidor ainda. Seja o primeiro!</td></tr>`;
            return;
        }
        rankingData.forEach((entry, index) => {
            const [address, amount] = entry;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${address}</td>
                <td>${amount.toFixed(2)} ATC</td>`;
            rankingTableBody.appendChild(row);
        });
    }
    
    // --- Carregamento Inicial ---
    fetchAndDisplayBlockchain();
    fetchAndDisplayRanking();
});