import { query, pool } from "../lib/utils.js";

const MAX_BALANCE = 2147483647; //This max balance is as a result of mysql int entry limit

export async function createAccount(userId) {
  const sql = `
    INSERT INTO accounts (user_id, balance)
    VALUES (?, ?)
  `;

  const params = [userId, 0];
  const result = await query(sql, params);

  return {
    id: result.insertId,
    userId,
    amount: 0,
  };
}

export async function getAccountByUserId(userId) {
  const sql = `
    SELECT id, user_id, balance
    FROM accounts
    WHERE user_id = ?
    LIMIT 1
  `;

  const accounts = await query(sql, [userId]);

  return accounts[0];
}

// Deposit money and record the transaction atomically.
export async function depositToAccount(userId, amount) {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    // Find and lock the user's account.
    const [accounts] = await connection.execute(
      `
        SELECT id, balance
        FROM accounts
        WHERE user_id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [userId],
    );

    const account = accounts[0];

    if (!account) {
      throw new Error("Account not found");
    }

    // Prevent the account balance from exceeding MySQL INT maximum.
    if (amount > MAX_BALANCE - account.balance) {
      throw new Error("Account balance limit exceeded");
    }

    // Update the account balance.
    await connection.execute(
      `
        UPDATE accounts
        SET balance = balance + ?
        WHERE id = ?
      `,
      [amount, account.id],
    );

    // Record the deposit.
    await connection.execute(
      `
        INSERT INTO transactions (account_id, type, amount, status)
        VALUES (?, ?, ?, ?)
      `,
      [account.id, "deposit", amount, "completed"],
    );

    await connection.commit();
    transactionStarted = false;

    return {
      accountId: account.id,
      amount: account.balance + amount,
    };
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }

    throw error;
  } finally {
    connection.release();
  }
}

// Retrieve transaction history belonging to a specific user.
export async function getTransactionsByUserId(userId) {
  const sql = `
    SELECT
      transactions.id,
      transactions.type,
      transactions.amount,
      transactions.status,
      transactions.created_at
    FROM transactions
    INNER JOIN accounts
      ON transactions.account_id = accounts.id
    WHERE accounts.user_id = ?
    ORDER BY transactions.created_at DESC, transactions.id DESC
  `;

  return await query(sql, [userId]);
}
