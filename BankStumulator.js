const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const accounts = [];

// Function to generate a random account number
function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// API endpoint to open a new account
app.post('/openAccount', (req, res) => {
  const newAccount = {
    name: req.body.name,
    gender: req.body.gender,
    dob: req.body.dob,
    email: req.body.email,
    mobile: req.body.mobile,
    address: req.body.address,
    adharNo: req.body.adharNo,
    panNo: req.body.panNo,
    accountNumber: generateAccountNumber(),
    balance: 0,
    kycVerified: false,
    transactions: [],
  };
  console.log(newAccount);

  accounts.push(newAccount);
  console.log(accounts);

  res.status(201).json(newAccount);
});

// API endpoint to update KYC status
app.patch('/updateKYC/:accountNumber', (req, res) => {
  const accountNumber = req.params.accountNumber;
  const account = accounts.find((acc) => acc.accountNumber === accountNumber);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  account.kycVerified = true;
  account.name = req.body.name;
  account.gender = req.body.gender;
  account.dob = req.body.dob;
  account.email = req.body.email;
  account.mobile = req.body.mobile;
  account.address = req.body.address;
  account.adharNo = req.body.adharNo;
  account.panNo = req.body.panNo;
  res.json(account);
});

// API endpoint to deposit money
app.post('/depositMoney/:accountNumber', (req, res) => {
  const accountNumber = req.params.accountNumber;
  const amount = req.body.amount;

  const account = accounts.find((acc) => acc.accountNumber === accountNumber);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  account.balance += amount;
  account.transactions.push({ type: 'Deposit', amount });

  res.json(account);
});

// API endpoint to withdraw money
app.post('/withdrawMoney/:accountNumber', (req, res) => {
  const accountNumber = req.params.accountNumber;
  const amount = req.body.amount;

  const account = accounts.find((acc) => acc.accountNumber === accountNumber);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  if (account.balance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  account.balance -= amount;
  account.transactions.push({ type: 'Withdrawal', amount });

  res.json(account);
});

// API endpoint to transfer money
app.post('/transferMoney/:fromAccountNumber', (req, res) => {
  //made a account number to transfer a amount to make easier
  const fromAccountNumber = req.params.fromAccountNumber;
  const toAccountNumber = req.body.toAccountNumber;
  const amount = req.body.amount;

  const fromAccount = accounts.find(
    (acc) => acc.accountNumber === fromAccountNumber
  );
  const toAccount = accounts.find(
    (acc) => acc.accountNumber === toAccountNumber
  );

  if (!fromAccount || !toAccount) {
    return res.status(404).json({ error: 'Account not found' });
  }

  if (fromAccount.balance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  fromAccount.balance -= amount;
  fromAccount.transactions.push({
    type: `Transfer to ${toAccountNumber}`,
    amount,
  });

  toAccount.balance += amount;
  toAccount.transactions.push({
    type: `Transfer from ${fromAccountNumber}`,
    amount,
  });

  res.json({ fromAccount, toAccount });
});

// API endpoint to receive money
app.post('/receiveMoney/:accountNumber', (req, res) => {
  const accountNumber = req.params.accountNumber;
  const amount = req.body.amount;

  const account = accounts.find((acc) => acc.accountNumber === accountNumber);

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  account.balance += amount;
  account.transactions.push({ type: 'Received', amount });

  res.json(account);
});

// API endpoint to print account statement
app.get('/printStatement/:accountNumber', (req, res) => {
  const accountNumber = req.params.accountNumber;
  const account = accounts.find((acc) => acc.accountNumber === accountNumber);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  res.json(account.transactions);
});

// API endpoint to close an account
app.delete('/closeAccount/:accountNumber', (req, res) => {
  const accountNumber = req.params.accountNumber;

  const accountIndex = accounts.findIndex(
    (acc) => acc.accountNumber === accountNumber
  );

  if (accountIndex === -1) {
    return res.status(404).json({ error: 'Account not found' });
  }

  accounts.splice(accountIndex, 1);
  res.json({ message: 'Account closed successfully' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
