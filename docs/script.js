document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('doc-date').value = today;
    
    // Color picker functionality
    const colorPicker = document.getElementById('primary-color');
    const colorPreview = document.getElementById('color-preview');
    const colorValue = document.getElementById('color-value');
    
    colorPicker.addEventListener('input', function() {
        const color = this.value;
        colorPreview.style.backgroundColor = color;
        colorValue.textContent = color;
        document.documentElement.style.setProperty('--primary-color', color);
        document.documentElement.style.setProperty('--light-bg', lightenColor(color, 0.9));
        
        // Update header color
        document.querySelector('header').style.backgroundColor = color;
        
        // Update button colors
        document.querySelectorAll('.btn-generate, .add-benefit').forEach(btn => {
            btn.style.backgroundColor = color;
        });
    });
    
    // Document type selection
    const docOptions = document.querySelectorAll('.doc-option');
    docOptions.forEach(option => {
        option.addEventListener('click', function() {
            docOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Update document number placeholder based on selection
            const docType = this.dataset.type;
            const docNumberInput = document.getElementById('doc-number');
            if (docType === 'invoice') {
                docNumberInput.placeholder = 'e.g., ORG/INV/2025/001';
            } else {
                docNumberInput.placeholder = 'e.g., ORG/RCPT/2025/001';
            }
        });
    });
    
    // Benefits list management
    document.getElementById('add-benefit').addEventListener('click', function() {
        const benefitsList = document.getElementById('benefits-list');
        const newBenefit = document.createElement('div');
        newBenefit.className = 'benefit-item';
        newBenefit.innerHTML = `
            <input type="text" class="benefit-input" placeholder="Benefit or feature">
            <button type="button" class="remove-benefit">×</button>
        `;
        benefitsList.appendChild(newBenefit);
        
        // Add event listener to the new remove button
        newBenefit.querySelector('.remove-benefit').addEventListener('click', function() {
            benefitsList.removeChild(newBenefit);
        });
    });
    
    // Add event listeners to existing remove buttons
    document.querySelectorAll('.remove-benefit').forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });
    
    // Generate document button
    document.getElementById('generate-btn').addEventListener('click', generateDocument);
    
    // Reset form button
    document.querySelector('.btn-reset').addEventListener('click', function() {
        document.getElementById('preview-container').innerHTML = `
            <div class="preview-placeholder">
                <i>📄</i>
                <h3>No document generated yet</h3>
                <p>Fill out the form and click "Generate Document" to see a preview</p>
            </div>
        `;
        document.getElementById('print-btn').disabled = true;
        document.getElementById('printable-document').style.display = 'none';
    });
    
    // Print button
    document.getElementById('print-btn').addEventListener('click', function() {
        // Show the printable document
        document.getElementById('printable-document').style.display = 'block';
        
        // Wait a moment for the display change then print
        setTimeout(function() {
            window.print();
            
            // Hide the printable document after printing
            setTimeout(function() {
                document.getElementById('printable-document').style.display = 'none';
            }, 500);
        }, 100);
    });
    
    function generateDocument() {
        // Get form values
        const orgName = document.getElementById('org-name').value;
        const orgDetails = document.getElementById('org-details').value;
        const primaryColor = document.getElementById('primary-color').value;
        const docType = document.querySelector('.doc-option.active').dataset.type;
        const docNumber = document.getElementById('doc-number').value;
        const docDate = new Date(document.getElementById('doc-date').value).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const itemCategory = document.getElementById('item-category').value;
        const itemTier = document.getElementById('item-tier').value;
        const amount = parseFloat(document.getElementById('amount').value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        const companyName = document.getElementById('company-name').value;
        const attention = document.getElementById('attention').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const postalCode = document.getElementById('postal-code').value;
        const itemName = document.getElementById('item-name').value;
        const description = document.getElementById('description').value;
        
        // Get benefits
        const benefits = [];
        document.querySelectorAll('.benefit-input').forEach(input => {
            if (input.value.trim() !== '') {
                benefits.push(input.value.trim());
            }
        });
        
        // Validate form
        if (!docNumber || !itemCategory || !itemTier || !amount || !companyName || !address || !city || !postalCode || !itemName) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Generate the document HTML based on type
        let documentHTML = '';
        
        if (docType === 'invoice') {
            documentHTML = generateInvoiceHTML(
                orgName, orgDetails, primaryColor,
                docNumber, docDate, itemCategory, itemTier, amount, 
                companyName, attention, address, city, postalCode, 
                itemName, description, benefits
            );
        } else {
            documentHTML = generateReceiptHTML(
                orgName, orgDetails, primaryColor,
                docNumber, docDate, itemCategory, itemTier, amount, 
                companyName, attention, address, city, postalCode, 
                itemName, description, benefits
            );
        }
        
        // Display the document in the preview container
        document.getElementById('preview-container').innerHTML = documentHTML;
        
        // Also set the printable document content
        document.getElementById('printable-document').innerHTML = documentHTML;
        
        // Enable print button
        document.getElementById('print-btn').disabled = false;
    }
    
    function generateInvoiceHTML(orgName, orgDetails, primaryColor,
                                docNumber, docDate, itemCategory, itemTier, amount, 
                                companyName, attention, address, city, postalCode, 
                                itemName, description, benefits) {
        const lightBg = lightenColor(primaryColor, 0.9);
        
        return `
            <div class="invoice-container" style="width: 100%; background: white; padding: 20px; box-sizing: border-box;">
                <!-- Header Section -->
                <div class="header" style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 30px;">
                    <div class="organization-info" style="flex: 2;">
                        <div class="organization-name" style="font-size: 24px; font-weight: 700; color: ${primaryColor}; margin-bottom: 5px;">${orgName}</div>
                        <div class="organization-details" style="font-size: 14px; color: #555; line-height: 1.5; white-space: pre-line;">${orgDetails}</div>
                    </div>
                    <div class="invoice-title" style="flex: 1; text-align: right;">
                        <h1 style="font-size: 32px; color: ${primaryColor}; margin: 0; font-weight: 700;">INVOICE</h1>
                    </div>
                </div>
                
                <!-- Invoice Details -->
                <div class="invoice-details" style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                    <div class="invoice-meta" style="flex: 1;">
                        <div class="section-title" style="font-size: 16px; font-weight: 600; color: ${primaryColor}; margin-bottom: 10px; border-bottom: 1px solid #eaeaea; padding-bottom: 5px;">Invoice Details</div>
                        <div class="detail-row" style="display: flex; margin-bottom: 8px;">
                            <div class="detail-label" style="font-weight: 600; width: 140px;">Invoice Number:</div>
                            <div class="detail-value">${docNumber}</div>
                        </div>
                        <div class="detail-row" style="display: flex; margin-bottom: 8px;">
                            <div class="detail-label" style="font-weight: 600; width: 140px;">Date of Issue:</div>
                            <div class="detail-value">${docDate}</div>
                        </div>
                        <div class="detail-row" style="display: flex; margin-bottom: 8px;">
                            <div class="detail-label" style="font-weight: 600; width: 140px;">Category:</div>
                            <div class="detail-value">${itemCategory}</div>
                        </div>
                        <div class="detail-row" style="display: flex; margin-bottom: 8px;">
                            <div class="detail-label" style="font-weight: 600; width: 140px;">Tier/Type:</div>
                            <div class="detail-value">${itemTier}</div>
                        </div>
                    </div>
                    <div class="bill-to" style="flex: 1;">
                        <div class="section-title" style="font-size: 16px; font-weight: 600; color: ${primaryColor}; margin-bottom: 10px; border-bottom: 1px solid #eaeaea; padding-bottom: 5px;">Bill To</div>
                        <div class="bill-to-details" style="display: flex; flex-direction: column;">
                            <div class="bill-to-row" style="margin-bottom: 8px;">${companyName}</div>
                            ${attention ? `<div class="bill-to-row" style="margin-bottom: 8px;">${attention}</div>` : ''}
                            <div class="bill-to-row" style="margin-bottom: 8px;">${address}</div>
                            <div class="bill-to-row" style="margin-bottom: 8px;">${city}, ${postalCode}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Items Table -->
                <table class="items-table" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                    <thead>
                        <tr>
                            <th class="description-cell" style="background-color: ${primaryColor}; color: white; text-align: left; padding: 12px 15px; font-weight: 600; width: 95%;">Description</th>
                            <th class="amount-cell" style="background-color: ${primaryColor}; color: white; text-align: left; padding: 12px 15px; font-weight: 600; width: 5%; text-align: right;">Amount (LKR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="description-cell" style="padding: 12px 15px; border-bottom: 1px solid #eee;">
                                <strong>${itemTier} - ${itemName}</strong><br>
                                <em>${description ? description : `As per ${itemCategory.toLowerCase()} agreement.`}</em>
                                ${benefits.length > 0 ? `
                                <ul>
                                    ${benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                                </ul>
                                ` : ''}
                            </td>
                            <td class="amount-cell" style="padding: 12px 15px; border-bottom: 1px solid #eee; text-align: right;">${amount}</td>
                        </tr>
                        <tr class="total-row" style="font-weight: 700; background-color: ${lightBg};">
                            <td class="description-cell" style="padding: 12px 15px; border-top: 2px solid ${primaryColor}; border-bottom: none;">Total Amount Due</td>
                            <td class="amount-cell" style="padding: 12px 15px; border-top: 2px solid ${primaryColor}; border-bottom: none; text-align: right;">${amount} LKR</td>
                        </tr>
                    </tbody>
                </table>
                
                <!-- Notes Section -->
                <div class="notes-section" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eaeaea;">
                    <div class="notes-title" style="font-weight: 600; color: ${primaryColor}; margin-bottom: 10px;">Payment Instructions & Notes:</div>
                    <div class="notes-content" style="font-size: 14px; line-height: 1.5; color: #555;">
                        This invoice is a formal request for payment. Please process this invoice according to your standard accounts payable procedures.<br><br>
                        For any queries regarding this invoice, please contact the organization using the details provided above.<br><br>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="footer" style="margin-top: auto; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eaeaea; padding-top: 15px; padding-bottom: 10px;">
                    This is a computer-generated invoice and does not require a physical signature.<br>
                </div>
            </div>
        `;
    }
    
    function generateReceiptHTML(orgName, orgDetails, primaryColor,
                                docNumber, docDate, itemCategory, itemTier, amount, 
                                companyName, attention, address, city, postalCode, 
                                itemName, description, benefits) {
        const lightBg = lightenColor(primaryColor, 0.9);
        
        return `
            <div class="receipt-container" style="width: 100%; background: white; padding: 20px; box-sizing: border-box;">
                <!-- Header Section -->
                <div class="header" style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 25px;">
                    <div class="organization-info" style="flex: 2;">
                        <div class="organization-name" style="font-size: 24px; font-weight: 700; color: ${primaryColor}; margin-bottom: 5px;">${orgName}</div>
                        <div class="organization-details" style="font-size: 14px; color: #555; line-height: 1.5; white-space: pre-line;">${orgDetails}</div>
                    </div>
                    <div class="receipt-title" style="flex: 1; text-align: right;">
                        <h1 style="font-size: 32px; color: ${primaryColor}; margin: 0; font-weight: 700;">PAYMENT RECEIPT</h1>
                    </div>
                </div>
                
                <!-- Receipt Details -->
                <div class="receipt-details" style="display: flex; justify-content: space-between; margin-bottom: 25px;">
                    <div class="receipt-meta" style="flex: 1;">
                        <div class="section-title" style="font-size: 16px; font-weight: 600; color: ${primaryColor}; margin-bottom: 10px; border-bottom: 1px solid #eaeaea; padding-bottom: 5px;">Receipt Details</div>
                        <div class="detail-row" style="display: flex; margin-bottom: 6px;">
                            <div class="detail-label" style="font-weight: 600; width: 140px; font-size: 14px;">Receipt Number:</div>
                            <div class="detail-value" style="font-size: 14px;">${docNumber}</div>
                        </div>
                        <div class="detail-row" style="display: flex; margin-bottom: 6px;">
                            <div class="detail-label" style="font-weight: 600; width: 140px; font-size: 14px;">Date of Receipt:</div>
                            <div class="detail-value" style="font-size: 14px;">${docDate}</div>
                        </div>
                        <div class="detail-row" style="display: flex; margin-bottom: 6px;">
                            <div class="detail-label" style="font-weight: 600; width: 140px; font-size: 14px;">Category:</div>
                            <div class="detail-value" style="font-size: 14px;">${itemCategory}</div>
                        </div>
                        <div class="detail-row" style="display: flex; margin-bottom: 6px;">
                            <div class="detail-label" style="font-weight: 600; width: 140px; font-size: 14px;">Original Invoice:</div>
                            <div class="detail-value" style="font-size: 14px;">${docNumber.replace('RCPT', 'INV')}</div>
                        </div>
                    </div>
                    <div class="received-from" style="flex: 1;">
                        <div class="section-title" style="font-size: 16px; font-weight: 600; color: ${primaryColor}; margin-bottom: 10px; border-bottom: 1px solid #eaeaea; padding-bottom: 5px;">Received From</div>
                        <div class="received-from-details" style="display: flex; flex-direction: column;">
                            <div class="received-from-row" style="margin-bottom: 6px; font-size: 14px;">${companyName}</div>
                            ${attention ? `<div class="received-from-row" style="margin-bottom: 6px; font-size: 14px;">${attention}</div>` : ''}
                            <div class="received-from-row" style="margin-bottom: 6px; font-size: 14px;">${address}</div>
                            <div class="received-from-row" style="margin-bottom: 6px; font-size: 14px;">${city}, ${postalCode}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Payment Status -->
                <div class="status-badge" style="background-color: #e8f5e8; color: #2e7d32; padding: 8px 15px; border-radius: 4px; font-weight: 600; text-align: center; border: 1px solid #4caf50; font-size: 14px; margin-bottom: 20px;">
                    PAYMENT RECEIVED
                </div>
                
                <!-- Payment Details - Compact Corporate Boxes -->
                <div class="payment-summary" style="display: flex; justify-content: space-between; margin: 20px 0; gap: 15px;">
                    <div class="payment-box" style="flex: 1; border: 1px solid ${primaryColor}; border-radius: 4px; padding: 15px; background: ${lightBg};">
                        <div class="payment-box-title" style="font-size: 14px; font-weight: 600; color: ${primaryColor}; margin-bottom: 8px; text-align: center;">Payment Amount</div>
                        <div class="payment-amount" style="font-size: 20px; font-weight: 700; color: ${primaryColor}; text-align: center; margin: 5px 0;">${amount} LKR</div>
                    </div>
                    // Uncomment to add payment method box in future
                    /*
                    <div class="payment-box" style="flex: 1; border: 1px solid ${primaryColor}; border-radius: 4px; padding: 15px; background: ${lightBg};">
                        <div class="payment-box-title" style="font-size: 14px; font-weight: 600; color: ${primaryColor}; margin-bottom: 8px; text-align: center;">Payment Method</div>
                        <div class="payment-detail" style="font-size: 13px; text-align: center; margin: 3px 0;">Bank Transfer</div>
                        <div class="payment-detail" style="font-size: 13px; text-align: center; margin: 3px 0;">Ref: TRX${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}</div>
                    </div>
                    */
                    <div class="payment-box" style="flex: 1; border: 1px solid ${primaryColor}; border-radius: 4px; padding: 15px; background: ${lightBg};">
                        <div class="payment-box-title" style="font-size: 14px; font-weight: 600; color: ${primaryColor}; margin-bottom: 8px; text-align: center;">Payment Details</div>
                        <div class="payment-detail" style="font-size: 13px; text-align: center; margin: 3px 0;">Date: ${docDate}</div>
                        <div class="payment-detail" style="font-size: 13px; text-align: center; margin: 3px 0;">Status: Completed</div>
                    </div>
                </div>
                
                <!-- Items Table -->
                <table class="items-table" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr>
                            <th class="description-cell" style="background-color: ${primaryColor}; color: white; text-align: left; padding: 10px 12px; font-weight: 600; font-size: 14px; width: 70%;">Description</th>
                            <th class="amount-cell" style="background-color: ${primaryColor}; color: white; text-align: left; padding: 10px 12px; font-weight: 600; font-size: 14px; width: 30%; text-align: right;">Amount (LKR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="description-cell" style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px;">
                                <strong>${itemTier}</strong><br>
                                ${itemName}<br>
                                ${description ? description : ''}
                                ${benefits.length > 0 ? `
                                <ul>
                                    ${benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                                </ul>
                                ` : ''}
                                Full payment as per invoice ${docNumber.replace('RCPT', 'INV')}
                            </td>
                            <td class="amount-cell" style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: right;">${amount}</td>
                        </tr>
                        <tr class="total-row" style="font-weight: 700; background-color: ${lightBg};">
                            <td class="description-cell" style="padding: 10px 12px; border-top: 2px solid ${primaryColor}; border-bottom: none;">Total Amount Received</td>
                            <td class="amount-cell" style="padding: 10px 12px; border-top: 2px solid ${primaryColor}; border-bottom: none; text-align: right;">${amount} LKR</td>
                        </tr>
                    </tbody>
                </table>
                
                <!-- Notes Section -->
                <div class="notes-section" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eaeaea;">
                    <div class="notes-title" style="font-weight: 600; color: ${primaryColor}; margin-bottom: 8px; font-size: 15px;">Acknowledgement & Notes:</div>
                    <div class="notes-content" style="font-size: 13px; line-height: 1.5; color: #555;">
                        This receipt serves as official confirmation that we have received the full payment.<br>
                        We sincerely thank you for your business.<br>
                        For any queries regarding this receipt, please contact the organization using the details provided above.
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="footer" style="margin-top: auto; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #eaeaea; padding-top: 12px; padding-bottom: 5px;">
                    This is an official payment receipt from ${orgName}.<br>
                    Generated on: ${docDate}
                </div>
            </div>
        `;
    }
    
    // Helper function to lighten a color
    function lightenColor(color, factor) {
        // Convert hex to RGB
        let r = parseInt(color.substr(1, 2), 16);
        let g = parseInt(color.substr(3, 2), 16);
        let b = parseInt(color.substr(5, 2), 16);
        
        // Lighten the color
        r = Math.min(255, Math.floor(r + (255 - r) * factor));
        g = Math.min(255, Math.floor(g + (255 - g) * factor));
        b = Math.min(255, Math.floor(b + (255 - b) * factor));
        
        // Convert back to hex
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
});
