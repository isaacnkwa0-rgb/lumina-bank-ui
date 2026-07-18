export type Language = "EN" | "ES" | "FR" | "PT" | "DE";

export type TranslationKey =
  // ── NAV / HEADER ──
  | "nav.logOn"
  | "nav.logOnFull"
  | "nav.openMenu"
  // ── MENU LINKS ──
  | "menu.currentAccounts"
  | "menu.savings"
  | "menu.creditCards"
  | "menu.loans"
  | "menu.mortgages"
  | "menu.investments"
  | "menu.international"
  | "menu.insurance"
  | "menu.helpSupport"
  // ── HERO SECTION ──
  | "hero.heading"
  | "hero.body"
  | "hero.applyNow"
  | "hero.disclaimer"
  | "hero.viewTerms"
  | "hero.offerMayBeWithdrawn"
  // ── PREMIER CARD ──
  | "premier.heading"
  | "premier.body"
  | "premier.link"
  // ── BUY MANAGE CARD ──
  | "buyManage.heading"
  | "buyManage.body"
  | "buyManage.link"
  // ── PRODUCTS LIST ──
  | "products.currentAccounts"
  | "products.savingsAccounts"
  | "products.creditCards"
  | "products.loans"
  | "products.mortgages"
  | "products.investments"
  | "products.internationalBanking"
  | "products.insurance"
  // ── HELP SECTION ──
  | "help.heading"
  | "help.body"
  | "help.digitalReset"
  | "help.managingAccount"
  // ── GROWING MONEY ──
  | "growMoney.heading"
  | "growMoney.body"
  | "growMoney.link"
  // ── SMALL BUSINESS ──
  | "smallBiz.heading"
  | "smallBiz.body"
  | "smallBiz.link"
  // ── WHY LUMINA ──
  | "whyLumina.heading"
  | "whyLumina.reason1"
  | "whyLumina.reason2"
  | "whyLumina.reason3"
  | "whyLumina.reason4"
  | "whyLumina.learnMore"
  // ── DISCOVER ──
  | "discover.heading"
  // ── SECURITY ──
  | "security.heading"
  | "security.body"
  | "security.link"
  // ── INVESTING ──
  | "investing.tag"
  | "investing.heading"
  | "investing.body"
  | "investing.link"
  // ── CARDS ──
  | "cards.heading"
  | "cards.body"
  | "cards.featured"
  | "cards.cardName"
  | "cards.cardBody"
  | "cards.applyNow"
  // ── QUESTIONS ──
  | "questions.heading"
  | "questions.placeholder"
  | "questions.topQuestions"
  | "questions.displaying"
  | "questions.showMore"
  // FAQ questions
  | "faq.q1" | "faq.a1"
  | "faq.q2" | "faq.a2"
  | "faq.q3" | "faq.a3"
  | "faq.q4" | "faq.a4"
  | "faq.q5" | "faq.a5"
  | "faq.q6" | "faq.a6"
  | "faq.q7" | "faq.a7"
  | "faq.q8" | "faq.a8"
  | "faq.q9" | "faq.a9"
  | "faq.q10" | "faq.a10"
  // ── FSCS ──
  | "fscs.body"
  // ── FOOTER ──
  | "footer.banking"
  | "footer.company"
  | "footer.currentAccounts"
  | "footer.savings"
  | "footer.creditCards"
  | "footer.mortgages"
  | "footer.loans"
  | "footer.investments"
  | "footer.international"
  | "footer.aboutLumina"
  | "footer.helpFaqs"
  | "footer.securityCentre"
  | "footer.careers"
  | "footer.privacyPolicy"
  | "footer.termsOfUse"
  | "footer.complaints"
  | "footer.legal1"
  | "footer.legal2"
  | "footer.copyright"
  // ── DASHBOARD ──
  | "dashboard.totalBalance"
  | "dashboard.hello"
  | "dashboard.across"
  | "dashboard.account"
  | "dashboard.accounts"
  | "dashboard.quickAction.send"
  | "dashboard.quickAction.pay"
  | "dashboard.quickAction.topUp"
  | "dashboard.quickAction.more"
  | "dashboard.yourAccounts"
  | "dashboard.viewAll"
  | "dashboard.recentTransactions"
  | "dashboard.noTransactions"
  | "dashboard.savingsGoals"
  | "dashboard.target"
  // ── PROFILE ──
  | "profile.language"
  | "profile.selectLanguage"
  | "profile.languageHint"
  // ── LANGUAGE NAMES ──
  | "lang.EN" | "lang.ES" | "lang.FR" | "lang.PT" | "lang.DE"
  // ── AUTH ──
  | "auth.login.heading" | "auth.login.subheading"
  | "auth.login.emailLabel" | "auth.login.passwordLabel"
  | "auth.login.submit" | "auth.login.forgotPassword"
  | "auth.login.newUser" | "auth.login.register"
  | "auth.login.securityTitle" | "auth.login.securityBody"
  | "auth.login.invalidCredentials"
  | "auth.register.heading" | "auth.register.subheading"
  | "auth.register.firstName" | "auth.register.lastName"
  | "auth.register.gender" | "auth.register.genderOptional"
  | "auth.register.genderMale" | "auth.register.genderFemale" | "auth.register.genderOther"
  | "auth.register.email" | "auth.register.phone"
  | "auth.register.password" | "auth.register.passwordHint"
  | "auth.register.confirmPassword" | "auth.register.submit"
  | "auth.register.alreadyHaveAccount" | "auth.register.logOn"
  | "auth.register.gdprNotice" | "auth.register.failed"
  | "auth.forgot.heading" | "auth.forgot.subheading"
  | "auth.forgot.emailLabel" | "auth.forgot.submit" | "auth.forgot.backToLogin"
  | "auth.forgot.successHeading" | "auth.forgot.successBody"
  | "auth.verify.heading" | "auth.verify.body"
  | "auth.verify.resend" | "auth.verify.backToLogin"
  | "auth.verify.verifying" | "auth.verify.success" | "auth.verify.successBody"
  | "auth.verify.tokenExpired"
  | "auth.reset.heading" | "auth.reset.newPassword" | "auth.reset.confirmPassword"
  | "auth.reset.submit" | "auth.reset.tokenMissing"
  | "auth.reset.success" | "auth.reset.successBody"
  // ── ACCOUNTS PAGE ──
  | "accounts.myAccounts" | "accounts.openAccount" | "accounts.totalBalance"
  | "accounts.available" | "accounts.noAccounts" | "accounts.noAccountsDesc"
  | "accounts.openNew"
  | "accounts.savings" | "accounts.savingsDesc"
  | "accounts.business" | "accounts.businessDesc"
  | "accounts.fixedDeposit" | "accounts.fixedDepositDesc"
  | "accounts.current" | "accounts.currentDesc"
  | "accounts.opening" | "accounts.open"
  | "accounts.opened" | "accounts.openedDesc" | "accounts.done"
  | "accounts.couldNotLoad" | "accounts.couldNotOpen"
  // ── CARDS PAGE ──
  | "cards.myCards" | "cards.totalCards" | "cards.active" | "cards.frozen"
  | "cards.noCards" | "cards.noCardsDesc"
  | "cards.spendingLimits" | "cards.daily" | "cards.monthly" | "cards.perTxn"
  | "cards.controls" | "cards.online" | "cards.contactless"
  | "cards.international" | "cards.atm"
  | "cards.freeze" | "cards.unfreeze" | "cards.details"
  | "cards.blockedMessage" | "cards.couldNotLoad" | "cards.couldNotUpdate"
  | "cards.statusActive" | "cards.statusFrozen" | "cards.statusBlocked"
  // ── TRANSACTIONS PAGE ──
  | "transactions.title" | "transactions.loaded"
  | "transactions.credits" | "transactions.debits"
  | "transactions.all" | "transactions.debit" | "transactions.credit"
  | "transactions.filters" | "transactions.clearFilters"
  | "transactions.category" | "transactions.from" | "transactions.to"
  | "transactions.noTransactions" | "transactions.noTransactionsDesc"
  | "transactions.loadMore" | "transactions.export" | "transactions.refresh"
  | "transactions.couldNotLoad";

export type Translations = Record<TranslationKey, string>;
export type TranslationMap = Record<Language, Translations>;

const translations: TranslationMap = {
  EN: {
    // Nav
    "nav.logOn": "Log on",
    "nav.logOnFull": "Log on to Online Banking",
    "nav.openMenu": "Open menu",
    // Menu links
    "menu.currentAccounts": "Current accounts",
    "menu.savings": "Savings",
    "menu.creditCards": "Credit cards",
    "menu.loans": "Loans",
    "menu.mortgages": "Mortgages",
    "menu.investments": "Investments",
    "menu.international": "International",
    "menu.insurance": "Insurance",
    "menu.helpSupport": "Help & support",
    // Hero
    "hero.heading": "Your next credit card?",
    "hero.body":
      "Get £25 cashback when you spend or transfer a balance of £500 or more with a Balance Transfer or Purchase Plus card. Offer ends 10 August 2026. Representative 24.9% APR (variable). Credit is subject to status. T&Cs apply.",
    "hero.applyNow": "Apply now",
    "hero.disclaimer":
      "Available to new and existing customers. Offer and eligibility criteria apply.",
    "hero.viewTerms": "View offer terms and conditions",
    "hero.offerMayBeWithdrawn": "Offer may be withdrawn at any time.",
    // Premier
    "premier.heading": "Join Lumina Premier today",
    "premier.body":
      "Lumina Premier is our premium account that gives you more than banking with wealth, health and travel benefits, and rewards too. Eligibility criteria and T&Cs apply.",
    "premier.link": "Premier Bank Account",
    // Buy & manage
    "buyManage.heading": "Buy and manage funds online",
    "buyManage.body":
      "It's now even easier for Lumina UK current account customers to manage, buy and sell investments online. Capital at risk. Fees apply.",
    "buyManage.link": "Learn more",
    // Products
    "products.currentAccounts": "Current accounts",
    "products.savingsAccounts": "Savings accounts",
    "products.creditCards": "Credit cards",
    "products.loans": "Loans",
    "products.mortgages": "Mortgages",
    "products.investments": "Investments",
    "products.internationalBanking": "International banking",
    "products.insurance": "Insurance",
    // Help
    "help.heading": "Looking for help?",
    "help.body": "Find answers to your questions and get the latest guidance.",
    "help.digitalReset": "Digital reset",
    "help.managingAccount": "Managing your account",
    // Growing money
    "growMoney.heading": "Growing your money",
    "growMoney.body":
      "Explore ways you could make the most of your money to help reach your goals.",
    "growMoney.link": "Stocks & shares ISA",
    // Small business
    "smallBiz.heading": "Lumina Small Business Banking Account",
    "smallBiz.body":
      "We're here to support your business all the way, that's why there's no monthly account fee and free UK digital banking.",
    "smallBiz.link": "Small Business Banking Account",
    // Why Lumina
    "whyLumina.heading": "Why bank with Lumina?",
    "whyLumina.reason1":
      "With one of the UK's most accessible banking networks, we're easy to find.",
    "whyLumina.reason2":
      "Meet with us for advice on selecting the right account for you, building your savings, managing debt or investing in your future.",
    "whyLumina.reason3":
      "Have foreign cash delivered free to your home or your nearest Lumina Banking Centre.",
    "whyLumina.reason4":
      "Send money to over 120 countries using Lumina Global Money Transfer and pay no transfer fee.",
    "whyLumina.learnMore": "Learn about more ways to bank",
    // Discover
    "discover.heading": "Discover other ways we can help you",
    // Security
    "security.heading": "Your security, our priority",
    "security.body":
      "We use advanced encryption and multi-factor authentication to keep your account and money safe at all times.",
    "security.link": "Learn about security",
    // Investing
    "investing.tag": "Investing",
    "investing.heading": "Trade smarter, not harder",
    "investing.body":
      "Open a Lumina Investor's Edge account and access stocks, ETFs, and more with no commission on eligible trades.",
    "investing.link": "Learn more",
    // Cards
    "cards.heading": "Cards designed for you",
    "cards.body":
      "Whether you're spending at home or abroad, our range of Visa cards puts you in control — with cashback, travel perks, and zero foreign fees.",
    "cards.featured": "Featured",
    "cards.cardName": "Lumina Business\nVisa Signature",
    "cards.cardBody":
      "No foreign transaction fees, unlimited cashback, and premium travel benefits worldwide. Built for business, designed for life.",
    "cards.applyNow": "Apply now",
    // Questions
    "questions.heading": "Questions?",
    "questions.placeholder": "Enter your question",
    "questions.topQuestions": "Top questions",
    "questions.displaying": "Displaying {visible} out of {total} question(s)",
    "questions.showMore": "Show more questions",
    // FAQ
    "faq.q1": "How do I open a Lumina Bank account?",
    "faq.a1":
      "You can open an account online in minutes. Click 'Open an account' on our homepage, complete the form, and verify your identity. Your account will be ready within 24 hours.",
    "faq.q2": "What is a pending transaction?",
    "faq.a2":
      "A pending transaction is a payment that has been authorised but not yet fully processed. It temporarily reduces your available balance until the payment is settled, usually within 1–3 working days.",
    "faq.q3": "How do I make a credit card payment?",
    "faq.a3":
      "Log on to Online Banking, go to Cards, select your credit card and choose 'Make a payment'. You can pay the minimum amount, full balance, or a custom amount from any linked account.",
    "faq.q4": "How do I transfer money to another account?",
    "faq.a4":
      "Go to Transfer & Pay in the app or Online Banking. Choose Internal Transfer for your own accounts or Domestic Transfer for other UK banks. International transfers are also supported.",
    "faq.q5": "How do I freeze or unfreeze my card?",
    "faq.a5":
      "Go to Cards in Online Banking or the app, select the card you want to manage and tap 'Freeze card'. You can unfreeze it at any time using the same option.",
    "faq.q6": "What are the daily transfer limits?",
    "faq.a6":
      "Standard current account limits are £10,000 per day for domestic transfers and £25,000 for international transfers. Lumina Premier customers benefit from higher limits.",
    "faq.q7": "How do I dispute a transaction?",
    "faq.a7":
      "If you see a transaction you don't recognise, go to Transactions, select the item and tap 'Dispute this transaction'. Our team will investigate and respond within 5 working days.",
    "faq.q8": "What is the difference between available and current balance?",
    "faq.a8":
      "Your current balance is the total funds in your account. Your available balance is what you can actually spend — it excludes any pending transactions or holds on your account.",
    "faq.q9": "How do I update my personal details?",
    "faq.a9":
      "Log on to Online Banking, go to Profile and select the detail you wish to update. Some changes such as address updates may require identity verification.",
    "faq.q10": "How do I apply for a loan?",
    "faq.a10":
      "Go to Loans in Online Banking and check your eligibility. If eligible, you can apply online and receive a decision instantly. Funds are typically transferred within one working day.",
    // FSCS
    "fscs.body":
      "Lumina Bank is a member of the Financial Services Compensation Scheme (FSCS).",
    // Footer
    "footer.banking": "Banking",
    "footer.company": "Company",
    "footer.currentAccounts": "Current accounts",
    "footer.savings": "Savings",
    "footer.creditCards": "Credit cards",
    "footer.mortgages": "Mortgages",
    "footer.loans": "Loans",
    "footer.investments": "Investments",
    "footer.international": "International",
    "footer.aboutLumina": "About Lumina",
    "footer.helpFaqs": "Help & FAQs",
    "footer.securityCentre": "Security centre",
    "footer.careers": "Careers",
    "footer.privacyPolicy": "Privacy policy",
    "footer.termsOfUse": "Terms of use",
    "footer.complaints": "Complaints",
    "footer.legal1":
      "Lumina Bank is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority. Financial Services Register number: 123456.",
    "footer.legal2":
      "Eligible deposits are protected up to £85,000 per person by the Financial Services Compensation Scheme (FSCS). This website is designed for use in the United Kingdom.",
    "footer.copyright": "© Lumina Group 2025–2026. All rights reserved.",
    // Dashboard
    "dashboard.totalBalance": "Total balance",
    "dashboard.hello": "Hello, {name}",
    "dashboard.across": "Across {count} account",
    "dashboard.account": "account",
    "dashboard.accounts": "accounts",
    "dashboard.quickAction.send": "Send",
    "dashboard.quickAction.pay": "Pay",
    "dashboard.quickAction.topUp": "Top Up",
    "dashboard.quickAction.more": "More",
    "dashboard.yourAccounts": "Your accounts",
    "dashboard.viewAll": "View all",
    "dashboard.recentTransactions": "Recent transactions",
    "dashboard.noTransactions": "No recent transactions",
    "dashboard.savingsGoals": "Savings goals",
    "dashboard.target": "Target:",
    // Profile
    "profile.language": "Language",
    "profile.selectLanguage": "Select language",
    "profile.languageHint": "Your preferred language for the Lumina app",
    // Language names
    "lang.EN": "English",
    "lang.ES": "Spanish",
    "lang.FR": "French",
    "lang.PT": "Portuguese",
    "lang.DE": "German",
    // Auth — Login
    "auth.login.heading": "Log on to Online Banking",
    "auth.login.subheading": "Enter your email and password to access your account.",
    "auth.login.emailLabel": "Email address",
    "auth.login.passwordLabel": "Password",
    "auth.login.submit": "Log on",
    "auth.login.forgotPassword": "Forgotten your details?",
    "auth.login.newUser": "New to Lumina Bank?",
    "auth.login.register": "Register",
    "auth.login.securityTitle": "Security notice: ",
    "auth.login.securityBody": "Lumina Bank will never ask for your full password. Always ensure you are on the correct website before logging on.",
    "auth.login.invalidCredentials": "Invalid credentials. Please try again.",
    // Auth — Register
    "auth.register.heading": "Create your account",
    "auth.register.subheading": "Join Lumina Bank — takes less than 5 minutes.",
    "auth.register.firstName": "First name",
    "auth.register.lastName": "Last name",
    "auth.register.gender": "Gender",
    "auth.register.genderOptional": "(optional)",
    "auth.register.genderMale": "Male",
    "auth.register.genderFemale": "Female",
    "auth.register.genderOther": "Prefer not to say",
    "auth.register.email": "Email address",
    "auth.register.phone": "Phone number",
    "auth.register.password": "Password",
    "auth.register.passwordHint": "Minimum 8 characters",
    "auth.register.confirmPassword": "Confirm password",
    "auth.register.submit": "Register",
    "auth.register.alreadyHaveAccount": "Already have an account?",
    "auth.register.logOn": "Log on",
    "auth.register.gdprNotice": "By registering, you agree to our Terms & Conditions and Privacy Policy. Your data is protected under UK GDPR.",
    "auth.register.failed": "Registration failed. Please try again.",
    // Auth — Forgot password
    "auth.forgot.heading": "Forgotten your details?",
    "auth.forgot.subheading": "Enter your registered email address and we'll send you a link to reset your password.",
    "auth.forgot.emailLabel": "Email address",
    "auth.forgot.submit": "Send reset link",
    "auth.forgot.backToLogin": "Back to log on",
    "auth.forgot.successHeading": "Check your email",
    "auth.forgot.successBody": "If an account exists with that email, we've sent a password reset link. Check your inbox.",
    // Auth — Verify email
    "auth.verify.heading": "Verify your email",
    "auth.verify.body": "We've sent a verification link to {email}. Please check your inbox and click the link to activate your account.",
    "auth.verify.resend": "Resend email",
    "auth.verify.backToLogin": "Back to log on",
    "auth.verify.verifying": "Verifying…",
    "auth.verify.success": "Email verified!",
    "auth.verify.successBody": "Your account has been verified. You can now log on.",
    "auth.verify.tokenExpired": "This link has expired. Please request a new one.",
    // Auth — Reset password
    "auth.reset.heading": "Reset your password",
    "auth.reset.newPassword": "New password",
    "auth.reset.confirmPassword": "Confirm new password",
    "auth.reset.submit": "Reset password",
    "auth.reset.tokenMissing": "Invalid or missing reset token.",
    "auth.reset.success": "Password reset successfully.",
    "auth.reset.successBody": "Your password has been updated. You can now log on with your new password.",
    // Accounts page
    "accounts.myAccounts": "My Accounts",
    "accounts.openAccount": "Open Account",
    "accounts.totalBalance": "Total balance",
    "accounts.available": "available",
    "accounts.noAccounts": "No accounts found",
    "accounts.noAccountsDesc": "Your accounts will appear here once set up.",
    "accounts.openNew": "Open a new account",
    "accounts.savings": "Savings Account",
    "accounts.savingsDesc": "Earn interest on your savings with easy access.",
    "accounts.business": "Business Account",
    "accounts.businessDesc": "Dedicated account for business transactions.",
    "accounts.fixedDeposit": "Fixed Deposit",
    "accounts.fixedDepositDesc": "Lock in a higher rate for a set term.",
    "accounts.current": "Current Account",
    "accounts.currentDesc": "Everyday spending and direct debits.",
    "accounts.opening": "Opening account…",
    "accounts.open": "Open account",
    "accounts.opened": "Account opened!",
    "accounts.openedDesc": "Your {label} has been created successfully.",
    "accounts.done": "Done",
    "accounts.couldNotLoad": "Could not load accounts.",
    "accounts.couldNotOpen": "Could not open account. Please try again.",
    // Cards page
    "cards.myCards": "My Cards",
    "cards.totalCards": "Total cards",
    "cards.active": "Active",
    "cards.frozen": "Frozen",
    "cards.noCards": "No cards found",
    "cards.noCardsDesc": "Your debit and credit cards will appear here.",
    "cards.spendingLimits": "Spending limits",
    "cards.daily": "Daily",
    "cards.monthly": "Monthly",
    "cards.perTxn": "Per txn",
    "cards.controls": "Card controls",
    "cards.online": "Online payments",
    "cards.contactless": "Contactless",
    "cards.international": "International",
    "cards.atm": "ATM withdrawals",
    "cards.freeze": "Freeze",
    "cards.unfreeze": "Unfreeze",
    "cards.details": "Details",
    "cards.blockedMessage": "This card is blocked. Please contact customer support.",
    "cards.couldNotLoad": "Could not load cards.",
    "cards.couldNotUpdate": "Could not update card status. Please try again.",
    "cards.statusActive": "Active",
    "cards.statusFrozen": "Frozen",
    "cards.statusBlocked": "Blocked",
    // Transactions page
    "transactions.title": "Transactions",
    "transactions.loaded": "Loaded",
    "transactions.credits": "Credits",
    "transactions.debits": "Debits",
    "transactions.all": "all",
    "transactions.debit": "debit",
    "transactions.credit": "credit",
    "transactions.filters": "Filters",
    "transactions.clearFilters": "Clear all filters",
    "transactions.category": "Category",
    "transactions.from": "From",
    "transactions.to": "To",
    "transactions.noTransactions": "No transactions",
    "transactions.noTransactionsDesc": "No transactions match the selected filters.",
    "transactions.loadMore": "Load more transactions",
    "transactions.export": "CSV",
    "transactions.refresh": "Refresh",
    "transactions.couldNotLoad": "Could not load transactions. Please try again.",
  },

  ES: {
    // Nav
    "nav.logOn": "Iniciar sesión",
    "nav.logOnFull": "Acceder a la banca en línea",
    "nav.openMenu": "Abrir menú",
    // Menu links
    "menu.currentAccounts": "Cuentas corrientes",
    "menu.savings": "Ahorros",
    "menu.creditCards": "Tarjetas de crédito",
    "menu.loans": "Préstamos",
    "menu.mortgages": "Hipotecas",
    "menu.investments": "Inversiones",
    "menu.international": "Internacional",
    "menu.insurance": "Seguros",
    "menu.helpSupport": "Ayuda y soporte",
    // Hero
    "hero.heading": "¿Tu próxima tarjeta de crédito?",
    "hero.body":
      "Obtén £25 de reembolso al gastar o transferir un saldo de £500 o más con una tarjeta de Transferencia de Saldo o Compra Plus. La oferta finaliza el 10 de agosto de 2026. TAE representativa del 24,9% (variable). El crédito está sujeto a condiciones.",
    "hero.applyNow": "Solicitar ahora",
    "hero.disclaimer":
      "Disponible para clientes nuevos y existentes. Se aplican condiciones de oferta y elegibilidad.",
    "hero.viewTerms": "Ver términos y condiciones de la oferta",
    "hero.offerMayBeWithdrawn": "La oferta puede retirarse en cualquier momento.",
    // Premier
    "premier.heading": "Únete a Lumina Premier hoy",
    "premier.body":
      "Lumina Premier es nuestra cuenta premium que te ofrece más que banca con beneficios de patrimonio, salud y viajes, y recompensas también. Se aplican criterios de elegibilidad y condiciones.",
    "premier.link": "Cuenta Bancaria Premier",
    // Buy & manage
    "buyManage.heading": "Compra y gestiona fondos en línea",
    "buyManage.body":
      "Ahora es aún más fácil para los clientes de cuentas corrientes de Lumina UK gestionar, comprar y vender inversiones en línea. Capital en riesgo. Se aplican comisiones.",
    "buyManage.link": "Más información",
    // Products
    "products.currentAccounts": "Cuentas corrientes",
    "products.savingsAccounts": "Cuentas de ahorro",
    "products.creditCards": "Tarjetas de crédito",
    "products.loans": "Préstamos",
    "products.mortgages": "Hipotecas",
    "products.investments": "Inversiones",
    "products.internationalBanking": "Banca internacional",
    "products.insurance": "Seguros",
    // Help
    "help.heading": "¿Buscas ayuda?",
    "help.body": "Encuentra respuestas a tus preguntas y obtén la orientación más reciente.",
    "help.digitalReset": "Reinicio digital",
    "help.managingAccount": "Gestionar tu cuenta",
    // Growing money
    "growMoney.heading": "Hacer crecer tu dinero",
    "growMoney.body":
      "Explora formas de sacar el máximo partido a tu dinero para alcanzar tus objetivos.",
    "growMoney.link": "ISA en acciones y valores",
    // Small business
    "smallBiz.heading": "Cuenta Bancaria para Pequeñas Empresas de Lumina",
    "smallBiz.body":
      "Estamos aquí para apoyar tu negocio en todo momento, por eso no hay cuota mensual de cuenta ni banca digital gratuita en el Reino Unido.",
    "smallBiz.link": "Cuenta Bancaria para Pequeñas Empresas",
    // Why Lumina
    "whyLumina.heading": "¿Por qué hacer banca con Lumina?",
    "whyLumina.reason1":
      "Con una de las redes bancarias más accesibles del Reino Unido, somos fáciles de encontrar.",
    "whyLumina.reason2":
      "Reúnete con nosotros para obtener asesoramiento sobre cómo elegir la cuenta adecuada, crear ahorros, gestionar deudas o invertir en tu futuro.",
    "whyLumina.reason3":
      "Recibe efectivo extranjero gratis en tu domicilio o en el Centro Bancario Lumina más cercano.",
    "whyLumina.reason4":
      "Envía dinero a más de 120 países usando Lumina Global Money Transfer sin comisión de transferencia.",
    "whyLumina.learnMore": "Conoce más formas de hacer banca",
    // Discover
    "discover.heading": "Descubre otras formas en que podemos ayudarte",
    // Security
    "security.heading": "Tu seguridad, nuestra prioridad",
    "security.body":
      "Utilizamos cifrado avanzado y autenticación multifactor para mantener tu cuenta y tu dinero seguros en todo momento.",
    "security.link": "Más información sobre seguridad",
    // Investing
    "investing.tag": "Inversiones",
    "investing.heading": "Invierte de forma más inteligente",
    "investing.body":
      "Abre una cuenta Lumina Investor's Edge y accede a acciones, ETFs y más sin comisión en operaciones elegibles.",
    "investing.link": "Más información",
    // Cards
    "cards.heading": "Tarjetas diseñadas para ti",
    "cards.body":
      "Ya sea que gastes en casa o en el extranjero, nuestra gama de tarjetas Visa te pone en control: con reembolsos, ventajas de viaje y sin comisiones por divisas.",
    "cards.featured": "Destacado",
    "cards.cardName": "Lumina Business\nVisa Signature",
    "cards.cardBody":
      "Sin comisiones por transacciones internacionales, reembolso ilimitado y beneficios premium de viaje en todo el mundo. Creada para los negocios, diseñada para la vida.",
    "cards.applyNow": "Solicitar ahora",
    // Questions
    "questions.heading": "¿Preguntas?",
    "questions.placeholder": "Escribe tu pregunta",
    "questions.topQuestions": "Preguntas frecuentes",
    "questions.displaying": "Mostrando {visible} de {total} pregunta(s)",
    "questions.showMore": "Mostrar más preguntas",
    // FAQ
    "faq.q1": "¿Cómo abro una cuenta en Lumina Bank?",
    "faq.a1":
      "Puedes abrir una cuenta en línea en minutos. Haz clic en 'Abrir una cuenta' en nuestra página de inicio, completa el formulario y verifica tu identidad. Tu cuenta estará lista en 24 horas.",
    "faq.q2": "¿Qué es una transacción pendiente?",
    "faq.a2":
      "Una transacción pendiente es un pago autorizado que aún no se ha procesado completamente. Reduce temporalmente tu saldo disponible hasta que el pago se liquide, normalmente en 1 a 3 días hábiles.",
    "faq.q3": "¿Cómo realizo un pago con tarjeta de crédito?",
    "faq.a3":
      "Inicia sesión en la Banca en Línea, ve a Tarjetas, selecciona tu tarjeta de crédito y elige 'Realizar un pago'. Puedes pagar el importe mínimo, el saldo completo o un importe personalizado desde cualquier cuenta vinculada.",
    "faq.q4": "¿Cómo transfiero dinero a otra cuenta?",
    "faq.a4":
      "Ve a Transferir y Pagar en la app o en la Banca en Línea. Elige Transferencia Interna para tus propias cuentas o Transferencia Nacional para otros bancos. También se admiten transferencias internacionales.",
    "faq.q5": "¿Cómo bloqueo o desbloqueo mi tarjeta?",
    "faq.a5":
      "Ve a Tarjetas en la Banca en Línea o en la app, selecciona la tarjeta que deseas gestionar y toca 'Bloquear tarjeta'. Puedes desbloquearla en cualquier momento usando la misma opción.",
    "faq.q6": "¿Cuáles son los límites de transferencia diarios?",
    "faq.a6":
      "Los límites estándar de cuenta corriente son de £10.000 por día para transferencias nacionales y £25.000 para transferencias internacionales. Los clientes Lumina Premier tienen límites más altos.",
    "faq.q7": "¿Cómo impugno una transacción?",
    "faq.a7":
      "Si ves una transacción que no reconoces, ve a Transacciones, selecciona el elemento y toca 'Disputar esta transacción'. Nuestro equipo investigará y responderá en 5 días hábiles.",
    "faq.q8": "¿Cuál es la diferencia entre saldo disponible y saldo actual?",
    "faq.a8":
      "Tu saldo actual es el total de fondos en tu cuenta. Tu saldo disponible es lo que puedes gastar realmente: excluye transacciones pendientes o retenciones en tu cuenta.",
    "faq.q9": "¿Cómo actualizo mis datos personales?",
    "faq.a9":
      "Inicia sesión en la Banca en Línea, ve a Perfil y selecciona el dato que deseas actualizar. Algunos cambios, como las actualizaciones de dirección, pueden requerir verificación de identidad.",
    "faq.q10": "¿Cómo solicito un préstamo?",
    "faq.a10":
      "Ve a Préstamos en la Banca en Línea y verifica tu elegibilidad. Si eres elegible, puedes solicitar en línea y recibir una decisión al instante. Los fondos generalmente se transfieren en un día hábil.",
    // FSCS
    "fscs.body":
      "Lumina Bank es miembro del Plan de Compensación de Servicios Financieros (FSCS).",
    // Footer
    "footer.banking": "Banca",
    "footer.company": "Empresa",
    "footer.currentAccounts": "Cuentas corrientes",
    "footer.savings": "Ahorros",
    "footer.creditCards": "Tarjetas de crédito",
    "footer.mortgages": "Hipotecas",
    "footer.loans": "Préstamos",
    "footer.investments": "Inversiones",
    "footer.international": "Internacional",
    "footer.aboutLumina": "Sobre Lumina",
    "footer.helpFaqs": "Ayuda y preguntas frecuentes",
    "footer.securityCentre": "Centro de seguridad",
    "footer.careers": "Empleo",
    "footer.privacyPolicy": "Política de privacidad",
    "footer.termsOfUse": "Condiciones de uso",
    "footer.complaints": "Reclamaciones",
    "footer.legal1":
      "Lumina Bank está autorizado por la Autoridad de Regulación Prudencial y regulado por la Autoridad de Conducta Financiera y la Autoridad de Regulación Prudencial. Número de Registro de Servicios Financieros: 123456.",
    "footer.legal2":
      "Los depósitos elegibles están protegidos hasta £85.000 por persona por el Plan de Compensación de Servicios Financieros (FSCS). Este sitio web está diseñado para su uso en el Reino Unido.",
    "footer.copyright": "© Lumina Group 2025–2026. Todos los derechos reservados.",
    // Dashboard
    "dashboard.totalBalance": "Saldo total",
    "dashboard.hello": "Hola, {name}",
    "dashboard.across": "En {count}",
    "dashboard.account": "cuenta",
    "dashboard.accounts": "cuentas",
    "dashboard.quickAction.send": "Enviar",
    "dashboard.quickAction.pay": "Pagar",
    "dashboard.quickAction.topUp": "Recargar",
    "dashboard.quickAction.more": "Más",
    "dashboard.yourAccounts": "Tus cuentas",
    "dashboard.viewAll": "Ver todo",
    "dashboard.recentTransactions": "Transacciones recientes",
    "dashboard.noTransactions": "Sin transacciones recientes",
    "dashboard.savingsGoals": "Metas de ahorro",
    "dashboard.target": "Objetivo:",
    // Profile
    "profile.language": "Idioma",
    "profile.selectLanguage": "Seleccionar idioma",
    "profile.languageHint": "Tu idioma preferido para la aplicación Lumina",
    // Language names
    "lang.EN": "Inglés",
    "lang.ES": "Español",
    "lang.FR": "Francés",
    "lang.PT": "Portugués",
    "lang.DE": "Alemán",
    // Auth — Login
    "auth.login.heading": "Acceder a la banca en línea",
    "auth.login.subheading": "Introduce tu correo electrónico y contraseña para acceder a tu cuenta.",
    "auth.login.emailLabel": "Dirección de correo electrónico",
    "auth.login.passwordLabel": "Contraseña",
    "auth.login.submit": "Iniciar sesión",
    "auth.login.forgotPassword": "¿Olvidaste tus datos?",
    "auth.login.newUser": "¿Nuevo en Lumina Bank?",
    "auth.login.register": "Registrarse",
    "auth.login.securityTitle": "Aviso de seguridad: ",
    "auth.login.securityBody": "Lumina Bank nunca te pedirá tu contraseña completa. Asegúrate siempre de estar en el sitio web correcto antes de iniciar sesión.",
    "auth.login.invalidCredentials": "Credenciales inválidas. Por favor, inténtalo de nuevo.",
    // Auth — Register
    "auth.register.heading": "Crear tu cuenta",
    "auth.register.subheading": "Únete a Lumina Bank — menos de 5 minutos.",
    "auth.register.firstName": "Nombre",
    "auth.register.lastName": "Apellido",
    "auth.register.gender": "Género",
    "auth.register.genderOptional": "(opcional)",
    "auth.register.genderMale": "Masculino",
    "auth.register.genderFemale": "Femenino",
    "auth.register.genderOther": "Prefiero no decir",
    "auth.register.email": "Dirección de correo electrónico",
    "auth.register.phone": "Número de teléfono",
    "auth.register.password": "Contraseña",
    "auth.register.passwordHint": "Mínimo 8 caracteres",
    "auth.register.confirmPassword": "Confirmar contraseña",
    "auth.register.submit": "Registrarse",
    "auth.register.alreadyHaveAccount": "¿Ya tienes una cuenta?",
    "auth.register.logOn": "Iniciar sesión",
    "auth.register.gdprNotice": "Al registrarte, aceptas nuestros Términos y Condiciones y Política de Privacidad. Tus datos están protegidos bajo el RGPD del Reino Unido.",
    "auth.register.failed": "El registro falló. Por favor, inténtalo de nuevo.",
    // Auth — Forgot
    "auth.forgot.heading": "¿Olvidaste tus datos?",
    "auth.forgot.subheading": "Introduce tu dirección de correo electrónico registrada y te enviaremos un enlace para restablecer tu contraseña.",
    "auth.forgot.emailLabel": "Dirección de correo electrónico",
    "auth.forgot.submit": "Enviar enlace de restablecimiento",
    "auth.forgot.backToLogin": "Volver a iniciar sesión",
    "auth.forgot.successHeading": "Revisa tu correo electrónico",
    "auth.forgot.successBody": "Si existe una cuenta con ese correo, hemos enviado un enlace para restablecer la contraseña. Revisa tu bandeja de entrada.",
    // Auth — Verify
    "auth.verify.heading": "Verifica tu correo electrónico",
    "auth.verify.body": "Hemos enviado un enlace de verificación a {email}. Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.",
    "auth.verify.resend": "Reenviar correo",
    "auth.verify.backToLogin": "Volver a iniciar sesión",
    "auth.verify.verifying": "Verificando…",
    "auth.verify.success": "¡Correo verificado!",
    "auth.verify.successBody": "Tu cuenta ha sido verificada. Ahora puedes iniciar sesión.",
    "auth.verify.tokenExpired": "Este enlace ha caducado. Por favor, solicita uno nuevo.",
    // Auth — Reset
    "auth.reset.heading": "Restablecer contraseña",
    "auth.reset.newPassword": "Nueva contraseña",
    "auth.reset.confirmPassword": "Confirmar nueva contraseña",
    "auth.reset.submit": "Restablecer contraseña",
    "auth.reset.tokenMissing": "Token de restablecimiento inválido o ausente.",
    "auth.reset.success": "Contraseña restablecida correctamente.",
    "auth.reset.successBody": "Tu contraseña ha sido actualizada. Ahora puedes iniciar sesión con tu nueva contraseña.",
    // Accounts
    "accounts.myAccounts": "Mis Cuentas",
    "accounts.openAccount": "Abrir Cuenta",
    "accounts.totalBalance": "Saldo total",
    "accounts.available": "disponible",
    "accounts.noAccounts": "No se encontraron cuentas",
    "accounts.noAccountsDesc": "Tus cuentas aparecerán aquí una vez configuradas.",
    "accounts.openNew": "Abrir una nueva cuenta",
    "accounts.savings": "Cuenta de Ahorro",
    "accounts.savingsDesc": "Gana intereses en tus ahorros con acceso fácil.",
    "accounts.business": "Cuenta Empresarial",
    "accounts.businessDesc": "Cuenta dedicada para transacciones empresariales.",
    "accounts.fixedDeposit": "Depósito a Plazo",
    "accounts.fixedDepositDesc": "Bloquea una tasa más alta por un período fijo.",
    "accounts.current": "Cuenta Corriente",
    "accounts.currentDesc": "Gastos diarios y domiciliaciones bancarias.",
    "accounts.opening": "Abriendo cuenta…",
    "accounts.open": "Abrir cuenta",
    "accounts.opened": "¡Cuenta abierta!",
    "accounts.openedDesc": "Tu {label} ha sido creada correctamente.",
    "accounts.done": "Hecho",
    "accounts.couldNotLoad": "No se pudieron cargar las cuentas.",
    "accounts.couldNotOpen": "No se pudo abrir la cuenta. Por favor, inténtalo de nuevo.",
    // Cards
    "cards.myCards": "Mis Tarjetas",
    "cards.totalCards": "Total de tarjetas",
    "cards.active": "Activa",
    "cards.frozen": "Congelada",
    "cards.noCards": "No se encontraron tarjetas",
    "cards.noCardsDesc": "Tus tarjetas de débito y crédito aparecerán aquí.",
    "cards.spendingLimits": "Límites de gasto",
    "cards.daily": "Diario",
    "cards.monthly": "Mensual",
    "cards.perTxn": "Por transacción",
    "cards.controls": "Controles de tarjeta",
    "cards.online": "Pagos en línea",
    "cards.contactless": "Sin contacto",
    "cards.international": "Internacional",
    "cards.atm": "Retiradas en cajero",
    "cards.freeze": "Congelar",
    "cards.unfreeze": "Descongelar",
    "cards.details": "Detalles",
    "cards.blockedMessage": "Esta tarjeta está bloqueada. Por favor, contacta con el servicio al cliente.",
    "cards.couldNotLoad": "No se pudieron cargar las tarjetas.",
    "cards.couldNotUpdate": "No se pudo actualizar el estado de la tarjeta. Por favor, inténtalo de nuevo.",
    "cards.statusActive": "Activa",
    "cards.statusFrozen": "Congelada",
    "cards.statusBlocked": "Bloqueada",
    // Transactions
    "transactions.title": "Transacciones",
    "transactions.loaded": "Cargadas",
    "transactions.credits": "Créditos",
    "transactions.debits": "Débitos",
    "transactions.all": "todas",
    "transactions.debit": "débito",
    "transactions.credit": "crédito",
    "transactions.filters": "Filtros",
    "transactions.clearFilters": "Borrar todos los filtros",
    "transactions.category": "Categoría",
    "transactions.from": "Desde",
    "transactions.to": "Hasta",
    "transactions.noTransactions": "Sin transacciones",
    "transactions.noTransactionsDesc": "Ninguna transacción coincide con los filtros seleccionados.",
    "transactions.loadMore": "Cargar más transacciones",
    "transactions.export": "CSV",
    "transactions.refresh": "Actualizar",
    "transactions.couldNotLoad": "No se pudieron cargar las transacciones. Por favor, inténtalo de nuevo.",
  },

  FR: {
    // Nav
    "nav.logOn": "Se connecter",
    "nav.logOnFull": "Accéder à la banque en ligne",
    "nav.openMenu": "Ouvrir le menu",
    // Menu links
    "menu.currentAccounts": "Comptes courants",
    "menu.savings": "Épargne",
    "menu.creditCards": "Cartes de crédit",
    "menu.loans": "Prêts",
    "menu.mortgages": "Hypothèques",
    "menu.investments": "Investissements",
    "menu.international": "International",
    "menu.insurance": "Assurance",
    "menu.helpSupport": "Aide et assistance",
    // Hero
    "hero.heading": "Votre prochaine carte de crédit ?",
    "hero.body":
      "Obtenez £25 de remise en espèces lorsque vous dépensez ou transférez un solde de £500 ou plus avec une carte de transfert de solde ou d'achat Plus. L'offre se termine le 10 août 2026. TAEG représentatif de 24,9% (variable). Le crédit est soumis à conditions.",
    "hero.applyNow": "Faire une demande",
    "hero.disclaimer":
      "Disponible pour les clients nouveaux et existants. Les conditions d'offre et d'éligibilité s'appliquent.",
    "hero.viewTerms": "Voir les conditions générales de l'offre",
    "hero.offerMayBeWithdrawn": "L'offre peut être retirée à tout moment.",
    // Premier
    "premier.heading": "Rejoignez Lumina Premier aujourd'hui",
    "premier.body":
      "Lumina Premier est notre compte premium qui vous offre plus que la banque avec des avantages patrimoniaux, santé et voyage, ainsi que des récompenses. Les critères d'éligibilité et les conditions générales s'appliquent.",
    "premier.link": "Compte Bancaire Premier",
    // Buy & manage
    "buyManage.heading": "Achetez et gérez des fonds en ligne",
    "buyManage.body":
      "Il est désormais encore plus facile pour les titulaires de comptes courants Lumina UK de gérer, d'acheter et de vendre des investissements en ligne. Capital à risque. Des frais s'appliquent.",
    "buyManage.link": "En savoir plus",
    // Products
    "products.currentAccounts": "Comptes courants",
    "products.savingsAccounts": "Comptes d'épargne",
    "products.creditCards": "Cartes de crédit",
    "products.loans": "Prêts",
    "products.mortgages": "Hypothèques",
    "products.investments": "Investissements",
    "products.internationalBanking": "Banque internationale",
    "products.insurance": "Assurance",
    // Help
    "help.heading": "Vous cherchez de l'aide ?",
    "help.body": "Trouvez des réponses à vos questions et obtenez les dernières informations.",
    "help.digitalReset": "Réinitialisation numérique",
    "help.managingAccount": "Gérer votre compte",
    // Growing money
    "growMoney.heading": "Faites fructifier votre argent",
    "growMoney.body":
      "Explorez les moyens de tirer le meilleur parti de votre argent pour atteindre vos objectifs.",
    "growMoney.link": "PEA actions et titres",
    // Small business
    "smallBiz.heading": "Compte Bancaire Lumina pour Petites Entreprises",
    "smallBiz.body":
      "Nous sommes là pour soutenir votre entreprise à chaque étape, c'est pourquoi il n'y a pas de frais mensuels de compte et la banque numérique au Royaume-Uni est gratuite.",
    "smallBiz.link": "Compte Bancaire pour Petites Entreprises",
    // Why Lumina
    "whyLumina.heading": "Pourquoi banquer avec Lumina ?",
    "whyLumina.reason1":
      "Avec l'un des réseaux bancaires les plus accessibles du Royaume-Uni, nous sommes faciles à trouver.",
    "whyLumina.reason2":
      "Rencontrez-nous pour obtenir des conseils sur le choix du bon compte, la constitution de votre épargne, la gestion de vos dettes ou l'investissement dans votre avenir.",
    "whyLumina.reason3":
      "Faites livrer des devises étrangères gratuitement à votre domicile ou au Centre Bancaire Lumina le plus proche.",
    "whyLumina.reason4":
      "Envoyez de l'argent dans plus de 120 pays via Lumina Global Money Transfer sans frais de virement.",
    "whyLumina.learnMore": "Découvrez d'autres façons de banquer",
    // Discover
    "discover.heading": "Découvrez d'autres façons dont nous pouvons vous aider",
    // Security
    "security.heading": "Votre sécurité, notre priorité",
    "security.body":
      "Nous utilisons un chiffrement avancé et une authentification multi-facteurs pour protéger votre compte et votre argent à tout moment.",
    "security.link": "En savoir plus sur la sécurité",
    // Investing
    "investing.tag": "Investissement",
    "investing.heading": "Investissez plus intelligemment",
    "investing.body":
      "Ouvrez un compte Lumina Investor's Edge et accédez aux actions, ETF et plus encore sans commission sur les transactions éligibles.",
    "investing.link": "En savoir plus",
    // Cards
    "cards.heading": "Des cartes conçues pour vous",
    "cards.body":
      "Que vous dépensiez en France ou à l'étranger, notre gamme de cartes Visa vous donne le contrôle — avec des remises en espèces, des avantages voyage et zéro frais de change.",
    "cards.featured": "À la une",
    "cards.cardName": "Lumina Business\nVisa Signature",
    "cards.cardBody":
      "Aucuns frais de transaction à l'étranger, remises en espèces illimitées et avantages voyage premium dans le monde entier. Conçue pour les affaires, pensée pour la vie.",
    "cards.applyNow": "Faire une demande",
    // Questions
    "questions.heading": "Des questions ?",
    "questions.placeholder": "Saisissez votre question",
    "questions.topQuestions": "Questions fréquentes",
    "questions.displaying": "Affichage de {visible} sur {total} question(s)",
    "questions.showMore": "Afficher plus de questions",
    // FAQ
    "faq.q1": "Comment ouvrir un compte Lumina Bank ?",
    "faq.a1":
      "Vous pouvez ouvrir un compte en ligne en quelques minutes. Cliquez sur 'Ouvrir un compte' sur notre page d'accueil, remplissez le formulaire et vérifiez votre identité. Votre compte sera prêt dans les 24 heures.",
    "faq.q2": "Qu'est-ce qu'une transaction en attente ?",
    "faq.a2":
      "Une transaction en attente est un paiement autorisé mais pas encore entièrement traité. Elle réduit temporairement votre solde disponible jusqu'au règlement du paiement, généralement dans 1 à 3 jours ouvrés.",
    "faq.q3": "Comment effectuer un paiement par carte de crédit ?",
    "faq.a3":
      "Connectez-vous à la banque en ligne, allez dans Cartes, sélectionnez votre carte de crédit et choisissez 'Effectuer un paiement'. Vous pouvez payer le montant minimum, le solde total ou un montant personnalisé depuis tout compte lié.",
    "faq.q4": "Comment transférer de l'argent sur un autre compte ?",
    "faq.a4":
      "Accédez à Virement et Paiement dans l'application ou la banque en ligne. Choisissez Virement interne pour vos propres comptes ou Virement national pour d'autres banques. Les virements internationaux sont également pris en charge.",
    "faq.q5": "Comment bloquer ou débloquer ma carte ?",
    "faq.a5":
      "Allez dans Cartes dans la banque en ligne ou l'application, sélectionnez la carte à gérer et appuyez sur 'Bloquer la carte'. Vous pouvez la débloquer à tout moment avec la même option.",
    "faq.q6": "Quels sont les plafonds de virement journaliers ?",
    "faq.a6":
      "Les plafonds standard des comptes courants sont de £10 000 par jour pour les virements nationaux et £25 000 pour les virements internationaux. Les clients Lumina Premier bénéficient de plafonds plus élevés.",
    "faq.q7": "Comment contester une transaction ?",
    "faq.a7":
      "Si vous voyez une transaction que vous ne reconnaissez pas, allez dans Transactions, sélectionnez l'élément et appuyez sur 'Contester cette transaction'. Notre équipe enquêtera et vous répondra dans les 5 jours ouvrés.",
    "faq.q8": "Quelle est la différence entre solde disponible et solde actuel ?",
    "faq.a8":
      "Votre solde actuel correspond au total des fonds sur votre compte. Votre solde disponible est ce que vous pouvez réellement dépenser — il exclut les transactions en attente ou les blocages sur votre compte.",
    "faq.q9": "Comment mettre à jour mes informations personnelles ?",
    "faq.a9":
      "Connectez-vous à la banque en ligne, allez dans Profil et sélectionnez l'information à mettre à jour. Certaines modifications, comme les changements d'adresse, peuvent nécessiter une vérification d'identité.",
    "faq.q10": "Comment faire une demande de prêt ?",
    "faq.a10":
      "Allez dans Prêts dans la banque en ligne et vérifiez votre éligibilité. Si vous êtes éligible, vous pouvez faire une demande en ligne et recevoir une décision instantanément. Les fonds sont généralement transférés en un jour ouvré.",
    // FSCS
    "fscs.body":
      "Lumina Bank est membre du Financial Services Compensation Scheme (FSCS).",
    // Footer
    "footer.banking": "Banque",
    "footer.company": "Entreprise",
    "footer.currentAccounts": "Comptes courants",
    "footer.savings": "Épargne",
    "footer.creditCards": "Cartes de crédit",
    "footer.mortgages": "Hypothèques",
    "footer.loans": "Prêts",
    "footer.investments": "Investissements",
    "footer.international": "International",
    "footer.aboutLumina": "À propos de Lumina",
    "footer.helpFaqs": "Aide et FAQ",
    "footer.securityCentre": "Centre de sécurité",
    "footer.careers": "Carrières",
    "footer.privacyPolicy": "Politique de confidentialité",
    "footer.termsOfUse": "Conditions d'utilisation",
    "footer.complaints": "Réclamations",
    "footer.legal1":
      "Lumina Bank est agréée par la Prudential Regulation Authority et réglementée par la Financial Conduct Authority et la Prudential Regulation Authority. Numéro d'enregistrement des services financiers : 123456.",
    "footer.legal2":
      "Les dépôts éligibles sont protégés jusqu'à £85 000 par personne par le Financial Services Compensation Scheme (FSCS). Ce site est conçu pour une utilisation au Royaume-Uni.",
    "footer.copyright": "© Lumina Group 2025–2026. Tous droits réservés.",
    // Dashboard
    "dashboard.totalBalance": "Solde total",
    "dashboard.hello": "Bonjour, {name}",
    "dashboard.across": "Sur {count}",
    "dashboard.account": "compte",
    "dashboard.accounts": "comptes",
    "dashboard.quickAction.send": "Envoyer",
    "dashboard.quickAction.pay": "Payer",
    "dashboard.quickAction.topUp": "Recharger",
    "dashboard.quickAction.more": "Plus",
    "dashboard.yourAccounts": "Vos comptes",
    "dashboard.viewAll": "Voir tout",
    "dashboard.recentTransactions": "Transactions récentes",
    "dashboard.noTransactions": "Aucune transaction récente",
    "dashboard.savingsGoals": "Objectifs d'épargne",
    "dashboard.target": "Objectif :",
    // Profile
    "profile.language": "Langue",
    "profile.selectLanguage": "Choisir la langue",
    "profile.languageHint": "Votre langue préférée pour l'application Lumina",
    // Language names
    "lang.EN": "Anglais",
    "lang.ES": "Espagnol",
    "lang.FR": "Français",
    "lang.PT": "Portugais",
    "lang.DE": "Allemand",
    // Auth — Login
    "auth.login.heading": "Se connecter à la banque en ligne",
    "auth.login.subheading": "Entrez votre e-mail et mot de passe pour accéder à votre compte.",
    "auth.login.emailLabel": "Adresse e-mail",
    "auth.login.passwordLabel": "Mot de passe",
    "auth.login.submit": "Se connecter",
    "auth.login.forgotPassword": "Identifiants oubliés ?",
    "auth.login.newUser": "Nouveau chez Lumina Bank ?",
    "auth.login.register": "S'inscrire",
    "auth.login.securityTitle": "Avertissement de sécurité : ",
    "auth.login.securityBody": "Lumina Bank ne vous demandera jamais votre mot de passe complet. Assurez-vous toujours d'être sur le bon site web avant de vous connecter.",
    "auth.login.invalidCredentials": "Identifiants invalides. Veuillez réessayer.",
    // Auth — Register
    "auth.register.heading": "Créer votre compte",
    "auth.register.subheading": "Rejoignez Lumina Bank — moins de 5 minutes.",
    "auth.register.firstName": "Prénom",
    "auth.register.lastName": "Nom de famille",
    "auth.register.gender": "Genre",
    "auth.register.genderOptional": "(facultatif)",
    "auth.register.genderMale": "Homme",
    "auth.register.genderFemale": "Femme",
    "auth.register.genderOther": "Préfère ne pas répondre",
    "auth.register.email": "Adresse e-mail",
    "auth.register.phone": "Numéro de téléphone",
    "auth.register.password": "Mot de passe",
    "auth.register.passwordHint": "8 caractères minimum",
    "auth.register.confirmPassword": "Confirmer le mot de passe",
    "auth.register.submit": "S'inscrire",
    "auth.register.alreadyHaveAccount": "Vous avez déjà un compte ?",
    "auth.register.logOn": "Se connecter",
    "auth.register.gdprNotice": "En vous inscrivant, vous acceptez nos Conditions Générales et notre Politique de Confidentialité. Vos données sont protégées conformément au RGPD britannique.",
    "auth.register.failed": "L'inscription a échoué. Veuillez réessayer.",
    // Auth — Forgot
    "auth.forgot.heading": "Identifiants oubliés ?",
    "auth.forgot.subheading": "Entrez votre adresse e-mail enregistrée et nous vous enverrons un lien pour réinitialiser votre mot de passe.",
    "auth.forgot.emailLabel": "Adresse e-mail",
    "auth.forgot.submit": "Envoyer le lien de réinitialisation",
    "auth.forgot.backToLogin": "Retour à la connexion",
    "auth.forgot.successHeading": "Vérifiez votre e-mail",
    "auth.forgot.successBody": "Si un compte existe avec cet e-mail, nous avons envoyé un lien de réinitialisation. Vérifiez votre boîte de réception.",
    // Auth — Verify
    "auth.verify.heading": "Vérifiez votre e-mail",
    "auth.verify.body": "Nous avons envoyé un lien de vérification à {email}. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour activer votre compte.",
    "auth.verify.resend": "Renvoyer l'e-mail",
    "auth.verify.backToLogin": "Retour à la connexion",
    "auth.verify.verifying": "Vérification…",
    "auth.verify.success": "E-mail vérifié !",
    "auth.verify.successBody": "Votre compte a été vérifié. Vous pouvez maintenant vous connecter.",
    "auth.verify.tokenExpired": "Ce lien a expiré. Veuillez en demander un nouveau.",
    // Auth — Reset
    "auth.reset.heading": "Réinitialiser votre mot de passe",
    "auth.reset.newPassword": "Nouveau mot de passe",
    "auth.reset.confirmPassword": "Confirmer le nouveau mot de passe",
    "auth.reset.submit": "Réinitialiser le mot de passe",
    "auth.reset.tokenMissing": "Jeton de réinitialisation invalide ou manquant.",
    "auth.reset.success": "Mot de passe réinitialisé avec succès.",
    "auth.reset.successBody": "Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
    // Accounts
    "accounts.myAccounts": "Mes Comptes",
    "accounts.openAccount": "Ouvrir un Compte",
    "accounts.totalBalance": "Solde total",
    "accounts.available": "disponible",
    "accounts.noAccounts": "Aucun compte trouvé",
    "accounts.noAccountsDesc": "Vos comptes apparaîtront ici une fois configurés.",
    "accounts.openNew": "Ouvrir un nouveau compte",
    "accounts.savings": "Compte Épargne",
    "accounts.savingsDesc": "Gagnez des intérêts sur votre épargne avec un accès facile.",
    "accounts.business": "Compte Professionnel",
    "accounts.businessDesc": "Compte dédié aux transactions professionnelles.",
    "accounts.fixedDeposit": "Dépôt à Terme",
    "accounts.fixedDepositDesc": "Bloquez un taux plus élevé pour une durée fixe.",
    "accounts.current": "Compte Courant",
    "accounts.currentDesc": "Dépenses quotidiennes et prélèvements automatiques.",
    "accounts.opening": "Ouverture du compte…",
    "accounts.open": "Ouvrir le compte",
    "accounts.opened": "Compte ouvert !",
    "accounts.openedDesc": "Votre {label} a été créé avec succès.",
    "accounts.done": "Terminé",
    "accounts.couldNotLoad": "Impossible de charger les comptes.",
    "accounts.couldNotOpen": "Impossible d'ouvrir le compte. Veuillez réessayer.",
    // Cards
    "cards.myCards": "Mes Cartes",
    "cards.totalCards": "Total des cartes",
    "cards.active": "Active",
    "cards.frozen": "Gelée",
    "cards.noCards": "Aucune carte trouvée",
    "cards.noCardsDesc": "Vos cartes de débit et de crédit apparaîtront ici.",
    "cards.spendingLimits": "Limites de dépenses",
    "cards.daily": "Quotidien",
    "cards.monthly": "Mensuel",
    "cards.perTxn": "Par transaction",
    "cards.controls": "Contrôles de carte",
    "cards.online": "Paiements en ligne",
    "cards.contactless": "Sans contact",
    "cards.international": "International",
    "cards.atm": "Retraits au distributeur",
    "cards.freeze": "Geler",
    "cards.unfreeze": "Dégeler",
    "cards.details": "Détails",
    "cards.blockedMessage": "Cette carte est bloquée. Veuillez contacter le service client.",
    "cards.couldNotLoad": "Impossible de charger les cartes.",
    "cards.couldNotUpdate": "Impossible de mettre à jour le statut de la carte. Veuillez réessayer.",
    "cards.statusActive": "Active",
    "cards.statusFrozen": "Gelée",
    "cards.statusBlocked": "Bloquée",
    // Transactions
    "transactions.title": "Transactions",
    "transactions.loaded": "Chargées",
    "transactions.credits": "Crédits",
    "transactions.debits": "Débits",
    "transactions.all": "toutes",
    "transactions.debit": "débit",
    "transactions.credit": "crédit",
    "transactions.filters": "Filtres",
    "transactions.clearFilters": "Effacer tous les filtres",
    "transactions.category": "Catégorie",
    "transactions.from": "Du",
    "transactions.to": "Au",
    "transactions.noTransactions": "Aucune transaction",
    "transactions.noTransactionsDesc": "Aucune transaction ne correspond aux filtres sélectionnés.",
    "transactions.loadMore": "Charger plus de transactions",
    "transactions.export": "CSV",
    "transactions.refresh": "Actualiser",
    "transactions.couldNotLoad": "Impossible de charger les transactions. Veuillez réessayer.",
  },

  PT: {
    // Nav
    "nav.logOn": "Entrar",
    "nav.logOnFull": "Aceder à Banca Online",
    "nav.openMenu": "Abrir menu",
    // Menu links
    "menu.currentAccounts": "Contas à ordem",
    "menu.savings": "Poupança",
    "menu.creditCards": "Cartões de crédito",
    "menu.loans": "Empréstimos",
    "menu.mortgages": "Hipotecas",
    "menu.investments": "Investimentos",
    "menu.international": "Internacional",
    "menu.insurance": "Seguros",
    "menu.helpSupport": "Ajuda e suporte",
    // Hero
    "hero.heading": "O seu próximo cartão de crédito?",
    "hero.body":
      "Receba £25 de cashback ao gastar ou transferir um saldo de £500 ou mais com um cartão de Transferência de Saldo ou Compra Plus. A oferta termina em 10 de agosto de 2026. TAEG representativa de 24,9% (variável). O crédito está sujeito a condições.",
    "hero.applyNow": "Candidatar-se",
    "hero.disclaimer":
      "Disponível para clientes novos e existentes. Aplicam-se critérios de oferta e elegibilidade.",
    "hero.viewTerms": "Ver termos e condições da oferta",
    "hero.offerMayBeWithdrawn": "A oferta pode ser retirada a qualquer momento.",
    // Premier
    "premier.heading": "Adira ao Lumina Premier hoje",
    "premier.body":
      "O Lumina Premier é a nossa conta premium que lhe oferece mais do que banca, com benefícios de patrimônio, saúde e viagens, além de recompensas. Aplicam-se critérios de elegibilidade e condições.",
    "premier.link": "Conta Bancária Premier",
    // Buy & manage
    "buyManage.heading": "Compre e gira fundos online",
    "buyManage.body":
      "Agora é ainda mais fácil para os clientes de contas à ordem da Lumina UK gerir, comprar e vender investimentos online. Capital em risco. Aplicam-se taxas.",
    "buyManage.link": "Saber mais",
    // Products
    "products.currentAccounts": "Contas à ordem",
    "products.savingsAccounts": "Contas poupança",
    "products.creditCards": "Cartões de crédito",
    "products.loans": "Empréstimos",
    "products.mortgages": "Hipotecas",
    "products.investments": "Investimentos",
    "products.internationalBanking": "Banca internacional",
    "products.insurance": "Seguros",
    // Help
    "help.heading": "À procura de ajuda?",
    "help.body": "Encontre respostas às suas perguntas e obtenha as orientações mais recentes.",
    "help.digitalReset": "Reinicialização digital",
    "help.managingAccount": "Gerir a sua conta",
    // Growing money
    "growMoney.heading": "Faça o seu dinheiro crescer",
    "growMoney.body":
      "Explore formas de tirar o máximo partido do seu dinheiro para atingir os seus objetivos.",
    "growMoney.link": "ISA em ações e valores mobiliários",
    // Small business
    "smallBiz.heading": "Conta Bancária Lumina para Pequenas Empresas",
    "smallBiz.body":
      "Estamos aqui para apoiar o seu negócio em tudo, por isso não há mensalidade de conta e a banca digital no Reino Unido é gratuita.",
    "smallBiz.link": "Conta Bancária para Pequenas Empresas",
    // Why Lumina
    "whyLumina.heading": "Porquê fazer banca com a Lumina?",
    "whyLumina.reason1":
      "Com uma das redes bancárias mais acessíveis do Reino Unido, somos fáceis de encontrar.",
    "whyLumina.reason2":
      "Reúna-se connosco para obter aconselhamento sobre como escolher a conta certa, criar poupanças, gerir dívidas ou investir no seu futuro.",
    "whyLumina.reason3":
      "Receba dinheiro estrangeiro gratuitamente em sua casa ou no Centro Bancário Lumina mais próximo.",
    "whyLumina.reason4":
      "Envie dinheiro para mais de 120 países através do Lumina Global Money Transfer sem pagar taxa de transferência.",
    "whyLumina.learnMore": "Saiba mais formas de fazer banca",
    // Discover
    "discover.heading": "Descubra outras formas como podemos ajudá-lo",
    // Security
    "security.heading": "A sua segurança, a nossa prioridade",
    "security.body":
      "Utilizamos encriptação avançada e autenticação multifator para manter a sua conta e o seu dinheiro seguros em todos os momentos.",
    "security.link": "Saber mais sobre segurança",
    // Investing
    "investing.tag": "Investimento",
    "investing.heading": "Invista de forma mais inteligente",
    "investing.body":
      "Abra uma conta Lumina Investor's Edge e aceda a ações, ETFs e mais sem comissão em transações elegíveis.",
    "investing.link": "Saber mais",
    // Cards
    "cards.heading": "Cartões desenhados para si",
    "cards.body":
      "Quer gaste em casa ou no estrangeiro, a nossa gama de cartões Visa coloca-o no controlo — com cashback, vantagens de viagem e zero taxas estrangeiras.",
    "cards.featured": "Destaque",
    "cards.cardName": "Lumina Business\nVisa Signature",
    "cards.cardBody":
      "Sem taxas de transação estrangeira, cashback ilimitado e benefícios de viagem premium em todo o mundo. Criado para os negócios, desenhado para a vida.",
    "cards.applyNow": "Candidatar-se",
    // Questions
    "questions.heading": "Perguntas?",
    "questions.placeholder": "Introduza a sua pergunta",
    "questions.topQuestions": "Perguntas frequentes",
    "questions.displaying": "A mostrar {visible} de {total} pergunta(s)",
    "questions.showMore": "Mostrar mais perguntas",
    // FAQ
    "faq.q1": "Como abro uma conta no Lumina Bank?",
    "faq.a1":
      "Pode abrir uma conta online em minutos. Clique em 'Abrir uma conta' na nossa página inicial, preencha o formulário e verifique a sua identidade. A sua conta estará pronta em 24 horas.",
    "faq.q2": "O que é uma transação pendente?",
    "faq.a2":
      "Uma transação pendente é um pagamento autorizado que ainda não foi totalmente processado. Reduz temporariamente o seu saldo disponível até o pagamento ser liquidado, normalmente em 1 a 3 dias úteis.",
    "faq.q3": "Como efetuo um pagamento com cartão de crédito?",
    "faq.a3":
      "Inicie sessão na Banca Online, vá a Cartões, selecione o seu cartão de crédito e escolha 'Efetuar um pagamento'. Pode pagar o valor mínimo, o saldo total ou um valor personalizado de qualquer conta vinculada.",
    "faq.q4": "Como transfiro dinheiro para outra conta?",
    "faq.a4":
      "Vá a Transferir e Pagar na aplicação ou na Banca Online. Escolha Transferência Interna para as suas próprias contas ou Transferência Nacional para outros bancos. Transferências internacionais também são suportadas.",
    "faq.q5": "Como bloqueio ou desbloqueio o meu cartão?",
    "faq.a5":
      "Vá a Cartões na Banca Online ou na aplicação, selecione o cartão que quer gerir e toque em 'Bloquear cartão'. Pode desbloquear a qualquer momento usando a mesma opção.",
    "faq.q6": "Quais são os limites de transferência diários?",
    "faq.a6":
      "Os limites padrão de conta à ordem são £10.000 por dia para transferências nacionais e £25.000 para transferências internacionais. Os clientes Lumina Premier têm limites mais elevados.",
    "faq.q7": "Como contesto uma transação?",
    "faq.a7":
      "Se vir uma transação que não reconhece, vá a Transações, selecione o item e toque em 'Contestar esta transação'. A nossa equipa investigará e responderá em 5 dias úteis.",
    "faq.q8": "Qual é a diferença entre saldo disponível e saldo atual?",
    "faq.a8":
      "O seu saldo atual é o total de fundos na sua conta. O seu saldo disponível é o que pode efetivamente gastar — exclui transações pendentes ou retenções na sua conta.",
    "faq.q9": "Como atualizo os meus dados pessoais?",
    "faq.a9":
      "Inicie sessão na Banca Online, vá a Perfil e selecione o detalhe que deseja atualizar. Algumas alterações, como atualizações de morada, podem requerer verificação de identidade.",
    "faq.q10": "Como me candidato a um empréstimo?",
    "faq.a10":
      "Vá a Empréstimos na Banca Online e verifique a sua elegibilidade. Se elegível, pode candidatar-se online e receber uma decisão instantaneamente. Os fundos são normalmente transferidos num dia útil.",
    // FSCS
    "fscs.body":
      "O Lumina Bank é membro do Financial Services Compensation Scheme (FSCS).",
    // Footer
    "footer.banking": "Banca",
    "footer.company": "Empresa",
    "footer.currentAccounts": "Contas à ordem",
    "footer.savings": "Poupança",
    "footer.creditCards": "Cartões de crédito",
    "footer.mortgages": "Hipotecas",
    "footer.loans": "Empréstimos",
    "footer.investments": "Investimentos",
    "footer.international": "Internacional",
    "footer.aboutLumina": "Sobre a Lumina",
    "footer.helpFaqs": "Ajuda e FAQ",
    "footer.securityCentre": "Centro de segurança",
    "footer.careers": "Carreiras",
    "footer.privacyPolicy": "Política de privacidade",
    "footer.termsOfUse": "Termos de utilização",
    "footer.complaints": "Reclamações",
    "footer.legal1":
      "O Lumina Bank é autorizado pela Prudential Regulation Authority e regulado pela Financial Conduct Authority e pela Prudential Regulation Authority. Número de Registo de Serviços Financeiros: 123456.",
    "footer.legal2":
      "Os depósitos elegíveis são protegidos até £85.000 por pessoa pelo Financial Services Compensation Scheme (FSCS). Este website foi concebido para utilização no Reino Unido.",
    "footer.copyright": "© Lumina Group 2025–2026. Todos os direitos reservados.",
    // Dashboard
    "dashboard.totalBalance": "Saldo total",
    "dashboard.hello": "Olá, {name}",
    "dashboard.across": "Em {count}",
    "dashboard.account": "conta",
    "dashboard.accounts": "contas",
    "dashboard.quickAction.send": "Enviar",
    "dashboard.quickAction.pay": "Pagar",
    "dashboard.quickAction.topUp": "Carregar",
    "dashboard.quickAction.more": "Mais",
    "dashboard.yourAccounts": "As suas contas",
    "dashboard.viewAll": "Ver tudo",
    "dashboard.recentTransactions": "Transações recentes",
    "dashboard.noTransactions": "Sem transações recentes",
    "dashboard.savingsGoals": "Objetivos de poupança",
    "dashboard.target": "Objetivo:",
    // Profile
    "profile.language": "Idioma",
    "profile.selectLanguage": "Selecionar idioma",
    "profile.languageHint": "O seu idioma preferido para a aplicação Lumina",
    // Language names
    "lang.EN": "Inglês",
    "lang.ES": "Espanhol",
    "lang.FR": "Francês",
    "lang.PT": "Português",
    "lang.DE": "Alemão",
    // Auth — Login
    "auth.login.heading": "Aceder à banca online",
    "auth.login.subheading": "Introduza o seu e-mail e palavra-passe para aceder à sua conta.",
    "auth.login.emailLabel": "Endereço de e-mail",
    "auth.login.passwordLabel": "Palavra-passe",
    "auth.login.submit": "Iniciar sessão",
    "auth.login.forgotPassword": "Esqueceu os seus dados?",
    "auth.login.newUser": "Novo no Lumina Bank?",
    "auth.login.register": "Registar",
    "auth.login.securityTitle": "Aviso de segurança: ",
    "auth.login.securityBody": "O Lumina Bank nunca pedirá a sua palavra-passe completa. Certifique-se sempre de que está no website correto antes de iniciar sessão.",
    "auth.login.invalidCredentials": "Credenciais inválidas. Por favor, tente novamente.",
    // Auth — Register
    "auth.register.heading": "Criar a sua conta",
    "auth.register.subheading": "Junte-se ao Lumina Bank — menos de 5 minutos.",
    "auth.register.firstName": "Primeiro nome",
    "auth.register.lastName": "Apelido",
    "auth.register.gender": "Género",
    "auth.register.genderOptional": "(opcional)",
    "auth.register.genderMale": "Masculino",
    "auth.register.genderFemale": "Feminino",
    "auth.register.genderOther": "Prefiro não dizer",
    "auth.register.email": "Endereço de e-mail",
    "auth.register.phone": "Número de telefone",
    "auth.register.password": "Palavra-passe",
    "auth.register.passwordHint": "Mínimo 8 caracteres",
    "auth.register.confirmPassword": "Confirmar palavra-passe",
    "auth.register.submit": "Registar",
    "auth.register.alreadyHaveAccount": "Já tem uma conta?",
    "auth.register.logOn": "Iniciar sessão",
    "auth.register.gdprNotice": "Ao registar-se, concorda com os nossos Termos e Condições e Política de Privacidade. Os seus dados estão protegidos ao abrigo do RGPD do Reino Unido.",
    "auth.register.failed": "O registo falhou. Por favor, tente novamente.",
    // Auth — Forgot
    "auth.forgot.heading": "Esqueceu os seus dados?",
    "auth.forgot.subheading": "Introduza o seu endereço de e-mail registado e enviaremos um link para redefinir a sua palavra-passe.",
    "auth.forgot.emailLabel": "Endereço de e-mail",
    "auth.forgot.submit": "Enviar link de redefinição",
    "auth.forgot.backToLogin": "Voltar para iniciar sessão",
    "auth.forgot.successHeading": "Verifique o seu e-mail",
    "auth.forgot.successBody": "Se existir uma conta com esse e-mail, enviámos um link de redefinição. Verifique a sua caixa de entrada.",
    // Auth — Verify
    "auth.verify.heading": "Verifique o seu e-mail",
    "auth.verify.body": "Enviámos um link de verificação para {email}. Por favor, verifique a sua caixa de entrada e clique no link para ativar a sua conta.",
    "auth.verify.resend": "Reenviar e-mail",
    "auth.verify.backToLogin": "Voltar para iniciar sessão",
    "auth.verify.verifying": "A verificar…",
    "auth.verify.success": "E-mail verificado!",
    "auth.verify.successBody": "A sua conta foi verificada. Pode agora iniciar sessão.",
    "auth.verify.tokenExpired": "Este link expirou. Por favor, solicite um novo.",
    // Auth — Reset
    "auth.reset.heading": "Redefinir palavra-passe",
    "auth.reset.newPassword": "Nova palavra-passe",
    "auth.reset.confirmPassword": "Confirmar nova palavra-passe",
    "auth.reset.submit": "Redefinir palavra-passe",
    "auth.reset.tokenMissing": "Token de redefinição inválido ou ausente.",
    "auth.reset.success": "Palavra-passe redefinida com sucesso.",
    "auth.reset.successBody": "A sua palavra-passe foi atualizada. Pode agora iniciar sessão com a sua nova palavra-passe.",
    // Accounts
    "accounts.myAccounts": "As Minhas Contas",
    "accounts.openAccount": "Abrir Conta",
    "accounts.totalBalance": "Saldo total",
    "accounts.available": "disponível",
    "accounts.noAccounts": "Nenhuma conta encontrada",
    "accounts.noAccountsDesc": "As suas contas aparecerão aqui após configuração.",
    "accounts.openNew": "Abrir uma nova conta",
    "accounts.savings": "Conta Poupança",
    "accounts.savingsDesc": "Ganhe juros nas suas poupanças com acesso fácil.",
    "accounts.business": "Conta Empresarial",
    "accounts.businessDesc": "Conta dedicada para transações empresariais.",
    "accounts.fixedDeposit": "Depósito a Prazo",
    "accounts.fixedDepositDesc": "Bloqueie uma taxa mais alta por um período fixo.",
    "accounts.current": "Conta à Ordem",
    "accounts.currentDesc": "Gastos diários e débitos diretos.",
    "accounts.opening": "A abrir conta…",
    "accounts.open": "Abrir conta",
    "accounts.opened": "Conta aberta!",
    "accounts.openedDesc": "A sua {label} foi criada com sucesso.",
    "accounts.done": "Concluído",
    "accounts.couldNotLoad": "Não foi possível carregar as contas.",
    "accounts.couldNotOpen": "Não foi possível abrir a conta. Por favor, tente novamente.",
    // Cards
    "cards.myCards": "Os Meus Cartões",
    "cards.totalCards": "Total de cartões",
    "cards.active": "Ativo",
    "cards.frozen": "Congelado",
    "cards.noCards": "Nenhum cartão encontrado",
    "cards.noCardsDesc": "Os seus cartões de débito e crédito aparecerão aqui.",
    "cards.spendingLimits": "Limites de gasto",
    "cards.daily": "Diário",
    "cards.monthly": "Mensal",
    "cards.perTxn": "Por transação",
    "cards.controls": "Controlos do cartão",
    "cards.online": "Pagamentos online",
    "cards.contactless": "Sem contacto",
    "cards.international": "Internacional",
    "cards.atm": "Levantamentos em ATM",
    "cards.freeze": "Congelar",
    "cards.unfreeze": "Descongelar",
    "cards.details": "Detalhes",
    "cards.blockedMessage": "Este cartão está bloqueado. Por favor, contacte o apoio ao cliente.",
    "cards.couldNotLoad": "Não foi possível carregar os cartões.",
    "cards.couldNotUpdate": "Não foi possível atualizar o estado do cartão. Por favor, tente novamente.",
    "cards.statusActive": "Ativo",
    "cards.statusFrozen": "Congelado",
    "cards.statusBlocked": "Bloqueado",
    // Transactions
    "transactions.title": "Transações",
    "transactions.loaded": "Carregadas",
    "transactions.credits": "Créditos",
    "transactions.debits": "Débitos",
    "transactions.all": "todas",
    "transactions.debit": "débito",
    "transactions.credit": "crédito",
    "transactions.filters": "Filtros",
    "transactions.clearFilters": "Limpar todos os filtros",
    "transactions.category": "Categoria",
    "transactions.from": "De",
    "transactions.to": "Até",
    "transactions.noTransactions": "Sem transações",
    "transactions.noTransactionsDesc": "Nenhuma transação corresponde aos filtros selecionados.",
    "transactions.loadMore": "Carregar mais transações",
    "transactions.export": "CSV",
    "transactions.refresh": "Atualizar",
    "transactions.couldNotLoad": "Não foi possível carregar as transações. Por favor, tente novamente.",
  },

  DE: {
    // Nav
    "nav.logOn": "Anmelden",
    "nav.logOnFull": "Zum Online-Banking anmelden",
    "nav.openMenu": "Menü öffnen",
    // Menu links
    "menu.currentAccounts": "Girokonten",
    "menu.savings": "Sparen",
    "menu.creditCards": "Kreditkarten",
    "menu.loans": "Kredite",
    "menu.mortgages": "Hypotheken",
    "menu.investments": "Investitionen",
    "menu.international": "International",
    "menu.insurance": "Versicherung",
    "menu.helpSupport": "Hilfe & Support",
    // Hero
    "hero.heading": "Ihre nächste Kreditkarte?",
    "hero.body":
      "Erhalten Sie £25 Cashback, wenn Sie mit einer Balance Transfer- oder Purchase Plus-Karte £500 oder mehr ausgeben oder übertragen. Angebot endet am 10. August 2026. Repräsentativer effektiver Jahreszins: 24,9% (variabel). Kredit vorbehaltlich Bonität.",
    "hero.applyNow": "Jetzt beantragen",
    "hero.disclaimer":
      "Für Neu- und Bestandskunden verfügbar. Es gelten Angebots- und Zulassungsbedingungen.",
    "hero.viewTerms": "Angebotsbedingungen anzeigen",
    "hero.offerMayBeWithdrawn": "Das Angebot kann jederzeit zurückgezogen werden.",
    // Premier
    "premier.heading": "Jetzt Lumina Premier beitreten",
    "premier.body":
      "Lumina Premier ist unser Premium-Konto, das Ihnen mehr als Banking bietet: Vermögens-, Gesundheits- und Reisevorteile sowie Prämien. Es gelten Zulassungskriterien und Geschäftsbedingungen.",
    "premier.link": "Premier-Bankkonto",
    // Buy & manage
    "buyManage.heading": "Fonds online kaufen und verwalten",
    "buyManage.body":
      "Für Lumina UK-Girokontokunden ist es jetzt noch einfacher, Investitionen online zu verwalten, zu kaufen und zu verkaufen. Kapital ist gefährdet. Gebühren fallen an.",
    "buyManage.link": "Mehr erfahren",
    // Products
    "products.currentAccounts": "Girokonten",
    "products.savingsAccounts": "Sparkonten",
    "products.creditCards": "Kreditkarten",
    "products.loans": "Kredite",
    "products.mortgages": "Hypotheken",
    "products.investments": "Investitionen",
    "products.internationalBanking": "Internationales Banking",
    "products.insurance": "Versicherung",
    // Help
    "help.heading": "Suchen Sie Hilfe?",
    "help.body": "Finden Sie Antworten auf Ihre Fragen und erhalten Sie aktuelle Informationen.",
    "help.digitalReset": "Digitales Zurücksetzen",
    "help.managingAccount": "Ihr Konto verwalten",
    // Growing money
    "growMoney.heading": "Ihr Geld vermehren",
    "growMoney.body":
      "Entdecken Sie Möglichkeiten, das Beste aus Ihrem Geld herauszuholen, um Ihre Ziele zu erreichen.",
    "growMoney.link": "Aktien & Wertpapiere ISA",
    // Small business
    "smallBiz.heading": "Lumina Geschäftskonto für Kleinunternehmen",
    "smallBiz.body":
      "Wir unterstützen Ihr Unternehmen auf jedem Schritt des Weges — deshalb gibt es keine monatliche Kontogebühr und kostenloses digitales Banking im Vereinigten Königreich.",
    "smallBiz.link": "Geschäftskonto für Kleinunternehmen",
    // Why Lumina
    "whyLumina.heading": "Warum mit Lumina banking?",
    "whyLumina.reason1":
      "Mit einem der zugänglichsten Banknetzwerke im Vereinigten Königreich sind wir leicht zu finden.",
    "whyLumina.reason2":
      "Treffen Sie uns für Beratung bei der Wahl des richtigen Kontos, beim Aufbau von Ersparnissen, bei der Schuldenregulierung oder beim Investieren in Ihre Zukunft.",
    "whyLumina.reason3":
      "Lassen Sie sich Fremdwährungen kostenlos nach Hause oder zum nächsten Lumina Banking Centre liefern.",
    "whyLumina.reason4":
      "Senden Sie Geld in über 120 Länder über Lumina Global Money Transfer ohne Überweisungsgebühr.",
    "whyLumina.learnMore": "Mehr Möglichkeiten des Bankings entdecken",
    // Discover
    "discover.heading": "Entdecken Sie weitere Möglichkeiten, wie wir Ihnen helfen können",
    // Security
    "security.heading": "Ihre Sicherheit, unsere Priorität",
    "security.body":
      "Wir verwenden moderne Verschlüsselung und Multi-Faktor-Authentifizierung, um Ihr Konto und Ihr Geld jederzeit zu schützen.",
    "security.link": "Mehr über Sicherheit erfahren",
    // Investing
    "investing.tag": "Investieren",
    "investing.heading": "Klüger investieren",
    "investing.body":
      "Eröffnen Sie ein Lumina Investor's Edge-Konto und greifen Sie ohne Provision auf Aktien, ETFs und mehr bei berechtigten Trades zu.",
    "investing.link": "Mehr erfahren",
    // Cards
    "cards.heading": "Karten, die für Sie designed sind",
    "cards.body":
      "Ob Sie im Inland oder im Ausland ausgeben — unsere Visa-Karten geben Ihnen die Kontrolle: mit Cashback, Reisevorteilen und null Auslandsgebühren.",
    "cards.featured": "Empfohlen",
    "cards.cardName": "Lumina Business\nVisa Signature",
    "cards.cardBody":
      "Keine Auslandstransaktionsgebühren, unbegrenztes Cashback und weltweite Premium-Reisevorteile. Für Geschäfte gemacht, für das Leben designed.",
    "cards.applyNow": "Jetzt beantragen",
    // Questions
    "questions.heading": "Fragen?",
    "questions.placeholder": "Ihre Frage eingeben",
    "questions.topQuestions": "Häufige Fragen",
    "questions.displaying": "{visible} von {total} Frage(n) angezeigt",
    "questions.showMore": "Mehr Fragen anzeigen",
    // FAQ
    "faq.q1": "Wie eröffne ich ein Lumina Bank-Konto?",
    "faq.a1":
      "Sie können ein Konto in wenigen Minuten online eröffnen. Klicken Sie auf 'Konto eröffnen' auf unserer Startseite, füllen Sie das Formular aus und verifizieren Sie Ihre Identität. Ihr Konto ist innerhalb von 24 Stunden bereit.",
    "faq.q2": "Was ist eine ausstehende Transaktion?",
    "faq.a2":
      "Eine ausstehende Transaktion ist eine autorisierte Zahlung, die noch nicht vollständig verarbeitet wurde. Sie reduziert vorübergehend Ihr verfügbares Guthaben, bis die Zahlung abgerechnet ist, normalerweise innerhalb von 1–3 Werktagen.",
    "faq.q3": "Wie leiste ich eine Kreditkartenzahlung?",
    "faq.a3":
      "Melden Sie sich beim Online-Banking an, gehen Sie zu Karten, wählen Sie Ihre Kreditkarte und wählen Sie 'Zahlung leisten'. Sie können den Mindestbetrag, den Gesamtsaldo oder einen benutzerdefinierten Betrag von einem verknüpften Konto zahlen.",
    "faq.q4": "Wie überweise ich Geld auf ein anderes Konto?",
    "faq.a4":
      "Gehen Sie in der App oder im Online-Banking zu Überweisen & Zahlen. Wählen Sie Interne Überweisung für Ihre eigenen Konten oder Inlandsüberweisung für andere Banken. Internationale Überweisungen werden ebenfalls unterstützt.",
    "faq.q5": "Wie sperre oder entsperre ich meine Karte?",
    "faq.a5":
      "Gehen Sie im Online-Banking oder der App zu Karten, wählen Sie die zu verwaltende Karte und tippen Sie auf 'Karte sperren'. Sie können sie jederzeit mit derselben Option entsperren.",
    "faq.q6": "Welche täglichen Überweisungslimits gelten?",
    "faq.a6":
      "Die Standardlimits für Girokonten betragen £10.000 pro Tag für Inlandsüberweisungen und £25.000 für internationale Überweisungen. Lumina Premier-Kunden profitieren von höheren Limits.",
    "faq.q7": "Wie fechte ich eine Transaktion an?",
    "faq.a7":
      "Wenn Sie eine nicht erkannte Transaktion sehen, gehen Sie zu Transaktionen, wählen Sie den Eintrag und tippen Sie auf 'Diese Transaktion anfechten'. Unser Team wird ermitteln und innerhalb von 5 Werktagen antworten.",
    "faq.q8": "Was ist der Unterschied zwischen verfügbarem und aktuellem Guthaben?",
    "faq.a8":
      "Ihr aktuelles Guthaben ist der Gesamtbetrag der Mittel auf Ihrem Konto. Ihr verfügbares Guthaben ist, was Sie tatsächlich ausgeben können — es schließt ausstehende Transaktionen oder Sperrungen auf Ihrem Konto aus.",
    "faq.q9": "Wie aktualisiere ich meine persönlichen Daten?",
    "faq.a9":
      "Melden Sie sich beim Online-Banking an, gehen Sie zu Profil und wählen Sie das Detail aus, das Sie aktualisieren möchten. Einige Änderungen wie Adressaktualisierungen können eine Identitätsprüfung erfordern.",
    "faq.q10": "Wie beantrage ich einen Kredit?",
    "faq.a10":
      "Gehen Sie im Online-Banking zu Kredite und prüfen Sie Ihre Berechtigung. Wenn Sie berechtigt sind, können Sie online beantragen und sofort eine Entscheidung erhalten. Mittel werden in der Regel innerhalb eines Werktages überwiesen.",
    // FSCS
    "fscs.body":
      "Lumina Bank ist Mitglied des Financial Services Compensation Scheme (FSCS).",
    // Footer
    "footer.banking": "Banking",
    "footer.company": "Unternehmen",
    "footer.currentAccounts": "Girokonten",
    "footer.savings": "Sparen",
    "footer.creditCards": "Kreditkarten",
    "footer.mortgages": "Hypotheken",
    "footer.loans": "Kredite",
    "footer.investments": "Investitionen",
    "footer.international": "International",
    "footer.aboutLumina": "Über Lumina",
    "footer.helpFaqs": "Hilfe & FAQs",
    "footer.securityCentre": "Sicherheitszentrum",
    "footer.careers": "Karriere",
    "footer.privacyPolicy": "Datenschutzrichtlinie",
    "footer.termsOfUse": "Nutzungsbedingungen",
    "footer.complaints": "Beschwerden",
    "footer.legal1":
      "Lumina Bank ist von der Prudential Regulation Authority zugelassen und wird von der Financial Conduct Authority und der Prudential Regulation Authority reguliert. Registrierungsnummer für Finanzdienstleistungen: 123456.",
    "footer.legal2":
      "Berechtigte Einlagen sind durch das Financial Services Compensation Scheme (FSCS) bis zu £85.000 pro Person geschützt. Diese Website ist für die Nutzung im Vereinigten Königreich vorgesehen.",
    "footer.copyright": "© Lumina Group 2025–2026. Alle Rechte vorbehalten.",
    // Dashboard
    "dashboard.totalBalance": "Gesamtguthaben",
    "dashboard.hello": "Hallo, {name}",
    "dashboard.across": "Über {count}",
    "dashboard.account": "Konto",
    "dashboard.accounts": "Konten",
    "dashboard.quickAction.send": "Senden",
    "dashboard.quickAction.pay": "Zahlen",
    "dashboard.quickAction.topUp": "Aufladen",
    "dashboard.quickAction.more": "Mehr",
    "dashboard.yourAccounts": "Ihre Konten",
    "dashboard.viewAll": "Alle anzeigen",
    "dashboard.recentTransactions": "Letzte Transaktionen",
    "dashboard.noTransactions": "Keine aktuellen Transaktionen",
    "dashboard.savingsGoals": "Sparziele",
    "dashboard.target": "Ziel:",
    // Profile
    "profile.language": "Sprache",
    "profile.selectLanguage": "Sprache auswählen",
    "profile.languageHint": "Ihre bevorzugte Sprache für die Lumina-App",
    // Language names
    "lang.EN": "Englisch",
    "lang.ES": "Spanisch",
    "lang.FR": "Französisch",
    "lang.PT": "Portugiesisch",
    "lang.DE": "Deutsch",
    // Auth — Login
    "auth.login.heading": "Online-Banking anmelden",
    "auth.login.subheading": "Geben Sie Ihre E-Mail und Ihr Passwort ein, um auf Ihr Konto zuzugreifen.",
    "auth.login.emailLabel": "E-Mail-Adresse",
    "auth.login.passwordLabel": "Passwort",
    "auth.login.submit": "Anmelden",
    "auth.login.forgotPassword": "Zugangsdaten vergessen?",
    "auth.login.newUser": "Neu bei Lumina Bank?",
    "auth.login.register": "Registrieren",
    "auth.login.securityTitle": "Sicherheitshinweis: ",
    "auth.login.securityBody": "Die Lumina Bank wird Sie nie nach Ihrem vollständigen Passwort fragen. Stellen Sie immer sicher, dass Sie auf der richtigen Website sind, bevor Sie sich anmelden.",
    "auth.login.invalidCredentials": "Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.",
    // Auth — Register
    "auth.register.heading": "Konto erstellen",
    "auth.register.subheading": "Registrieren Sie sich bei Lumina Bank — dauert weniger als 5 Minuten.",
    "auth.register.firstName": "Vorname",
    "auth.register.lastName": "Nachname",
    "auth.register.gender": "Geschlecht",
    "auth.register.genderOptional": "(optional)",
    "auth.register.genderMale": "Männlich",
    "auth.register.genderFemale": "Weiblich",
    "auth.register.genderOther": "Keine Angabe",
    "auth.register.email": "E-Mail-Adresse",
    "auth.register.phone": "Telefonnummer",
    "auth.register.password": "Passwort",
    "auth.register.passwordHint": "Mindestens 8 Zeichen",
    "auth.register.confirmPassword": "Passwort bestätigen",
    "auth.register.submit": "Registrieren",
    "auth.register.alreadyHaveAccount": "Haben Sie bereits ein Konto?",
    "auth.register.logOn": "Anmelden",
    "auth.register.gdprNotice": "Mit der Registrierung stimmen Sie unseren Allgemeinen Geschäftsbedingungen und Datenschutzrichtlinien zu. Ihre Daten sind nach dem britischen DSGVO geschützt.",
    "auth.register.failed": "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    // Auth — Forgot
    "auth.forgot.heading": "Zugangsdaten vergessen?",
    "auth.forgot.subheading": "Geben Sie Ihre registrierte E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.",
    "auth.forgot.emailLabel": "E-Mail-Adresse",
    "auth.forgot.submit": "Link zum Zurücksetzen senden",
    "auth.forgot.backToLogin": "Zurück zur Anmeldung",
    "auth.forgot.successHeading": "Überprüfen Sie Ihre E-Mail",
    "auth.forgot.successBody": "Wenn ein Konto mit dieser E-Mail existiert, haben wir einen Link zum Zurücksetzen gesendet. Prüfen Sie Ihren Posteingang.",
    // Auth — Verify
    "auth.verify.heading": "Bestätigen Sie Ihre E-Mail",
    "auth.verify.body": "Wir haben einen Bestätigungslink an {email} gesendet. Bitte prüfen Sie Ihren Posteingang und klicken Sie auf den Link, um Ihr Konto zu aktivieren.",
    "auth.verify.resend": "E-Mail erneut senden",
    "auth.verify.backToLogin": "Zurück zur Anmeldung",
    "auth.verify.verifying": "Wird überprüft…",
    "auth.verify.success": "E-Mail bestätigt!",
    "auth.verify.successBody": "Ihr Konto wurde bestätigt. Sie können sich jetzt anmelden.",
    "auth.verify.tokenExpired": "Dieser Link ist abgelaufen. Bitte fordern Sie einen neuen an.",
    // Auth — Reset
    "auth.reset.heading": "Passwort zurücksetzen",
    "auth.reset.newPassword": "Neues Passwort",
    "auth.reset.confirmPassword": "Neues Passwort bestätigen",
    "auth.reset.submit": "Passwort zurücksetzen",
    "auth.reset.tokenMissing": "Ungültiger oder fehlender Zurücksetz-Token.",
    "auth.reset.success": "Passwort erfolgreich zurückgesetzt.",
    "auth.reset.successBody": "Ihr Passwort wurde aktualisiert. Sie können sich jetzt mit Ihrem neuen Passwort anmelden.",
    // Accounts
    "accounts.myAccounts": "Meine Konten",
    "accounts.openAccount": "Konto Eröffnen",
    "accounts.totalBalance": "Gesamtguthaben",
    "accounts.available": "verfügbar",
    "accounts.noAccounts": "Keine Konten gefunden",
    "accounts.noAccountsDesc": "Ihre Konten werden hier angezeigt, sobald sie eingerichtet sind.",
    "accounts.openNew": "Ein neues Konto eröffnen",
    "accounts.savings": "Sparkonto",
    "accounts.savingsDesc": "Verdienen Sie Zinsen auf Ihre Ersparnisse mit einfachem Zugang.",
    "accounts.business": "Geschäftskonto",
    "accounts.businessDesc": "Dediziertes Konto für Geschäftstransaktionen.",
    "accounts.fixedDeposit": "Festgeld",
    "accounts.fixedDepositDesc": "Sichern Sie einen höheren Zinssatz für eine feste Laufzeit.",
    "accounts.current": "Girokonto",
    "accounts.currentDesc": "Tägliche Ausgaben und Lastschriften.",
    "accounts.opening": "Konto wird eröffnet…",
    "accounts.open": "Konto eröffnen",
    "accounts.opened": "Konto eröffnet!",
    "accounts.openedDesc": "Ihr {label} wurde erfolgreich erstellt.",
    "accounts.done": "Fertig",
    "accounts.couldNotLoad": "Konten konnten nicht geladen werden.",
    "accounts.couldNotOpen": "Konto konnte nicht eröffnet werden. Bitte versuchen Sie es erneut.",
    // Cards
    "cards.myCards": "Meine Karten",
    "cards.totalCards": "Karten gesamt",
    "cards.active": "Aktiv",
    "cards.frozen": "Gesperrt",
    "cards.noCards": "Keine Karten gefunden",
    "cards.noCardsDesc": "Ihre Debit- und Kreditkarten werden hier angezeigt.",
    "cards.spendingLimits": "Ausgabenlimits",
    "cards.daily": "Täglich",
    "cards.monthly": "Monatlich",
    "cards.perTxn": "Pro Transaktion",
    "cards.controls": "Karteneinstellungen",
    "cards.online": "Online-Zahlungen",
    "cards.contactless": "Kontaktlos",
    "cards.international": "International",
    "cards.atm": "Geldautomaten-Abhebungen",
    "cards.freeze": "Sperren",
    "cards.unfreeze": "Entsperren",
    "cards.details": "Details",
    "cards.blockedMessage": "Diese Karte ist gesperrt. Bitte kontaktieren Sie den Kundendienst.",
    "cards.couldNotLoad": "Karten konnten nicht geladen werden.",
    "cards.couldNotUpdate": "Kartenstatus konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.",
    "cards.statusActive": "Aktiv",
    "cards.statusFrozen": "Gesperrt",
    "cards.statusBlocked": "Blockiert",
    // Transactions
    "transactions.title": "Transaktionen",
    "transactions.loaded": "Geladen",
    "transactions.credits": "Gutschriften",
    "transactions.debits": "Belastungen",
    "transactions.all": "alle",
    "transactions.debit": "Lastschrift",
    "transactions.credit": "Gutschrift",
    "transactions.filters": "Filter",
    "transactions.clearFilters": "Alle Filter löschen",
    "transactions.category": "Kategorie",
    "transactions.from": "Von",
    "transactions.to": "Bis",
    "transactions.noTransactions": "Keine Transaktionen",
    "transactions.noTransactionsDesc": "Keine Transaktionen entsprechen den ausgewählten Filtern.",
    "transactions.loadMore": "Weitere Transaktionen laden",
    "transactions.export": "CSV",
    "transactions.refresh": "Aktualisieren",
    "transactions.couldNotLoad": "Transaktionen konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
  },
};

export default translations;
