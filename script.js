const debouncedComputeInputHash = debounce(computeInputHash, 300);
const debouncedComputeTrfHashes = debounce(computeTrfHashes, 300);

function computeInputHash() {
    const input = document.getElementById("inputValue").value;
    const hashes = computeHash(input);

    document.getElementById("value").textContent = input;
    document.getElementById("valueHash").textContent = hashes.hapiHash;
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

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function computeTrfHashes() {
    const trfNumber = document.getElementById("trfNumber").value;

    const searchValueTemplates = {
        "OBO": "Observation|based-on.identifier|TRF_NUMBER|",
        "SR": "ServiceRequest|identifier|TRF_NUMBER|",
        "CP": "CarePlan|identifier|TRF_NUMBER|",
        "DR": "DeviceRequest|identifier|TRF_NUMBER|",
        "IR": "ImmunizationRecommendation|identifier|TRF_NUMBER|",
        "MR": "MedicationRequest|identifier|TRF_NUMBER|",
        "NO": "NutritionOrder|identifier|TRF_NUMBER|",
    };

    for (const key in searchValueTemplates) {
        const searchValue = searchValueTemplates[key].replace("TRF_NUMBER", trfNumber);
        const hashes = computeHash(searchValue);

        document.getElementById(`trfSearchValue${key}`).textContent = searchValue;
        document.getElementById(`trfSearchHash${key}`).textContent = hashes.hapiHash;
    }
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text);
}
