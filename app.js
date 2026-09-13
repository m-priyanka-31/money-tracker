// ==========================================
// MONEY TRACKER
// ==========================================

const SUPABASE_URL =
    "https://toqgjgfjfwmojyxbhnma.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_AX6Lhg3YyfRveJ77wSwIZw_4P7dd8xz";


// Create Supabase client

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

console.log("Supabase connected successfully!");


// ==========================================
// START DASHBOARD
// ==========================================

async function startDashboard() {

    console.log("Starting dashboard...");


    // Get logged-in user

    const {
        data: { user },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError) {

        console.error(
            "User error:",
            userError
        );

        return;
    }


    // If nobody is logged in

    if (!user) {

        window.location.href =
            "auth.html";

        return;
    }


    console.log(
        "Logged in user:",
        user.email
    );


    // ==========================================
    // GET ELEMENTS
    // ==========================================

    const form =
        document.getElementById(
            "transactionForm"
        );

    const transactionList =
        document.getElementById(
            "transactionList"
        );

    const totalIncome =
        document.getElementById(
            "totalIncome"
        );

    const totalExpenses =
        document.getElementById(
            "totalExpenses"
        );

    const balance =
        document.getElementById(
            "balance"
        );

    const savings =
        document.getElementById(
            "savings"
        );

    const dateInput =
        document.getElementById(
            "date"
        );


    if (!form) {

        console.error(
            "Transaction form not found!"
        );

        return;
    }


    // ==========================================
    // SET TODAY'S DATE
    // ==========================================

    if (dateInput) {

        dateInput.value =
            new Date()
                .toISOString()
                .split("T")[0];

    }


    // ==========================================
    // LOAD TRANSACTIONS
    // ==========================================

    async function loadTransactions() {

        console.log(
            "Loading transactions..."
        );


        const {
            data: transactions,
            error
        } =
            await supabaseClient
                .from("transactions")
                .select("*")
                .eq("user_id", user.id)
                .order("date", {
                    ascending: false
                });


        if (error) {

            console.error(
                "Loading error:",
                error
            );


            if (transactionList) {

                transactionList.innerHTML =
                    "<p>Unable to load transactions.</p>";

            }

            return;
        }


        console.log(
            "Transactions:",
            transactions
        );


        // ======================================
        // CALCULATE MONEY
        // ======================================

        let income = 0;

        let expenses = 0;

        let savedMoney = 0;


        transactions.forEach(
            function(transaction) {

                const amount =
                    Number(transaction.amount) || 0;


                // Income

                if (
                    transaction.type ===
                    "income"
                ) {

                    income += amount;

                }


                // Normal expense

                else if (
                    transaction.type ===
                    "expense"
                ) {

                    expenses += amount;

                }


                // Savings

                else if (
                    transaction.type ===
                    "savings"
                ) {

                    savedMoney += amount;

                }

            }
        );


        // Available balance

        const availableBalance =
            income -
            expenses -
            savedMoney;


        // ======================================
        // UPDATE CARDS
        // ======================================

        if (totalIncome) {

            totalIncome.textContent =
                "₹" +
                income.toLocaleString(
                    "en-IN"
                );

        }


        if (totalExpenses) {

            totalExpenses.textContent =
                "₹" +
                expenses.toLocaleString(
                    "en-IN"
                );

        }


        if (balance) {

            balance.textContent =
                "₹" +
                availableBalance.toLocaleString(
                    "en-IN"
                );

        }


        if (savings) {

            savings.textContent =
                "₹" +
                savedMoney.toLocaleString(
                    "en-IN"
                );

        }


        // ======================================
        // SHOW TRANSACTIONS
        // ======================================

        if (!transactionList) {

            return;
        }


        if (
            !transactions ||
            transactions.length === 0
        ) {

            transactionList.innerHTML =
                "<p>No transactions yet.</p>";

            return;
        }


        transactionList.innerHTML = "";


        transactions.forEach(
            function(transaction) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.style.padding =
                    "15px 0";

                item.style.borderBottom =
                    "1px solid #eee";


                const amount =
                    Number(
                        transaction.amount
                    ) || 0;


                const amountText =
                    "₹" +
                    amount.toLocaleString(
                        "en-IN"
                    );


                let typeText;


                if (
                    transaction.type ===
                    "income"
                ) {

                    typeText =
                        "Income";

                }

                else if (
                    transaction.type ===
                    "savings"
                ) {

                    typeText =
                        "Savings";

                }

                else {

                    typeText =
                        "Expense";

                }


                const dateText =
                    transaction.date
                        ? new Date(
                            transaction.date +
                            "T00:00:00"
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "";


                item.innerHTML = `

                    <strong>
                        ${typeText}
                    </strong>

                    <span>
                        — ${amountText}
                    </span>

                    <br>

                    <span>
                        ${transaction.category || ""}
                    </span>

                    <br>

                    <small>
                        ${transaction.description || ""}
                    </small>

                    <br>

                    <small>
                        ${dateText}

                        ${
                            transaction.payment_method
                                ? " • " +
                                  transaction.payment_method
                                : ""
                        }

                    </small>

                `;


                transactionList.appendChild(
                    item
                );

            }
        );

    }


    // ==========================================
    // LOAD EXISTING DATA
    // ==========================================

    await loadTransactions();


    // ==========================================
    // ADD TRANSACTION
    // ==========================================

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const type =
                document.getElementById(
                    "type"
                ).value;


            const amount =
                document.getElementById(
                    "amount"
                ).value;


            const category =
                document.getElementById(
                    "category"
                ).value;


            const description =
                document.getElementById(
                    "description"
                ).value;


            const date =
                document.getElementById(
                    "date"
                ).value;


            const paymentMethod =
                document.getElementById(
                    "payment_method"
                ).value;


            // Validate amount

            if (
                !amount ||
                Number(amount) <= 0
            ) {

                alert(
                    "Please enter a valid amount."
                );

                return;
            }


            // Validate date

            if (!date) {

                alert(
                    "Please select a date."
                );

                return;
            }


            console.log(
                "Saving transaction..."
            );


            // Save transaction

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("transactions")
                    .insert({

                        user_id:
                            user.id,

                        type:
                            type,

                        amount:
                            Number(amount),

                        category:
                            category,

                        description:
                            description || null,

                        date:
                            date,

                        payment_method:
                            paymentMethod

                    })
                    .select();


            if (error) {

                console.error(
                    "Transaction error:",
                    error
                );


                alert(
                    "Transaction could not be saved:\n\n" +
                    error.message
                );


                return;
            }


            console.log(
                "Transaction saved:",
                data
            );


            alert(
                "Transaction added successfully! 💰"
            );


            // Clear form

            form.reset();


            // Reset today's date

            if (dateInput) {

                dateInput.value =
                    new Date()
                        .toISOString()
                        .split("T")[0];

            }


            // Refresh dashboard

            await loadTransactions();

        }
    );


    // ==========================================
    // LOGOUT
    // ==========================================

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async function() {

                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .signOut();


                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );


                    alert(
                        "Logout failed: " +
                        error.message
                    );

                    return;
                }


                window.location.href =
                    "auth.html";

            }
        );

    }

}


// ==========================================
// RUN
// ==========================================

startDashboard();