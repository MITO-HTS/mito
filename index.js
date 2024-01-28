function fetchTokenHoldersCount(url = `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/0.0.4569720/balances?limit=10000`, count = 0) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
            // Count only holders with a balance greater than zero
            const validHolders = data.balances.filter(holder => parseInt(holder.balance, 10) > 0).length;
            count += validHolders;
            console.log(count)

            // Check if there's a link to the next page
            if (data.links && data.links.next) {
                const nextUrl = `https://mainnet-public.mirrornode.hedera.com${data.links.next}`;
                fetchTokenHoldersCount(nextUrl, count);
            } else {
                updateHolderCountUI(count);
            }
        })
        .catch(error => {
            console.error('Error fetching token holders:', error);
        });
}


fetchTokenHoldersCount()

function updateHolderCountUI(count) {
    const holderCountElement = document.getElementById('holder-count');
    if (holderCountElement) {
        holderCountElement.textContent = `Total Hosts: ${count}`;
    }
}



function interpolateColor(startColor, endColor, factor) {
    if (arguments.length < 3) { 
        factor = 0.5; 
    }
    const result = startColor.slice();
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (endColor[i] - startColor[i]));
    }
    return result;
};

function calculateGradientColors(data, startColor, endColor) {
    const sortedBalances = [...data].sort((a, b) => a.balance - b.balance);
    return sortedBalances.map((account, index, array) => {
        const factor = index / (array.length - 1);
        const color = interpolateColor(startColor, endColor, factor);
        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    });
}

function fetchTokenBalances(tokenId, url = `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${tokenId}/balances?limit=10000`, balances = []) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Adjust each balance by dividing by 10 and filter out holders with a balance of zero
            const newBalances = data.balances
                .map(holder => ({ ...holder, balance: holder.balance / 100 }))
                .filter(holder => holder.balance > 0);
            balances.push(...newBalances);

            // Check if there's a link to the next page
            if (data.links && data.links.next) {
                const nextUrl = `https://mainnet-public.mirrornode.hedera.com${data.links.next}`;
                fetchTokenBalances(tokenId, nextUrl, balances);
            } else {
                createChart(balances); // Call function to create the chart
            }
        })
        .catch(error => {
            console.error('Error fetching token balances:', error);
        });
}


function createChart(data) {
    // Prepare data for the chart
    const labels = data.map(account => account.account);
    const balancesDEC = data.map(account => account.balance);
    const balances = balancesDEC;
    const backgroundColors = calculateGradientColors(data, [255, 192, 203], [0, 128, 0]); // Pink to Green

    const ctx = document.getElementById('tokenDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Token Distribution',
                data: balances,
                backgroundColor: backgroundColors,
                borderWidth: 0.5,
                borderColor: "#000",
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top', // or 'bottom', 'left', 'right' depending on your layout
                    labels: {
                        padding: 10 // Adjust this value for more or less padding
                    }
                }
            }}
    });
}

// Example usage
fetchTokenBalances('0.0.4569720');
