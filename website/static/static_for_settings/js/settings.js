$(function () {
    console.log("settings.js loaded");
    const BaseUrl = "https://labpal.com.ng/api";
    // const BaseUrl = "http://127.0.0.1:3000/api";

    if (!window.socket) {
        window.socket = io();
    }

    function getCookie(name) {
        let cookieArr = document.cookie.split("; ");
        for (let i = 0; i < cookieArr.length; i++) {
            let cookiePair = cookieArr[i].split("=");
            if (name === cookiePair[0]) {
                return decodeURIComponent(cookiePair[1]);
            }
        }
        return null;
    }

    const user_id = getCookie('user_id');
    const org_id = getCookie('org_id');
    let org_plan = getCookie('org_plan');
    const role = getCookie('role');
    console.log(user_id, org_id, org_plan, role);

    const session_id = getCookie('session_id');
    const url_customer_paystack = `${BaseUrl}/customer/${org_id}/`;
    const url_transaction_success_paystack = `${BaseUrl}/transactions/success/${org_id}/`;
    const url_transaction_all_paystack = `${BaseUrl}/transactions/${org_id}/`;
    const url_subscription = `${BaseUrl}/subscription/${org_id}`;
    console.log(url_subscription);

    if (org_plan) {
        org_plan = org_plan.replace(/^"(.*)"$/, '$1');
    }

    const plans = {
        "Basic monthly plan": "Basic_monthly_plan",
        "Basic annual plan": "Basic_annual_plan",
        "Premium monthly plan": "Premium_monthly_plan",
        "Premium annual plan": "Premium_annual_plan"
    };

    const planStack = plans[org_plan];
    console.log(planStack);

    if (role === "user") {
        $("#bill-btn").hide();
    }

    function koboToNaira(kobo) {
        return (kobo / 100).toFixed(2);
    }

    function formatMonth(dateString) {
        const date = new Date(dateString);
        const options = { month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }


    $(async function() {    
        function koboToNaira(kobo) {
            return (kobo / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
        }
    
        function formatMonth(dateString) {
            const date = new Date(dateString);
            const options = { month: 'long', year: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }
    
        function formatDate(dateString) {
            const date = new Date(dateString);
            const options = { day: '2-digit', month: 'long', year: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }
        
        // success transactions
        async function fetch_transact_success() {
            const url_transaction_success_paystack = `${BaseUrl}/transactions/success/${org_id}/`;
    
            try {
                const response = await fetch(url_transaction_success_paystack, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                const data = await response.json();
                console.log('Fetch request successful:', data);
    
                if (data.status) {
                    return data.transactionsSuccess;
                } else {
                    console.error('Error:', data.message);
                    return [];
                }
            } catch (error) {
                console.error('Fetch Error:', error);
                return [];
            }
        }

        const transact_success_data = await fetch_transact_success();
        console.log(transact_success_data);
    
        if (transact_success_data.length > 0) {
            const latestTransaction = transact_success_data[transact_success_data.length - 1];
    
            if (latestTransaction.amount && latestTransaction.created_at) {
                const createdMonth = formatMonth(latestTransaction.created_at);
                const amountInNaira = koboToNaira(latestTransaction.amount);
                $('#billing .card1 .h3').text(`${createdMonth} ${amountInNaira}`);
            } else {
                console.error('Failed to update card1: Missing amount or created_at');
            }
    
            if (latestTransaction.next_payment_date) {
                const nextPaymentDate = formatDate(latestTransaction.next_payment_date);
                $('#billing .card2 .h3').text(nextPaymentDate);
            } else {
                console.error('Failed to update card2: Missing next_payment_date');
            }
    
            if (latestTransaction.plan) {
                $('#billing .card3 .h3').text(latestTransaction.plan);
            } else {
                console.error('Failed to update card3: Missing plan in latest transaction');
            }
        } else {
            console.error('No transactions found');
        }

        // all transactions
        async function fetch_transact_all() {
            try {
                const response = await fetch(url_transaction_all_paystack, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                const data = await response.json();
                console.log('Fetch request successful:', data);
    
                if (data.status) {
                    return data.transactions;
                } else {
                    console.error('Error:', data.message);
                    return [];
                }
            } catch (error) {
                console.error('Fetch Error:', error);
                return [];
            }
        }

        const transactions = await fetch_transact_all();
        console.log(transactions);
    
        if (transactions.length > 0) {
            const tbody = $('#billing .table-billing-history tbody');
            tbody.empty(); // Clear any existing rows
    
            transactions.forEach(transaction => {
                const formattedDate = formatDate(transaction.created_at);
                const amountInNaira = koboToNaira(transaction.amount);
                const statusBadgeClass = transaction.status === 'success' ? 'bg-success' : 'bg-light text-dark';
                const statusText = transaction.status === 'success' ? 'Paid' : 'Pending';
    
                const row = `
                    <tr>
                        <td>${transaction["transaction ref"]}</td>
                        <td>${formattedDate}</td>
                        <td>${amountInNaira}</td>
                        <td><span class="badge ${statusBadgeClass}">${statusText}</span></td>
                    </tr>
                `;
    
                tbody.append(row);
            });
        } else {
            console.error('No transactions found');
        }
    });
    
    $('#yearlySwitch').click(function() {
        console.log("Yearly switch clicked");

        const planMapping = {
            "Basic_monthly_plan": "Basic_annual_plan",
            "Premium_monthly_plan": "Premium_annual_plan"
        };

        const NplanStack = planMapping[planStack];

        if (NplanStack) {
            subscribeToPlan(NplanStack);
        } else if (planStack === "Basic_annual_plan" || planStack === "Premium_annual_plan") {
            alert("You are already on the yearly plan");
        } else {
            console.error("Invalid planStack value:", planStack);
        }
    });

    $('#currentPlanUpgrade').click(function() {
        console.log("Upgrade clicked");
        if (planStack) {
            subscribeToPlan(planStack);
        } else {
            console.error("Invalid planStack value:", planStack);
        }
    });

    $('#upgrade-btn').click(function() {
        console.log("Upgrade clicked");
        $('#upgradeModal').modal('show');
    });

    $('#basic-btn').click(function() {
        subscribeToPlan('Basic_monthly_plan');
    });

    $('#premium-btn').click(function() {
        subscribeToPlan('Premium_monthly_plan');
    });

    function subscribeToPlan(planType) {
        fetch(url_subscription + '/' + planType + '/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetch request successful:', data);
            if (data.status) {
                const url = data.data.authorization_url; // Get the authorization URL from the response
                console.log('Redirecting to:', url);
                window.location.href = url; // Redirect the user to the authorization URL
            } else {
                console.error('Error:', data.message); // Log the error message if status is false
            }
        })
        .catch(error => {
            console.error('Fetch Error:', error); // Log any errors to the console
        });
    }
    
    $("#members").hide();
    $('#sec-btn').click(function() {
        console.log("Security clicked");
        $("#security").show();
        $("#notifications").hide();
        $("#billing").hide();
        $("#data").hide();
        $("#members").hide();
    });

    $('#not-btn').click(function() {
        $("#notifications").show();
        $("#billing").hide();
        $("#security").hide();
        $("#data").hide();
        $("#members").hide();
    });

    $('#data-btn').click(function() {
        $("#data").show();
        $("#billing").hide();
        $("#security").hide();
        $("#notifications").hide();
        $("#members").hide();
    });

    $('#bill-btn').click(function() {
        $("#billing").show();
        $("#notifications").hide();
        $("#security").hide();
        $("#data").hide();
        $("#members").hide();
    });
    $('#mem-btn').click(function() {
        $("#members").show();
        $("#notifications").hide();
        $("#security").hide();
        $("#data").hide();
        $("#billing").hide();
    });
});
