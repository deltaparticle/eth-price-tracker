const connectWalletButton = document.getElementById('connectWallet');
const networkInfo = document.getElementById('network');
const accountInfo = document.getElementById('account');
const fetchDataButton = document.getElementById('fetchData');
const calculateButton = document.getElementById('calculate');
const analysisInfo = document.getElementById('analysis');

let historicalPrices = [];

const networkMapping = {
    'homestead': 'ethereum',
    'arbitrum': 'arbitrum',
    'polygon': 'matic-network',
    'matic': 'matic-network',
};

const timeFrameMapping = {
    '1': 1,
    '7': 7,
    '30': 30,
    '90': 90,
    '180': 180,
    '365': 365,
};

let currentNetwork;
let selectedTimeFrame;

connectWalletButton.addEventListener('click', async () => {
    try {
        if (!window.ethereum) {
            throw new Error('Please install MetaMask!');
        }

        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const accountAddress = accounts[0];
        console.log('Connected account:', accountAddress);
        accountInfo.innerText = `Account Address: ${accountAddress}`;

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        const networkName = network.name;
        currentNetwork = networkName;

        networkInfo.innerText = `Connected to ${networkName}`;
        
        document.getElementById('accountArea').classList.remove('hidden');
        document.getElementById('timeFrameArea').classList.remove('hidden');
        
    } catch (error) {
        console.error('Failed to connect wallet', error);
        networkInfo.innerText = 'Failed to connect wallet: ' + error.message;
    }
});

fetchDataButton.addEventListener('click', async () => {
    selectedTimeFrame = document.getElementById('timeframe').value;
    if (!currentNetwork) {
        alert("Please connect your wallet first.");
        return;
    }
    
    try {
        historicalPrices = await getCryptoPrice(currentNetwork, selectedTimeFrame);
        renderChart(historicalPrices, currentNetwork);
        
        document.getElementById('chartContainer').classList.remove('hidden');
        document.getElementById('investmentArea').classList.remove('hidden');
    } catch (error) {
        console.error(error);
    }
});

async function getCryptoPrice(networkName, days) {
    const coingeckoId = networkMapping[networkName];
    if (!coingeckoId) {
        throw new Error(`Network not supported: ${networkName}`);
    }

    const priceUrl = `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${days}`;
    const response = await fetch(priceUrl);
    
    if (!response.ok) {
        throw new Error('Failed to fetch price data: ' + response.statusText);
    }
    
    const data = await response.json();
    const prices = {};

    data.prices.forEach(pricePoint => {
        const timestamp = new Date(pricePoint[0]).toLocaleDateString();
        prices[timestamp] = pricePoint[1];
    });

    return prices;
}

let myChart;
function renderChart(priceData, networkName) {
    const ctx = document.getElementById('chart').getContext('2d');
    const labels = Object.keys(priceData);
    const prices = labels.map(label => priceData[label]);

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Price in USD (${networkName})`,
                data: prices,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                },
            },
        }
    });
}

calculateButton.addEventListener('click', () => {
    const balance = parseFloat(document.getElementById('accountBalance').value);
    
    if (isNaN(balance) || balance <= 0) {
        analysisInfo.innerText = 'Please enter a valid number for the amount you want to invest.';
        return;
    }

    const prices = Object.values(historicalPrices);
    if (prices.length === 0) {
        analysisInfo.innerText = 'No price data available. Please fetch data first.';
        return;
    }

    const initialInvestment = balance;
    const valueIfInvested = (balance / prices[0]) * prices[prices.length - 1];
    const change = valueIfInvested - initialInvestment;
    const growthPercentage = (change / initialInvestment) * 100;

    const volatility = calculateVolatility(prices);
    const riskLevel = assessRisk(volatility);

    analysisInfo.innerHTML = `
        <h3>Investment Analysis</h3>
        <p>Based on your investment of $${initialInvestment.toFixed(2)}:</p>
        <p>Initial Investment: $${initialInvestment.toFixed(2)}</p>
        <p>Value if Investment was Done ${timeFrameMapping[selectedTimeFrame] === 30 ? '1 Month' : timeFrameMapping[selectedTimeFrame] + ' Days'} Ago: $${valueIfInvested.toFixed(2)}</p>
        <p>Change: $${change.toFixed(2)} (${growthPercentage.toFixed(2)}%)</p>
        <p>Risk Level: ${riskLevel}</p>
    `;

    analysisInfo.classList.remove('hidden');
});

function calculateVolatility(prices) {
    const returns = [];
    
    for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    
    const meanReturn = returns.reduce((a, b) => a + b) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - meanReturn, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b) / squaredDiffs.length;

    return Math.sqrt(variance);
}

function assessRisk(volatility) {
    if (volatility < 0.01) {
        return 'Low';
    } else if (volatility < 0.05) {
        return 'Medium';
    } else {
        return 'High';
    }
}
