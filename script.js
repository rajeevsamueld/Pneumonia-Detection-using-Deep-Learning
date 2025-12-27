document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const uploadForm = document.getElementById('uploadForm');
    const predictBtn = document.getElementById('predictBtn');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const resultSection = document.getElementById('resultSection');
    const resultText = document.getElementById('resultText');
    const confidenceText = document.getElementById('confidenceText');
    const resultBox = document.getElementById('resultBox');
    const refreshHistory = document.getElementById('refreshHistory');
    const historyList = document.getElementById('historyList');

    // File input change handler
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            fileName.textContent = e.target.files[0].name;
            
            // Show preview
            const reader = new FileReader();
            reader.onload = function(event) {
                imagePreview.src = event.target.result;
                previewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(e.target.files[0]);
            
            // Hide previous results
            resultSection.classList.add('hidden');
        }
    });

    // Form submission handler
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please select an image first');
            return;
        }
        
        predictBtn.disabled = true;
        predictBtn.textContent = 'Processing...';
        
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Display results
            resultText.textContent = `Result: ${data.prediction}`;
            confidenceText.textContent = `Confidence: ${data.confidence}%`;
            
            // Style based on result
            resultBox.className = '';
            resultBox.classList.add(data.prediction.toLowerCase() + '-result');
            
            resultSection.classList.remove('hidden');
            
            // Refresh history
            loadHistory();
        })
        .catch(error => {
            alert('Error: ' + error.message);
            console.error('Error:', error);
        })
        .finally(() => {
            predictBtn.disabled = false;
            predictBtn.textContent = 'Predict';
        });
    });

    // History refresh button
    refreshHistory.addEventListener('click', function(e) {
        e.preventDefault();
        loadHistory();
    });

    // Load prediction history
    function loadHistory() {
        fetch('/history')
        .then(response => response.json())
        .then(data => {
            historyList.innerHTML = '';
            
            if (data.length === 0) {
                historyList.innerHTML = '<p>No prediction history found</p>';
                return;
            }
            
            data.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                historyItem.innerHTML = `
                    <img src="${item.image_url}" alt="${item.filename}" class="history-image">
                    <div class="history-details">
                        <span class="history-prediction ${item.prediction.toLowerCase()}">
                            ${item.prediction}
                        </span>
                        <span class="history-confidence">(${item.confidence}%)</span>
                        <div class="history-timestamp">
                            ${new Date(item.timestamp).toLocaleString()}
                        </div>
                    </div>
                `;
                
                historyList.appendChild(historyItem);
            });
        })
        .catch(error => {
            console.error('Error loading history:', error);
        });
    }

    // Load initial history
    loadHistory();
});