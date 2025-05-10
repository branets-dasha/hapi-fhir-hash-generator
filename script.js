let resultIndex = 0;

function computeInputHash() {
    resultIndex = (resultIndex + 1) % 1000;

    const input = document.getElementById("inputValue").value;
    const hashes = computeHash(input);

    const tableBody = document.querySelector(".result tbody");

    const newResultRow = document.createElement("tr");
    newResultRow.innerHTML = `
        <td id="value${resultIndex}">${input}</td>
        <td><button class="clipboard" onclick="copyToClipboard('value${resultIndex}')" aria-label="Copy value"></button></td>
        <td id="hash${resultIndex}">${hashes.hapiHash}</td>
        <td><button class="clipboard" onclick="copyToClipboard('hash${resultIndex}')" aria-label="Copy HAPI hash"></button></td>
    `;
    tableBody.insertBefore(newResultRow, tableBody.firstChild);

    while (tableBody.rows.length > 10) {
        tableBody.deleteRow(-1);
    }
}

function computeHash(value) {
    const murmurHash = murmurHash3.x64.hash128(value);

    const first16Hex = murmurHash.slice(0, 16);
    let hapiHash;
    const big = BigInt('0x' + first16Hex);
    const MAX_SIGNED_64 = BigInt("0x7FFFFFFFFFFFFFFF");
    if (big > MAX_SIGNED_64) {
        hapiHash = big - BigInt("0x10000000000000000");
    } else {
        hapiHash = big;
    }

    return { murmurHash, hapiHash: hapiHash.toString() };
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text);
}

function onInputValueKeyPressed(event) {
    if (event.key === "Enter") {
        computeInputHash();
    }
};
